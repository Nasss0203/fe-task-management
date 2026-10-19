import type { TemplateBlock } from "@/entities/template";

import type { DemoDatabaseRules } from "./listing-form";

/** Mirrors the backend filter: these are never public in a LIMITED demo. */
export const PRIVATE_DEMO_BLOCK_TYPES = new Set(["FILE"]);
export const PRIVATE_DEMO_PROPERTY_TYPES = new Set(["PERSON", "CREATED_BY", "FILE"]);
export const DEFAULT_DEMO_ROW_LIMIT = 3;

export type DemoSelection = {
	blockIds: string[];
	databases: Record<string, DemoDatabaseRules>;
};

type DatabaseViewRef = { databaseId: string; viewId: string };

export function getDatabaseViewRef(block: TemplateBlock): DatabaseViewRef | null {
	if (block.type !== "DATABASE_VIEW") return null;
	const databaseId = block.data_config?.database_id;
	const viewId = block.data_config?.view_id;
	return typeof databaseId === "string" && typeof viewId === "string"
		? { databaseId, viewId }
		: null;
}

/** The block and every descendant, in snapshot order. */
export function collectSubtree(blocks: TemplateBlock[], rootId: string): TemplateBlock[] {
	const childrenOf = new Map<string, TemplateBlock[]>();
	for (const block of blocks) {
		if (!block.parent_block_id) continue;
		const siblings = childrenOf.get(block.parent_block_id) ?? [];
		siblings.push(block);
		childrenOf.set(block.parent_block_id, siblings);
	}

	const result: TemplateBlock[] = [];
	const seen = new Set<string>();
	const visit = (block: TemplateBlock) => {
		if (seen.has(block.id)) return;
		seen.add(block.id);
		result.push(block);
		for (const child of childrenOf.get(block.id) ?? []) visit(child);
	};
	const root = blocks.find((block) => block.id === rootId);
	if (root) visit(root);
	return result;
}

/**
 * Checking a block also checks its descendants; unchecking removes them.
 * Database view blocks keep the matching database rules in sync.
 */
export function toggleDemoBlock(
	selection: DemoSelection,
	blocks: TemplateBlock[],
	blockId: string,
	checked: boolean,
): DemoSelection {
	const subtree = collectSubtree(blocks, blockId).filter(
		(block) => !PRIVATE_DEMO_BLOCK_TYPES.has(block.type),
	);
	const ids = new Set(selection.blockIds);
	const databases = structuredClone(selection.databases);

	for (const block of subtree) {
		const ref = getDatabaseViewRef(block);
		if (checked) {
			ids.add(block.id);
			if (ref) {
				const rules = databases[ref.databaseId] ?? {
					view_ids: [],
					property_ids: [],
					row_limit: DEFAULT_DEMO_ROW_LIMIT,
				};
				if (!rules.view_ids.includes(ref.viewId)) rules.view_ids.push(ref.viewId);
				databases[ref.databaseId] = rules;
			}
		} else {
			ids.delete(block.id);
			if (ref && databases[ref.databaseId]) {
				const stillUsed = blocks.some(
					(other) =>
						other.id !== block.id &&
						ids.has(other.id) &&
						getDatabaseViewRef(other)?.viewId === ref.viewId,
				);
				if (!stillUsed) {
					const rules = databases[ref.databaseId];
					rules.view_ids = rules.view_ids.filter((id) => id !== ref.viewId);
					if (rules.view_ids.length === 0) delete databases[ref.databaseId];
				}
			}
		}
	}

	// Keep snapshot order so the stored config is stable.
	return {
		blockIds: blocks.filter((block) => ids.has(block.id)).map((block) => block.id),
		databases,
	};
}

export function selectAllDemoBlocks(blocks: TemplateBlock[]): DemoSelection {
	return blocks
		.filter((block) => !block.parent_block_id)
		.reduce<DemoSelection>(
			(selection, root) => toggleDemoBlock(selection, blocks, root.id, true),
			{ blockIds: [], databases: {} },
		);
}

/** Short human label for a block in the picker. */
export function describeBlock(block: TemplateBlock): string {
	const text =
		block.title ||
		(typeof block.content?.text === "string" ? block.content.text : "") ||
		(typeof block.content?.caption === "string" ? block.content.caption : "");
	const clean = String(text).replace(/\s+/g, " ").trim();
	return clean ? clean.slice(0, 80) : BLOCK_TYPE_LABELS[block.type] ?? block.type;
}

export const BLOCK_TYPE_LABELS: Record<string, string> = {
	TEXT: "Text",
	HEADER: "Heading",
	QUOTE: "Quote",
	DIVIDER: "Divider",
	CODE: "Code",
	TODO: "To-do",
	BULLETED_LIST: "Bulleted list",
	NUMBERED_LIST: "Numbered list",
	CALLOUT: "Callout",
	TABLE_OF_CONTENTS: "Table of contents",
	IMAGE: "Image",
	VIDEO: "Video",
	FILE: "File",
	BOOKMARK: "Bookmark",
	EMBED: "Embed",
	FIGMA: "Figma",
	GITHUB_GIST: "Gist",
	GOOGLE_MAPS: "Map",
	TWEET: "Tweet",
	DATABASE_VIEW: "Database",
	TABLE_SIMPLE: "Table",
	MERMAID: "Diagram",
	BUTTON: "Button",
	TOGGLE: "Toggle",
};

export type DemoSummary = {
	shownBlocks: number;
	totalBlocks: number;
	/** Rows visitors get, across databases shown in the demo. */
	shownRows: number;
	totalRows: number;
};

/** Counts for the summary card; rows mirror the backend's row_ids / row_limit rules. */
export function summarizeDemo(
	snapshot: { blocks: TemplateBlock[]; databases: { id: string; rows: unknown[] }[] },
	selection: DemoSelection,
): DemoSummary {
	const selectable = snapshot.blocks.filter(
		(block) => !PRIVATE_DEMO_BLOCK_TYPES.has(block.type),
	);
	const shownIds = new Set(selection.blockIds);
	const shownDatabaseIds = new Set(
		snapshot.blocks
			.filter((block) => shownIds.has(block.id))
			.map((block) => getDatabaseViewRef(block)?.databaseId)
			.filter(Boolean),
	);

	let shownRows = 0;
	let totalRows = 0;
	for (const database of snapshot.databases) {
		totalRows += database.rows.length;
		const rules = selection.databases[database.id];
		if (!rules || !shownDatabaseIds.has(database.id)) continue;
		shownRows += Math.min(
			database.rows.length,
			rules.row_ids ? rules.row_ids.length : (rules.row_limit ?? 0),
		);
	}

	return {
		shownBlocks: selectable.filter((block) => shownIds.has(block.id)).length,
		totalBlocks: selectable.length,
		shownRows,
		totalRows,
	};
}
