"use client";

import {
	DndContext,
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
	useEffect,
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
	getIndexInContainer: (containerId: string, taskId: string) => number;
};

const TableDndContext = createContext<TableDndContextValue>({
	items: {},
	getIndexInContainer: () => 0,
});

export const useTableDnd = () => useContext(TableDndContext);

type ProviderSprintDndProps = {
	children: React.ReactNode;
	initialItems: DndColumns;
	onTaskMove: (payload: TaskMovePayload) => void | Promise<void>;
	isMutating?: boolean;
};

function cloneItems(items: DndColumns): DndColumns {
	return Object.fromEntries(
		Object.entries(items).map(([k, v]) => [k, [...v]]),
	);
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
}: ProviderSprintDndProps) {
	const [items, setItems] = useState<DndColumns>(initialItems);
	const itemsRef = useRef<DndColumns>(initialItems);
	const snapshotRef = useRef<DndColumns>({});
	const lastPreviewKeyRef = useRef<string | null>(null);

	useEffect(() => {
		if (isMutating) return;
		itemsRef.current = initialItems;
		setItems(initialItems);
	}, [initialItems, isMutating]);

	const syncItems = useCallback((next: DndColumns) => {
		itemsRef.current = next;
		setItems(next);
	}, []);

	const getIndexInContainer = useCallback(
		(containerId: string, taskId: string) => {
			return itemsRef.current[containerId]?.indexOf(taskId) ?? 0;
		},
		[],
	);

	const contextValue = useMemo(
		() => ({ items, getIndexInContainer }),
		[items, getIndexInContainer],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (_event: DragStartEvent) => {
		snapshotRef.current = cloneItems(itemsRef.current);
		lastPreviewKeyRef.current = null;
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		if (!over) {
			return;
		}

		const previewKey = `${String(active.id)}:${String(over.id)}`;

		if (lastPreviewKeyRef.current === previewKey) {
			return;
		}

		const nextItems = reorderItems(
			itemsRef.current,
			String(active.id),
			String(over.id),
		);

		if (nextItems !== itemsRef.current) {
			lastPreviewKeyRef.current = previewKey;
			syncItems(nextItems);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		lastPreviewKeyRef.current = null;

		if (!over) {
			syncItems(snapshotRef.current);
			return;
		}

		const taskId = String(active.id);
		const snapshot = snapshotRef.current;
		const nextItems = reorderItems(
			itemsRef.current,
			taskId,
			String(over.id),
		);
		syncItems(nextItems);

		const fromContainerId = findContainerByTaskId(snapshot, taskId);
		const toContainerId = findContainerByTaskId(nextItems, taskId);

		if (!fromContainerId || !toContainerId) {
			syncItems(snapshot);
			return;
		}

		const previousIndex = snapshot[fromContainerId]?.indexOf(taskId) ?? -1;
		const nextIndex = nextItems[toContainerId]?.indexOf(taskId) ?? -1;

		if (fromContainerId === toContainerId && previousIndex === nextIndex) {
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

	return (
		<TableDndContext.Provider value={contextValue}>
			<DndContext
				collisionDetection={closestCorners}
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{children}
			</DndContext>
		</TableDndContext.Provider>
	);
}
