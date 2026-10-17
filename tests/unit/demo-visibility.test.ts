import { describe, expect, it } from "vitest";

import type { TemplateBlock } from "@/entities/template/model/template.types";
import {
	describeBlock,
	selectAllDemoBlocks,
	summarizeDemo,
	toggleDemoBlock,
} from "@/widgets/creator-templates/model/demo-visibility";

function block(
	id: string,
	type: string,
	extra: Partial<TemplateBlock> = {},
): TemplateBlock {
	return {
		id,
		version_id: "v",
		parent_block_id: null,
		type,
		title: null,
		position_x: null,
		position_y: null,
		width: null,
		height: null,
		order_index: 0,
		content: { text: `text ${id}` },
		style_config: null,
		data_config: null,
		created_by: "creator",
		is_open: true,
		created_at: "",
		updated_at: "",
		...extra,
	};
}

const blocks = [
	block("toggle", "TOGGLE"),
	block("child", "TEXT", { parent_block_id: "toggle" }),
	block("attachment", "FILE", { parent_block_id: "toggle" }),
	block("db", "DATABASE_VIEW", {
		data_config: { database_id: "database-1", view_id: "view-1" },
	}),
	block("intro", "TEXT"),
];

const empty = { blockIds: [], databases: {} };

describe("toggleDemoBlock", () => {
	it("checks a block with its descendants but never private blocks", () => {
		const next = toggleDemoBlock(empty, blocks, "toggle", true);
		expect(next.blockIds).toEqual(["toggle", "child"]);
	});

	it("unchecks the whole subtree", () => {
		const selected = toggleDemoBlock(empty, blocks, "toggle", true);
		expect(toggleDemoBlock(selected, blocks, "toggle", false).blockIds).toEqual([]);
	});

	it("adds database rules with the block's view and removes them again", () => {
		const selected = toggleDemoBlock(empty, blocks, "db", true);
		expect(selected.databases).toEqual({
			"database-1": { view_ids: ["view-1"], property_ids: [], row_limit: 3 },
		});
		expect(toggleDemoBlock(selected, blocks, "db", false).databases).toEqual({});
	});

	it("does not mutate the previous selection", () => {
		const selected = toggleDemoBlock(empty, blocks, "db", true);
		const snapshot = JSON.stringify(selected);
		toggleDemoBlock(selected, blocks, "db", false);
		expect(JSON.stringify(selected)).toBe(snapshot);
	});
});

describe("selectAllDemoBlocks", () => {
	it("selects every non-private block in snapshot order", () => {
		expect(selectAllDemoBlocks(blocks).blockIds).toEqual([
			"toggle",
			"child",
			"db",
			"intro",
		]);
	});
});

describe("describeBlock", () => {
	it("prefers text and falls back to the block type", () => {
		expect(describeBlock(block("a", "TEXT"))).toBe("text a");
		expect(describeBlock(block("b", "DIVIDER", { content: null }))).toBe("Divider");
	});
});

describe("summarizeDemo", () => {
	it("counts shown blocks (excluding private ones) and rows of shown databases", () => {
		const selection = toggleDemoBlock(empty, blocks, "db", true);
		const summary = summarizeDemo(
			{ blocks, databases: [{ id: "database-1", rows: [1, 2, 3, 4, 5] }] },
			selection,
		);
		expect(summary).toEqual({ shownBlocks: 1, totalBlocks: 4, shownRows: 3, totalRows: 5 });
	});

	it("ignores rules for databases whose block is hidden", () => {
		const summary = summarizeDemo(
			{ blocks, databases: [{ id: "database-1", rows: [1, 2] }] },
			{
				blockIds: [],
				databases: { "database-1": { view_ids: ["view-1"], property_ids: [], row_limit: 2 } },
			},
		);
		expect(summary.shownRows).toBe(0);
	});
});
