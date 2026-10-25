import { describe, expect, it } from "vitest";

import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { groupRows, NO_GROUP_ID } from "@/widgets/database-view/lib/group-rows";

const property = (
	id: string,
	type: PropertyType,
	options: DatabaseProperty["options"] = [],
): DatabaseProperty => ({
	id,
	name: id === "status" ? "Status" : id,
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

const status = property("status", PropertyType.STATUS, [
	{ id: "done", name: "Done", color: "green", position: "2" },
	{ id: "todo", name: "Todo", color: null, position: "0" },
	{ id: "doing", name: "Doing", color: "blue", position: "1" },
]);

describe("groupRows", () => {
	it("groups by option order and keeps empty option groups", () => {
		const groups = groupRows(
			[row("a", { status: "done" }), row("b", { status: "todo" }), row("c", { status: "todo" })],
			status,
		);

		expect(groups.map((group) => [group.name, group.rows.map((r) => r.id)])).toEqual([
			["Todo", ["b", "c"]],
			["Doing", []],
			["Done", ["a"]],
		]);
	});

	it("adds a trailing 'No Status' group only when some rows lack a value", () => {
		const groups = groupRows([row("a", {}), row("b", { status: "deleted-option" })], status);

		expect(groups.at(-1)).toMatchObject({ id: NO_GROUP_ID, name: "No Status" });
		expect(groups.at(-1)?.rows.map((r) => r.id)).toEqual(["a", "b"]);
	});

	it("splits checkbox rows into Checked and Unchecked", () => {
		const groups = groupRows(
			[row("a", { done: true }), row("b", { done: false }), row("c", {})],
			property("done", PropertyType.CHECKBOX),
		);

		expect(groups.map((group) => [group.name, group.rows.map((r) => r.id)])).toEqual([
			["Checked", ["a"]],
			["Unchecked", ["b", "c"]],
		]);
	});
});
