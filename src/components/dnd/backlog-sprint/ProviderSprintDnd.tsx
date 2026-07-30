"use client";

import {
	DndContext,
	DragOverlay,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

type DndColumns = Record<string, string[]>;

type TaskMovePayload = {
	taskId: string;
	fromContainerId: string;
	toContainerId: string;
	previousTaskId: string | null;
	nextTaskId: string | null;
};

type TableDndContextValue = {
	items: DndColumns;
	isDragging: boolean;
	getIndexInContainer: (containerId: string, taskId: string) => number;
};

const TableDndContext = createContext<TableDndContextValue>({
	items: {},
	isDragging: false,
	getIndexInContainer: () => 0,
});

export const useTableDnd = () => useContext(TableDndContext);

type ProviderSprintDndProps = {
	children: React.ReactNode;
	initialItems: DndColumns;
	onTaskMove: (payload: TaskMovePayload) => void | Promise<void>;
	isMutating?: boolean;
	renderDragOverlay?: (activeTaskId: string) => React.ReactNode;
};

function cloneItems(items: DndColumns): DndColumns {
	return Object.fromEntries(
		Object.entries(items).map(([k, v]) => [k, [...v]]),
	);
}

function areItemsEqual(a: DndColumns, b: DndColumns) {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	for (const key of aKeys) {
		const aValues = a[key] ?? [];
		const bValues = b[key] ?? [];

		if (aValues.length !== bValues.length) {
			return false;
		}

		for (let index = 0; index < aValues.length; index += 1) {
			if (aValues[index] !== bValues[index]) {
				return false;
			}
		}
	}

	return true;
}

function findContainerByTaskId(items: DndColumns, taskId: string) {
	for (const [containerId, taskIds] of Object.entries(items)) {
		if (taskIds.includes(taskId)) return containerId;
	}
	return null;
}

function findContainerId(items: DndColumns, id: string) {
	if (id in items) {
		return id;
	}

	for (const [containerId, taskIds] of Object.entries(items)) {
		if (taskIds.includes(id)) return containerId;
	}

	return null;
}

function reorderItems(items: DndColumns, activeId: string, overId: string) {
	const activeContainerId = findContainerId(items, activeId);
	const overContainerId = findContainerId(items, overId);

	if (!activeContainerId || !overContainerId) {
		return items;
	}

	if (activeContainerId === overContainerId) {
		const activeIndex = items[activeContainerId].indexOf(activeId);
		const overIndex =
			overId in items
				? items[overContainerId].length - 1
				: items[overContainerId].indexOf(overId);

		if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
			return items;
		}

		return {
			...items,
			[activeContainerId]: arrayMove(
				items[activeContainerId],
				activeIndex,
				overIndex,
			),
		};
	}

	const activeIndex = items[activeContainerId].indexOf(activeId);

	if (activeIndex < 0) {
		return items;
	}

	const nextSourceItems = items[activeContainerId].filter((id) => id !== activeId);
	const overIndex =
		overId in items
			? items[overContainerId].length
			: items[overContainerId].indexOf(overId);
	const insertionIndex = overIndex < 0 ? items[overContainerId].length : overIndex;

	return {
		...items,
		[activeContainerId]: nextSourceItems,
		[overContainerId]: [
			...items[overContainerId].slice(0, insertionIndex),
			activeId,
			...items[overContainerId].slice(insertionIndex),
		],
	};
}

function findTaskNeighbors(
	items: DndColumns,
	containerId: string,
	taskId: string,
) {
	const taskIds = items[containerId] ?? [];
	const taskIndex = taskIds.indexOf(taskId);

	if (taskIndex < 0) {
		return null;
	}

	return {
		previousTaskId: taskIndex > 0 ? taskIds[taskIndex - 1] : null,
		nextTaskId:
			taskIndex < taskIds.length - 1 ? taskIds[taskIndex + 1] : null,
	};
}

export function ProviderSprintDnd({
	children,
	initialItems,
	onTaskMove,
	isMutating = false,
	renderDragOverlay,
}: ProviderSprintDndProps) {
	const [previewItems, setPreviewItems] = useState<DndColumns | null>(null);
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
	const items =
		previewItems &&
		(activeTaskId !== null || !areItemsEqual(previewItems, initialItems))
			? previewItems
			: initialItems;
	const itemsRef = useRef<DndColumns>(initialItems);
	const snapshotRef = useRef<DndColumns>({});
	const lastPreviewKeyRef = useRef<string | null>(null);
	const previewFrameRef = useRef<number | null>(null);
	const pendingPreviewRef = useRef<{
		activeId: string;
		overId: string;
	} | null>(null);

	const syncItems = useCallback((next: DndColumns | null) => {
		const resolvedItems = next ?? initialItems;
		itemsRef.current = resolvedItems;
		setPreviewItems(next);
	}, [initialItems]);

	const resetPreview = useCallback(() => {
		lastPreviewKeyRef.current = null;
		syncItems(null);
	}, [syncItems]);

	const setPreview = useCallback((next: DndColumns) => {
		itemsRef.current = next;
		setPreviewItems(next);
	}, []);

	const cancelPendingPreview = useCallback(() => {
		pendingPreviewRef.current = null;

		if (previewFrameRef.current !== null) {
			cancelAnimationFrame(previewFrameRef.current);
			previewFrameRef.current = null;
		}
	}, []);

	const flushPreview = useCallback(() => {
		previewFrameRef.current = null;
		const pendingPreview = pendingPreviewRef.current;

		if (!pendingPreview) {
			return;
		}

		pendingPreviewRef.current = null;

		const previewKey = `${pendingPreview.activeId}:${pendingPreview.overId}`;

		if (lastPreviewKeyRef.current === previewKey) {
			return;
		}

		const nextItems = reorderItems(
			itemsRef.current,
			pendingPreview.activeId,
			pendingPreview.overId,
		);

		if (nextItems !== itemsRef.current) {
			lastPreviewKeyRef.current = previewKey;
			setPreview(nextItems);
		}
	}, [setPreview]);

	const schedulePreview = useCallback(
		(activeId: string, overId: string) => {
			pendingPreviewRef.current = { activeId, overId };

			if (previewFrameRef.current !== null) {
				return;
			}

			previewFrameRef.current = requestAnimationFrame(flushPreview);
		},
		[flushPreview],
	);

	const getIndexInContainer = useCallback(
		(containerId: string, taskId: string) => {
			return items[containerId]?.indexOf(taskId) ?? 0;
		},
		[items],
	);

	const contextValue = useMemo(
		() => ({
			items,
			isDragging: activeTaskId !== null,
			getIndexInContainer,
		}),
		[activeTaskId, items, getIndexInContainer],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (_event: DragStartEvent) => {
		if (isMutating) {
			return;
		}

		cancelPendingPreview();
		itemsRef.current = items;
		snapshotRef.current = cloneItems(items);
		lastPreviewKeyRef.current = null;
		setActiveTaskId(String(_event.active.id));
	};

	const handleDragOver = (event: DragOverEvent) => {
		if (isMutating) {
			return;
		}

		const { active, over } = event;

		if (!over) {
			return;
		}

		schedulePreview(String(active.id), String(over.id));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (isMutating) {
			setActiveTaskId(null);
			cancelPendingPreview();
			resetPreview();
			return;
		}

		const { active, over } = event;
		setActiveTaskId(null);
		cancelPendingPreview();

		if (!over) {
			resetPreview();
			return;
		}

		const taskId = String(active.id);
		const snapshot = snapshotRef.current;
		const nextItems = reorderItems(
			itemsRef.current,
			taskId,
			String(over.id),
		);
		setPreview(nextItems);

		const fromContainerId = findContainerByTaskId(snapshot, taskId);
		const toContainerId = findContainerByTaskId(nextItems, taskId);

		if (!fromContainerId || !toContainerId) {
			syncItems(snapshot);
			return;
		}

		const previousIndex = snapshot[fromContainerId]?.indexOf(taskId) ?? -1;
		const nextIndex = nextItems[toContainerId]?.indexOf(taskId) ?? -1;

		if (fromContainerId === toContainerId && previousIndex === nextIndex) {
			resetPreview();
			return;
		}

		const neighbors = findTaskNeighbors(nextItems, toContainerId, taskId);

		if (!neighbors) {
			syncItems(snapshot);
			return;
		}

		void Promise.resolve(
			onTaskMove({
				taskId,
				fromContainerId,
				toContainerId,
				previousTaskId: neighbors.previousTaskId,
				nextTaskId: neighbors.nextTaskId,
			}),
		).catch(() => {
			syncItems(snapshot);
		});
	};

	const handleDragCancel = () => {
		setActiveTaskId(null);
		cancelPendingPreview();
		resetPreview();
	};

	return (
		<TableDndContext.Provider value={contextValue}>
			<DndContext
				collisionDetection={closestCorners}
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragCancel={handleDragCancel}
				onDragEnd={handleDragEnd}
			>
				{children}
				<DragOverlay>
					{activeTaskId && renderDragOverlay
						? renderDragOverlay(activeTaskId)
						: null}
				</DragOverlay>
			</DndContext>
		</TableDndContext.Provider>
	);
}
