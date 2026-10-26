import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
	type DatabaseViewSort,
} from "@/entities/database/model/database.types";

export const SORTABLE_PROPERTY_TYPES: ReadonlySet<PropertyType> = new Set([
	PropertyType.TITLE,
	PropertyType.TEXT,
	PropertyType.NUMBER,
	PropertyType.SELECT,
	PropertyType.STATUS,
	PropertyType.DATE,
	PropertyType.CHECKBOX,
	PropertyType.URL,
	PropertyType.EMAIL,
	PropertyType.PHONE,
]);

type SortKey = string | number | null;

const textCollator = new Intl.Collator("vi", {
	sensitivity: "base",
	numeric: true,
});

function toSortKey(property: DatabaseProperty, value: unknown): SortKey {
	switch (property.type) {
		case PropertyType.NUMBER:
			return typeof value === "number" && Number.isFinite(value) ? value : null;

		case PropertyType.CHECKBOX:
			return value === true ? 1 : 0;

		case PropertyType.DATE: {
			const start =
				value && typeof value === "object" && "start" in value
					? (value as { start?: unknown }).start
					: null;
			const time = typeof start === "string" ? Date.parse(start) : NaN;
			return Number.isNaN(time) ? null : time;
		}

		case PropertyType.SELECT:
		case PropertyType.STATUS: {
			const options = [...property.options].sort(
				(a, b) => Number(a.position) - Number(b.position),
			);
			const index = options.findIndex((option) => option.id === value);
			return index === -1 ? null : index;
		}

		default:
			return typeof value === "string" && value.trim() ? value : null;
	}
}

function compareKeys(a: SortKey, b: SortKey): number {
	if (typeof a === "number" && typeof b === "number") return a - b;
	return textCollator.compare(String(a), String(b));
}

export function sortRows(
	rows: DatabaseRow[],
	properties: DatabaseProperty[],
	sorts: DatabaseViewSort[] | undefined,
): DatabaseRow[] {
	const propertyById = new Map(properties.map((property) => [property.id, property]));
	const activeSorts = (sorts ?? []).flatMap((sort) => {
		const property = propertyById.get(sort.propertyId);
		return property && SORTABLE_PROPERTY_TYPES.has(property.type)
			? [{ property, factor: sort.direction === "desc" ? -1 : 1 }]
			: [];
	});

	if (activeSorts.length === 0) return rows;

	const keyed = rows.map((row) => {
		const values = new Map(row.values.map((item) => [item.propertyId, item.value]));
		return {
			row,
			keys: activeSorts.map(({ property }) =>
				toSortKey(property, values.get(property.id)),
			),
		};
	});

	keyed.sort((left, right) => {
		for (let index = 0; index < activeSorts.length; index += 1) {
			const a = left.keys[index];
			const b = right.keys[index];

			if (a === b) continue;
			if (a === null) return 1;
			if (b === null) return -1;

			const result = compareKeys(a, b);
			if (result !== 0) return result * activeSorts[index].factor;
		}
		return 0;
	});

	return keyed.map((item) => item.row);
}
