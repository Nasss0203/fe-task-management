import { describe, expect, it } from "vitest";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	dropPositionAt,
	planBlockDrop,
} from "@/widgets/page-block-editor/lib/plan-block-drop";

const node = (
	id: string,
	parent: string | null = null,
	children: PageBlockNode[] = [],
	type = PageBlockType.TEXT,
	ratio?: number,
) =>
	({
		id,
		page_id: "page-1",
		parent_block_id: parent,
		type,
		style_config: ratio === undefined ? null : { width_ratio: ratio },
		children,
	}) as unknown as PageBlockNode;

// a, toggle(t1), b, row[ col1(c1) | col2(c2) ]
const tree = [
	node("a"),
	node("toggle", null, [node("t1", "toggle")], PageBlockType.TOGGLE),
	node("b"),
	node(
		"row",
		null,
		[
			node("col1", "row", [node("c1", "col1")], PageBlockType.COLUMN, 0.5),
			node("col2", "row", [node("c2", "col2")], PageBlockType.COLUMN, 0.5),
		],
		PageBlockType.COLUMN_LIST,
	),
];

describe("planBlockDrop", () => {
	it("reorders among siblings, counting without the dragged block", () => {
		expect(planBlockDrop(tree, "a", "b", "after")).toEqual({
			type: "move",
			blockId: "a",
			parentId: null,
			index: 2,
		});
		expect(planBlockDrop(tree, "b", "a", "before")).toEqual({
			type: "move",
			blockId: "b",
			parentId: null,
			index: 0,
		});
	});

	it("moves into a toggle or a column by dropping on a block inside it", () => {
		expect(planBlockDrop(tree, "a", "t1", "before")).toMatchObject({
			parentId: "toggle",
			index: 0,
		});
		expect(planBlockDrop(tree, "b", "c2", "after")).toMatchObject({
			parentId: "col2",
			index: 1,
		});
	});

	it("does nothing on itself, inside itself, or back in place", () => {
		expect(planBlockDrop(tree, "a", "a", "after")).toBeNull();
		expect(planBlockDrop(tree, "toggle", "t1", "after")).toBeNull();
		expect(planBlockDrop(tree, "t1", "toggle", "right")).toBeNull();
		expect(planBlockDrop(tree, "b", "toggle", "after")).toBeNull();
	});

	it("puts two blocks side by side; on the left it first moves next to the target", () => {
		expect(planBlockDrop(tree, "a", "b", "right")).toEqual({
			type: "columns",
			blockIds: ["b", "a"],
		});
		expect(planBlockDrop(tree, "a", "b", "left")).toEqual({
			type: "columns",
			blockIds: ["a", "b"],
			moveFirst: { blockId: "a", parentId: null, index: 1 },
		});
	});

	it("adds a column to an existing row, up to five", () => {
		expect(planBlockDrop(tree, "a", "c1", "left")).toEqual({
			type: "add-column",
			columnListId: "row",
			columnIndex: 0,
			widthRatio: 0.5,
			blockId: "a",
		});
		expect(planBlockDrop(tree, "a", "c2", "right")).toMatchObject({ columnIndex: 2 });

		const full = [
			node(
				"row",
				null,
				["1", "2", "3", "4", "5"].map((n) =>
					node(`col${n}`, "row", [node(`c${n}`, `col${n}`)], PageBlockType.COLUMN),
				),
				PageBlockType.COLUMN_LIST,
			),
			node("x"),
		];
		expect(planBlockDrop(full, "x", "c1", "right")).toBeNull();
	});
});

describe("planBlockDrop: a lone block within its own column row (Notion)", () => {
	it("stacks into the other column on its top or bottom half", () => {
		expect(planBlockDrop(tree, "c2", "c1", "before")).toEqual({
			type: "move",
			blockId: "c2",
			parentId: "col1",
			index: 0,
		});
	});

	it("reorders columns from the side edges: a new column there, the old one goes away", () => {
		expect(planBlockDrop(tree, "c2", "c1", "left")).toEqual({
			type: "add-column",
			columnListId: "row",
			columnIndex: 0,
			widthRatio: 0.5,
			blockId: "c2",
		});
		expect(planBlockDrop(tree, "c1", "c2", "right")).toMatchObject({
			type: "add-column",
			columnIndex: 2,
		});
	});

	it("does nothing on the edge right next to its own column", () => {
		expect(planBlockDrop(tree, "c2", "c1", "right")).toBeNull();
		expect(planBlockDrop(tree, "c1", "c2", "left")).toBeNull();
	});

	it("still reorders a full row of five, since one column goes away", () => {
		const full = [
			node(
				"row",
				null,
				["1", "2", "3", "4", "5"].map((n) =>
					node(`col${n}`, "row", [node(`c${n}`, `col${n}`)], PageBlockType.COLUMN),
				),
				PageBlockType.COLUMN_LIST,
			),
		];
		expect(planBlockDrop(full, "c5", "c1", "left")).toMatchObject({
			type: "add-column",
			columnIndex: 0,
		});
	});
});

describe("planBlockDrop: sections", () => {
	const sections = [
		node("s1", null, [node("in1", "s1")], PageBlockType.SECTION),
		node("s2", null, [], PageBlockType.SECTION),
		node("plain"),
	];

	it("moves a block into a section by dropping on a block inside it", () => {
		expect(planBlockDrop(sections, "plain", "in1", "after")).toEqual({
			type: "move",
			blockId: "plain",
			parentId: "s1",
			index: 1,
		});
	});

	it("never puts a section inside another section", () => {
		expect(planBlockDrop(sections, "s2", "in1", "before")).toBeNull();
		expect(planBlockDrop(sections, "s2", "s1", "before")).toEqual({
			type: "move",
			blockId: "s2",
			parentId: null,
			index: 0,
		});
	});
});

describe("dropPositionAt", () => {
	const rect = { left: 0, top: 0, width: 100, height: 20 };

	it("uses the outer edges for columns and the halves for before / after", () => {
		expect(dropPositionAt(rect, { x: 5, y: 10 }, true)).toBe("left");
		expect(dropPositionAt(rect, { x: 95, y: 10 }, true)).toBe("right");
		// Just inside the 10% edge is still above / below.
		expect(dropPositionAt(rect, { x: 12, y: 15 }, true)).toBe("after");
		expect(dropPositionAt(rect, { x: 50, y: 5 }, true)).toBe("before");
		expect(dropPositionAt(rect, { x: 50, y: 15 }, true)).toBe("after");
		expect(dropPositionAt(rect, { x: 5, y: 15 }, false)).toBe("after");
	});
});
