import {
	PropertyType,
	type Database,
	type DatabaseProperty,
	type DatabaseRow,
	type DatabaseViewDetail,
} from "@/entities/database/model/database.types";

/** Properties shown in a view, in view order. Non-hideable ones (Name) always show. */
export function getVisibleProperties(
	database: Database,
	viewDetail: DatabaseViewDetail,
): DatabaseProperty[] {
	const viewProperties = new Map(
		viewDetail.properties.map((item) => [item.propertyId, item]),
	);

	return database.properties
		.filter(
			(property) =>
				!property.isHideable ||
				(viewProperties.get(property.id)?.visible ?? false),
		)
		.sort(
			(a, b) =>
				Number(viewProperties.get(a.id)?.position ?? a.position) -
				Number(viewProperties.get(b.id)?.position ?? b.position),
		);
}

export function getRowValueMap(row: DatabaseRow): Map<string, unknown> {
	return new Map(row.values.map((item) => [item.propertyId, item.value]));
}

export function getTitleProperty(database: Database) {
	return database.properties.find(
		(property) => property.type === PropertyType.TITLE,
	);
}

/** True when a value would render as nothing (used to hide empty card fields). */
export function isEmptyValue(value: unknown): boolean {
	return (
		value === null ||
		value === undefined ||
		value === "" ||
		value === false ||
		(Array.isArray(value) && value.length === 0)
	);
}

/** "yyyy-MM-dd" of a DATE value's start, or null. */
export function getDateKey(value: unknown): string | null {
	if (!value || typeof value !== "object" || !("start" in value)) return null;
	const start = (value as { start?: unknown }).start;
	return typeof start === "string" && start.length >= 10
		? start.slice(0, 10)
		: null;
}

export function getUniqueName(base: string, takenNames: string[]) {
	const taken = new Set(takenNames.map((name) => name.trim().toLowerCase()));
	if (!taken.has(base.toLowerCase())) return base;
	let index = 2;
	while (taken.has(`${base} ${index}`.toLowerCase())) index += 1;
	return `${base} ${index}`;
}
