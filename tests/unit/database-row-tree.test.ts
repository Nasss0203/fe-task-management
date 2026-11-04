import { describe, expect, it } from "vitest";

import {
	PropertyType,
	type Database,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import {
	flattenRowTree,
	getSubtaskProgress,
} from "@/widgets/database-view/lib/row-tree";

const row = (
	id: string,
	parentRowId: string | null = null,
	values: Record<string, unknown> = {},
): DatabaseRow => ({
	id,
	databaseId: "db",
	parentRowId,
	values: Object.entries(values).map(([propertyId, value]) => ({
		id: `${id}-${propertyId}`,
		propertyId,
		value,
	})),
});

const database = (types: PropertyType[]): Database => ({
	id: "db",
	pageId: "page",
	name: "Tasks",
	properties: types.map((type) => ({
		id: type.toLowerCase(),
		name: type,
		type,
		isDefault: false,
		isHideable: true,
		position: "0",
		options:
			type === PropertyType.STATUS
				? [
						{ id: "done", name: "Done", color: null, position: "2" },
						{ id: "todo", name: "Todo", color: null, position: "0" },
					]
				: [],
	})),
});

const shape = (items: ReturnType<typeof flattenRowTree>) =>
	items.map((item) => `${item.row.id}:${item.depth}${item.dimmed ? "~" : ""}`);

describe("flattenRowTree", () => {
	// a ─ b ─ c, x on its own; rows come in the view's sort order
	const all = [row("c", "b"), row("x"), row("a"), row("b", "a")];

	it("places each sub-task right under its parent", () => {
		expect(shape(flattenRowTree(all, all))).toEqual(["x:0", "a:0", "b:1", "c:2"]);
	});

	it("hides the sub-tasks of a collapsed row", () => {
		expect(shape(flattenRowTree(all, all, new Set(["b"])))).toEqual([
			"x:0",
			"a:0",
			"b:1",
		]);
	});

	it("keeps filtered-out parents, dimmed, above a matching sub-task", () => {
		expect(shape(flattenRowTree([row("c", "b")], all))).toEqual([
			"a:0~",
			"b:1~",
			"c:2",
		]);
	});

	it("treats a row whose parent is missing as top-level and survives a loop", () => {
		const broken = [row("p", "q"), row("q", "p"), row("o", "gone")];
		expect(shape(flattenRowTree(broken, broken))).toEqual(["o:0"]);
	});
});

describe("getSubtaskProgress", () => {
	const rows = [
		row("a"),
		row("b", "a", { status: "done", checkbox: true }),
		row("c", "a", { status: "todo" }),
	];

	it("counts sub-tasks at the last Status option as done", () => {
		expect(
			getSubtaskProgress(database([PropertyType.STATUS]), rows, "a"),
		).toBe("1/2");
	});

	it("falls back to a Checkbox, then to a plain count", () => {
		expect(
			getSubtaskProgress(database([PropertyType.CHECKBOX]), rows, "a"),
		).toBe("1/2");
		expect(getSubtaskProgress(database([]), rows, "a")).toBe("2");
		expect(getSubtaskProgress(database([]), rows, "b")).toBeNull();
	});
});
