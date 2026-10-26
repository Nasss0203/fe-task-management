import {
	PropertyType,
	type DatabaseProperty,
	type DatabaseRow,
	type DatabaseViewFilter,
} from "@/entities/database/model/database.types";

export const MAX_FILTERS = 10;

const TEXT = ["contains", "not_contains", "equals", "is_empty", "is_not_empty"];
const EMPTY = ["is_empty", "is_not_empty"];

export const FILTER_OPERATORS: Partial<Record<PropertyType, readonly string[]>> = {
	[PropertyType.TITLE]: TEXT,
	[PropertyType.TEXT]: TEXT,
	[PropertyType.URL]: TEXT,
	[PropertyType.EMAIL]: TEXT,
	[PropertyType.PHONE]: TEXT,
	[PropertyType.NUMBER]: ["eq", "neq", "gt", "gte", "lt", "lte", ...EMPTY],
	[PropertyType.SELECT]: ["is", "is_not", ...EMPTY],
	[PropertyType.STATUS]: ["is", "is_not", ...EMPTY],
	[PropertyType.MULTI_SELECT]: ["contains", "not_contains", ...EMPTY],
	[PropertyType.DATE]: ["before", "after", "on", ...EMPTY],
	[PropertyType.CHECKBOX]: ["is_checked", "is_unchecked"],
};

export const VALUELESS_OPERATORS: ReadonlySet<string> = new Set([
	"is_empty",
	"is_not_empty",
	"is_checked",
	"is_unchecked",
]);

export const OPERATOR_LABELS: Record<string, string> = {
	contains: "contains",
	not_contains: "does not contain",
	equals: "is",
	is: "is",
	is_not: "is not",
	eq: "=",
	neq: "≠",
	gt: ">",
	gte: "≥",
	lt: "<",
	lte: "≤",
	before: "is before",
	after: "is after",
	on: "is on",
	is_empty: "is empty",
	is_not_empty: "is not empty",
	is_checked: "is checked",
	is_unchecked: "is unchecked",
};

function normalize(text: string) {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
}

function isEmpty(value: unknown) {
	return (
		value === null ||
		value === undefined ||
		(typeof value === "string" && !value.trim()) ||
		(Array.isArray(value) && value.length === 0)
	);
}

function dayOf(value: unknown): string | null {
	const start =
		value && typeof value === "object" && "start" in value
			? (value as { start?: unknown }).start
			: null;
	return typeof start === "string" && start.length >= 10 ? start.slice(0, 10) : null;
}

function matches(
	property: DatabaseProperty,
	filter: DatabaseViewFilter,
	value: unknown,
): boolean {
	const { operator, value: target } = filter;

	if (operator === "is_empty") return isEmpty(value);
	if (operator === "is_not_empty") return !isEmpty(value);
	if (operator === "is_checked") return value === true;
	if (operator === "is_unchecked") return value !== true;

	switch (property.type) {
		case PropertyType.NUMBER: {
			if (typeof value !== "number" || typeof target !== "number") return false;
			if (operator === "eq") return value === target;
			if (operator === "neq") return value !== target;
			if (operator === "gt") return value > target;
			if (operator === "gte") return value >= target;
			if (operator === "lt") return value < target;
			if (operator === "lte") return value <= target;
			return true;
		}

		case PropertyType.SELECT:
		case PropertyType.STATUS:
			return operator === "is" ? value === target : value !== target;

		case PropertyType.MULTI_SELECT: {
			const has = Array.isArray(value) && value.includes(target);
			return operator === "contains" ? has : !has;
		}

		case PropertyType.DATE: {
			const day = dayOf(value);
			if (!day || typeof target !== "string") return false;
			if (operator === "before") return day < target;
			if (operator === "after") return day > target;
			if (operator === "on") return day === target;
			return true;
		}

		default: {
			const text = normalize(typeof value === "string" ? value : "");
			const needle = normalize(String(target ?? ""));
			if (operator === "equals") return text.trim() === needle.trim();
			if (operator === "contains") return text.includes(needle);
			if (operator === "not_contains") return !text.includes(needle);
			return true;
		}
	}
}

export function filterRows(
	rows: DatabaseRow[],
	properties: DatabaseProperty[],
	filters: DatabaseViewFilter[] | undefined,
): DatabaseRow[] {
	const propertyById = new Map(properties.map((property) => [property.id, property]));
	const active = (filters ?? []).filter((filter) => {
		const property = propertyById.get(filter.propertyId);
		const complete =
			VALUELESS_OPERATORS.has(filter.operator) ||
			(filter.value !== null && filter.value !== undefined && filter.value !== "");
		return (
			complete &&
			property &&
			FILTER_OPERATORS[property.type]?.includes(filter.operator)
		);
	});

	if (active.length === 0) return rows;

	return rows.filter((row) => {
		const values = new Map(row.values.map((item) => [item.propertyId, item.value]));
		return active.every((filter) =>
			matches(
				propertyById.get(filter.propertyId)!,
				filter,
				values.get(filter.propertyId),
			),
		);
	});
}
