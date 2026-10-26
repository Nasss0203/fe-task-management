import { describe, expect, it } from "vitest";

import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { sortRows } from "@/widgets/database-view/lib/sort-rows";

const property = (
	id: string,
	type: PropertyType,
	options: DatabaseProperty["options"] = [],
): DatabaseProperty => ({
	id,
	name: id,
	type,
	isDefault: false,
	isHideable: true,
	position: "0",
	options,
});

const row = (id: string, values: Record<string, unknown>): DatabaseRow => ({
	id,
	databaseId: "db",
	values: Object.entries(values).map(([propertyId, value]) => ({
		id: `${id}-${propertyId}`,
		propertyId,
		value,
	})),
});

const ids = (rows: DatabaseRow[]) => rows.map((item) => item.id);

const status = property("status", PropertyType.STATUS, [
	{ id: "done", name: "Done", color: null, position: "2" },
	{ id: "todo", name: "Todo", color: null, position: "0" },
	{ id: "doing", name: "Doing", color: null, position: "1" },
]);
const properties = [
	property("title", PropertyType.TITLE),
	property("points", PropertyType.NUMBER),
	property("due", PropertyType.DATE),
	property("tags", PropertyType.MULTI_SELECT),
	status,
];

describe("sortRows", () => {
	it("keeps the original order without sorts", () => {
		const rows = [row("b", {}), row("a", {})];
		expect(sortRows(rows, properties, [])).toBe(rows);
	});

	it("compares numbers numerically and keeps empty values last in both directions", () => {
		const rows = [
			row("nine", { points: 9 }),
			row("empty", {}),
			row("ten", { points: 10 }),
		];

		expect(
			ids(sortRows(rows, properties, [{ propertyId: "points", direction: "asc" }])),
		).toEqual(["nine", "ten", "empty"]);
		expect(
			ids(sortRows(rows, properties, [{ propertyId: "points", direction: "desc" }])),
		).toEqual(["ten", "nine", "empty"]);
	});

	it("orders status by option position, not by name", () => {
		const rows = [
			row("r1", { status: "done" }),
			row("r2", { status: "todo" }),
			row("r3", { status: "doing" }),
		];

		expect(
			ids(sortRows(rows, properties, [{ propertyId: "status", direction: "asc" }])),
		).toEqual(["r2", "r3", "r1"]);
	});

	it("falls through to the next sort on ties and sorts Vietnamese text", () => {
		const rows = [
			row("late-b", { due: { start: "2026-10-28" }, title: "Bàn" }),
			row("early", { due: { start: "2026-10-26" }, title: "Zeta" }),
			row("late-a", { due: { start: "2026-10-28" }, title: "An" }),
		];

		expect(
			ids(
				sortRows(rows, properties, [
					{ propertyId: "due", direction: "asc" },
					{ propertyId: "title", direction: "asc" },
				]),
			),
		).toEqual(["early", "late-a", "late-b"]);
	});

	it("ignores unsortable or deleted properties", () => {
		const rows = [row("b", { tags: ["x"] }), row("a", { tags: ["y"] })];

		expect(
			ids(
				sortRows(rows, properties, [
					{ propertyId: "tags", direction: "asc" },
					{ propertyId: "deleted", direction: "asc" },
				]),
			),
		).toEqual(["b", "a"]);
	});
});
