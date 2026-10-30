"use client";

import {
	DndContext,
	DragOverlay,
	PointerSensor,
	pointerWithin,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragMoveEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import {
	createContext,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	dropPositionAt,
	planBlockDrop,
	type BlockDropPlan,
	type DropPosition,
} from "../lib/plan-block-drop";
import { useDropPageBlock } from "../model/use-drop-page-block";

interface DropTarget {
	blockId: string;
	position: DropPosition;
	plan: BlockDropPlan;
}

interface BlockDragState {
	draggingId: string | null;
	target: DropTarget | null;
	/** True for a moment after a drop: the click that ends a drag must not open the block menu. */
	justDropped: () => boolean;
}

const BlockDragContext = createContext<BlockDragState | null>(null);

// Nested rows (a toggle and its children) all contain the pointer: the smallest is the one meant.
const deepestUnderPointer: CollisionDetection = (args) =>
	pointerWithin(args).sort((a, b) => {
		const area = (id: typeof a.id) => {
			const rect = args.droppableRects.get(id);
			return rect ? rect.width * rect.height : Infinity;
		};
		return area(a.id) - area(b.id);
	});

function blockLabel(block: PageBlockNode | undefined): string {
	const text = (block?.content as { text?: unknown } | null)?.text;
	return typeof text === "string" && text.trim() ? text : "Block";
}

interface BlockDragProviderProps {
	pageId: string;
	blocks: PageBlockNode[];
	shareToken?: string;
	children: ReactNode;
}

/** Drag a block by its ⋮⋮ handle: above / below to reorder, to a side for columns. */
export function BlockDragProvider({
	pageId,
	blocks,
	shareToken,
	children,
}: BlockDragProviderProps) {
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [target, setTargetState] = useState<DropTarget | null>(null);
	// The drop reads this: state set by the last move may not have rendered yet.
	const targetRef = useRef<DropTarget | null>(null);
	const setTarget = (next: DropTarget | null) => {
		targetRef.current = next;
		setTargetState(next);
	};
	const droppedAt = useRef(0);
	const drop = useDropPageBlock(pageId, shareToken);
	// A small move first, so a plain click on ⋮⋮ still opens the block menu.
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
	);

	const byId = useMemo(() => {
		const map = new Map<string, PageBlockNode>();
		const visit = (nodes: PageBlockNode[]) =>
			nodes.forEach((node) => {
				map.set(node.id, node);
				visit(node.children);
			});
		visit(blocks);
		return map;
	}, [blocks]);

	const handleMove = ({
		active,
		over,
		activatorEvent,
		delta,
	}: DragMoveEvent) => {
		const start = activatorEvent as PointerEvent;
		if (!over || !("clientX" in start)) return setTarget(null);

		const blockId = String(over.id);
		const pointer = { x: start.clientX + delta.x, y: start.clientY + delta.y };
		const position = dropPositionAt(over.rect, pointer, true);
		const plan = planBlockDrop(blocks, String(active.id), blockId, position);
		setTarget(plan ? { blockId, position, plan } : null);
	};

	const reset = () => {
		droppedAt.current = Date.now();
		setDraggingId(null);
		setTarget(null);
	};

	const state = useMemo<BlockDragState>(
		() => ({
			draggingId,
			target,
			justDropped: () => Date.now() - droppedAt.current < 300,
		}),
		[draggingId, target],
	);

	return (
		<BlockDragContext.Provider value={state}>
			<DndContext
				sensors={sensors}
				collisionDetection={deepestUnderPointer}
				onDragStart={({ active }) => setDraggingId(String(active.id))}
				onDragMove={handleMove}
				onDragEnd={() => {
					if (targetRef.current) drop.mutate(targetRef.current.plan);
					reset();
				}}
				onDragCancel={reset}
			>
				{children}
				<DragOverlay dropAnimation={null}>
					{draggingId && (
						<div className='flex max-w-xs items-center gap-1.5 rounded-md border bg-popover px-2 py-1 text-sm shadow-elevated'>
							<GripVertical className='size-3.5 shrink-0 text-muted-foreground' />
							<span className='truncate'>
								{blockLabel(byId.get(draggingId))}
							</span>
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</BlockDragContext.Provider>
	);
}

/**
 * For one editor row: the ⋮⋮ handle props, the drop area ref, and where the
 * drop line shows on it. Outside a provider (read-only lists) nothing drags.
 */
export function useBlockDrag(blockId: string) {
	const state = useContext(BlockDragContext);
	const enabled = state !== null;
	const draggable = useDraggable({ id: blockId, disabled: !enabled });
	const droppable = useDroppable({ id: blockId, disabled: !enabled });
	const indicator =
		state?.target?.blockId === blockId ? state.target.position : null;

	return {
		handleRef: draggable.setActivatorNodeRef,
		handleProps: enabled ? { ...draggable.listeners } : {},
		dragRef: draggable.setNodeRef,
		dropRef: droppable.setNodeRef,
		isDragging: state?.draggingId === blockId,
		indicator,
		justDropped: () => state?.justDropped() ?? false,
	};
}
