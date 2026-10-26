import { describe, expect, it } from "vitest";

import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { filterRows } from "@/widgets/database-view/lib/filter-rows";

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

const properties = [
	property("title", PropertyType.TITLE),
	property("points", PropertyType.NUMBER),
	property("due", PropertyType.DATE),
	property("tags", PropertyType.MULTI_SELECT),
	property("done", PropertyType.CHECKBOX),
	property("status", PropertyType.STATUS, [
		{ id: "todo", name: "Todo", color: null, position: "0" },
		{ id: "finished", name: "Done", color: null, position: "1" },
	]),
];

const rows = [
	row("plan", { title: "Kế hoạch triển khai", points: 9, due: { start: "2026-10-26" }, status: "todo", tags: ["a"] }),
	row("bug", { title: "Sửa bug đăng nhập", points: 2, due: { start: "2026-10-28T10:00:00.000Z" }, status: "finished", done: true }),
	row("empty", {}),
];

describe("filterRows", () => {
	it("keeps the original rows without filters", () => {
		expect(filterRows(rows, properties, [])).toBe(rows);
	});

	it("matches text without accents or case", () => {
		expect(
			ids(filterRows(rows, properties, [{ propertyId: "title", operator: "contains", value: "KE HOACH" }])),
		).toEqual(["plan"]);
	});

	it("combines conditions with AND, including two on one property", () => {
		expect(
			ids(
				filterRows(rows, properties, [
					{ propertyId: "points", operator: "gt", value: 1 },
					{ propertyId: "points", operator: "lt", value: 5 },
				]),
			),
		).toEqual(["bug"]);
	});

	it("filters status, dates, multi-select, checkbox and emptiness", () => {
		expect(ids(filterRows(rows, properties, [{ propertyId: "status", operator: "is_not", value: "finished" }]))).toEqual(["plan", "empty"]);
		expect(ids(filterRows(rows, properties, [{ propertyId: "due", operator: "before", value: "2026-10-27" }]))).toEqual(["plan"]);
		expect(ids(filterRows(rows, properties, [{ propertyId: "due", operator: "on", value: "2026-10-28" }]))).toEqual(["bug"]);
		expect(ids(filterRows(rows, properties, [{ propertyId: "tags", operator: "contains", value: "a" }]))).toEqual(["plan"]);
		expect(ids(filterRows(rows, properties, [{ propertyId: "done", operator: "is_unchecked" }]))).toEqual(["plan", "empty"]);
		expect(ids(filterRows(rows, properties, [{ propertyId: "title", operator: "is_empty" }]))).toEqual(["empty"]);
	});

	it("ignores a condition that has no value yet", () => {
		expect(
			ids(filterRows(rows, properties, [{ propertyId: "points", operator: "gt", value: null }])),
		).toEqual(["plan", "bug", "empty"]);
	});

	it("ignores filters on deleted properties instead of hiding every row", () => {
		expect(
			ids(filterRows(rows, properties, [{ propertyId: "ghost", operator: "is_empty" }])),
		).toEqual(["plan", "bug", "empty"]);
	});
});
