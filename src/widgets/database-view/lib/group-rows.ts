import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";

export const GROUPABLE_PROPERTY_TYPES: ReadonlySet<PropertyType> = new Set([
	PropertyType.STATUS,
	PropertyType.SELECT,
	PropertyType.CHECKBOX,
]);

export const NO_GROUP_ID = "__no_group__";

export interface RowGroup {
	id: string;
	name: string;
	color: string | null;
	rows: DatabaseRow[];
}

function valueOf(row: DatabaseRow, propertyId: string) {
	return row.values.find((item) => item.propertyId === propertyId)?.value;
}

export function groupRows(
	rows: DatabaseRow[],
	property: DatabaseProperty,
): RowGroup[] {
	if (property.type === PropertyType.CHECKBOX) {
		return [
			{ id: "checked", name: "Checked", color: null, rows: [] as DatabaseRow[] },
			{ id: "unchecked", name: "Unchecked", color: null, rows: [] as DatabaseRow[] },
		].map((group) => ({
			...group,
			rows: rows.filter(
				(row) =>
					(valueOf(row, property.id) === true) === (group.id === "checked"),
			),
		}));
	}

	const options = [...property.options].sort(
		(a, b) => Number(a.position) - Number(b.position),
	);
	const optionIds = new Set(options.map((option) => option.id));
	const groupIdOf = (row: DatabaseRow) => {
		const value = valueOf(row, property.id);
		return typeof value === "string" && optionIds.has(value) ? value : NO_GROUP_ID;
	};

	return [
		...options.map((option) => ({
			id: option.id,
			name: option.name,
			color: option.color,
		})),
		{ id: NO_GROUP_ID, name: `No ${property.name}`, color: null },
	]
		.map((group) => ({
			...group,
			rows: rows.filter((row) => groupIdOf(row) === group.id),
		}))
		.filter((group) => group.id !== NO_GROUP_ID || group.rows.length > 0);
}
