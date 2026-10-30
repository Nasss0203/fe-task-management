import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

export const MAX_COLUMNS = 5;

/** Where a dragged block lands relative to the block under the pointer. */
export type DropPosition = "before" | "after" | "left" | "right";

/** What the API has to do for one drop; null when the drop does nothing. */
export type BlockDropPlan =
	/** Reorder, or move into another parent (a toggle, a column). */
	| { type: "move"; blockId: string; parentId: string | null; index: number }
	/** Two blocks side by side in a new column row, where `blockIds[0]` is. */
	| {
			type: "columns";
			blockIds: [string, string];
			/** Done first so the dragged block sits right before the target. */
			moveFirst?: { blockId: string; parentId: string | null; index: number };
	  }
	/** One more column in an existing row, with the dragged block in it. */
	| {
			type: "add-column";
			columnListId: string;
			columnIndex: number;
			widthRatio: number;
			blockId: string;
	  };

function indexTree(roots: PageBlockNode[]) {
	const byId = new Map<string, PageBlockNode>();
	const visit = (nodes: PageBlockNode[]) =>
		nodes.forEach((node) => {
			byId.set(node.id, node);
			visit(node.children);
		});
	visit(roots);
	return byId;
}

/** True when `id` is `root` or one of the blocks inside it. */
function isWithin(root: PageBlockNode, id: string): boolean {
	return root.id === id || root.children.some((child) => isWithin(child, id));
}

/** Map pointer to drop zone: the outer 10% sideways makes columns (narrow, so it's deliberate), else top or bottom half. */
export function dropPositionAt(
	rect: { left: number; top: number; width: number; height: number },
	pointer: { x: number; y: number },
	allowSides: boolean,
): DropPosition {
	const x = (pointer.x - rect.left) / rect.width;
	if (allowSides && x < 0.1) return "left";
	if (allowSides && x > 0.9) return "right";
	return pointer.y < rect.top + rect.height / 2 ? "before" : "after";
}

export function planBlockDrop(
	roots: PageBlockNode[],
	draggedId: string,
	targetId: string,
	position: DropPosition,
): BlockDropPlan | null {
	const byId = indexTree(roots);
	const dragged = byId.get(draggedId);
	const target = byId.get(targetId);

	// Nothing to do on itself, and a block can't go inside its own toggle or column.
	if (!dragged || !target || isWithin(dragged, targetId)) return null;

	const parent = target.parent_block_id
		? byId.get(target.parent_block_id)
		: undefined;
	const siblings = parent ? parent.children : roots;

	if (position === "before" || position === "after") {
		if (
			dragged.type === PageBlockType.SECTION &&
			parent?.type === PageBlockType.SECTION
		) {
			return null;
		}

		const others = siblings.filter((block) => block.id !== draggedId);
		const at = others.findIndex((block) => block.id === targetId);
		const index = position === "before" ? at : at + 1;
		const parentId = target.parent_block_id ?? null;

		// Dropped back where it already is.
		const current = siblings.findIndex((block) => block.id === draggedId);
		if (dragged.parent_block_id === target.parent_block_id && current === index)
			return null;

		return { type: "move", blockId: draggedId, parentId, index };
	}

	// A block can't sit beside the block that contains it.
	if (isWithin(target, draggedId)) return null;

	// Beside a block that already sits in a column: one more column in that row.
	if (parent?.type === PageBlockType.COLUMN) {
		const row = parent.parent_block_id
			? byId.get(parent.parent_block_id)
			: undefined;
		if (!row) return null;

		const columnAt = row.children.findIndex(
			(column) => column.id === parent.id,
		);
		const columnIndex = position === "left" ? columnAt : columnAt + 1;

		// Like Notion, a lone block moved beside another column of its own row
		// reorders the columns: its old column empties and the server removes it.
		const ownColumn = dragged.parent_block_id
			? byId.get(dragged.parent_block_id)
			: undefined;
		const leavesOwnColumn =
			ownColumn?.type === PageBlockType.COLUMN &&
			ownColumn.parent_block_id === row.id &&
			ownColumn.children.length === 1;

		if (leavesOwnColumn) {
			const current = row.children.findIndex((column) => column.id === ownColumn.id);
			// Right next to where it already is: the row would look the same.
			if (columnIndex === current || columnIndex === current + 1) return null;
		} else if (row.children.length >= MAX_COLUMNS) {
			return null;
		}
		const shares = row.children.map((column) => {
			const ratio = column.style_config?.width_ratio;
			return typeof ratio === "number" ? ratio : 1 / row.children.length;
		});

		return {
			type: "add-column",
			columnListId: row.id,
			columnIndex,
			// Same share as an average column, so the new one isn't squeezed.
			widthRatio:
				Math.round(
					(shares.reduce((sum, value) => sum + value, 0) / shares.length) *
						1000,
				) / 1000,
			blockId: draggedId,
		};
	}

	if (position === "right") {
		return { type: "columns", blockIds: [targetId, draggedId] };
	}

	// Left: the row takes the first block's place, so bring the dragged block next to the target first.
	const others = siblings.filter((block) => block.id !== draggedId);
	return {
		type: "columns",
		blockIds: [draggedId, targetId],
		moveFirst: {
			blockId: draggedId,
			parentId: target.parent_block_id ?? null,
			index: others.findIndex((block) => block.id === targetId),
		},
	};
}
