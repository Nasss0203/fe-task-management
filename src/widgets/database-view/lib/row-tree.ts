import {
	PropertyType,
	type Database,
	type DatabaseProperty,
	type DatabaseRow,
} from "@/entities/database/model/database.types";

import { getRowValueMap } from "./view-properties";

/** Sub-tasks deeper than this still show, just without more indentation. */
export const MAX_INDENT_DEPTH = 4;

export interface RowTreeItem {
	row: DatabaseRow;
	depth: number;
	/** Has sub-tasks among the rows being shown (drives the ▸ toggle). */
	hasChildren: boolean;
	/** Didn't match the view's filters; shown only to keep a matching sub-task in its tree. */
	dimmed: boolean;
}

/** Sub-tasks of `rowId`, in the order of `rows`. */
export function getChildRows(
	rows: DatabaseRow[],
	rowId: string,
): DatabaseRow[] {
	return rows.filter((row) => row.parentRowId === rowId);
}

export function flattenRowTree(
	visibleRows: DatabaseRow[],
	allRows: DatabaseRow[],
	collapsedIds: ReadonlySet<string> = new Set(),
): RowTreeItem[] {
	const byId = new Map(allRows.map((row) => [row.id, row]));
	const visibleIds = new Set(visibleRows.map((row) => row.id));

	const shown: DatabaseRow[] = [...visibleRows];
	const shownIds = new Set(visibleIds);
	for (const row of visibleRows) {
		let parent = row.parentRowId ? byId.get(row.parentRowId) : undefined;
		while (parent && !shownIds.has(parent.id)) {
			shown.push(parent);
			shownIds.add(parent.id);
			parent = parent.parentRowId
				? byId.get(parent.parentRowId)
				: undefined;
		}
	}

	const childrenOf = new Map<string | null, DatabaseRow[]>();
	for (const row of shown) {
		const key =
			row.parentRowId && shownIds.has(row.parentRowId)
				? row.parentRowId
				: null;
		childrenOf.set(key, [...(childrenOf.get(key) ?? []), row]);
	}

	const result: RowTreeItem[] = [];
	const visited = new Set<string>();
	const walk = (parentId: string | null, depth: number) => {
		for (const row of childrenOf.get(parentId) ?? []) {
			if (visited.has(row.id)) continue;
			visited.add(row.id);
			const hasChildren = (childrenOf.get(row.id)?.length ?? 0) > 0;
			result.push({
				row,
				depth,
				hasChildren,
				dimmed: !visibleIds.has(row.id),
			});
			if (hasChildren && !collapsedIds.has(row.id))
				walk(row.id, depth + 1);
		}
	};
	walk(null, 0);

	return result;
}

export function getDoneProperty(
	database: Database,
): { property: DatabaseProperty; doneValue: unknown } | null {
	const status = database.properties.find(
		(property) => property.type === PropertyType.STATUS,
	);
	const lastOption = status
		? [...status.options]
				.sort((a, b) => Number(a.position) - Number(b.position))
				.at(-1)
		: undefined;
	if (status && lastOption)
		return { property: status, doneValue: lastOption.id };

	const checkbox = database.properties.find(
		(property) => property.type === PropertyType.CHECKBOX,
	);
	return checkbox ? { property: checkbox, doneValue: true } : null;
}

/** "2/5" (done/total) or "5" when the database has no done marker; null without sub-tasks. */
export function getSubtaskProgress(
	database: Database,
	allRows: DatabaseRow[],
	rowId: string,
): string | null {
	const children = getChildRows(allRows, rowId);
	if (children.length === 0) return null;
	const done = getDoneProperty(database);
	if (!done) return String(children.length);
	const doneCount = children.filter(
		(row) => getRowValueMap(row).get(done.property.id) === done.doneValue,
	).length;
	return `${doneCount}/${children.length}`;
}
