"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
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

	return (
		<TableDndContext.Provider value={contextValue}>
			<DragDropProvider
				onDragStart={() => {
					snapshotRef.current = cloneItems(itemsRef.current);
				}}
				onDragOver={(event) => {
					const { source } = event.operation;
					if (!source) return;
					const nextItems = move(itemsRef.current, event);
					syncItems(nextItems);
				}}
				onDragEnd={(event) => {
					const { source } = event.operation;
					if (!source) return;

					if (event.canceled) {
						syncItems(snapshotRef.current);
						return;
					}

					const taskId = String(source.id);
					const snapshot = snapshotRef.current;
					const nextItems = itemsRef.current;

					const fromContainerId = findContainerByTaskId(
						snapshot,
						taskId,
					);
					const toContainerId = findContainerByTaskId(
						nextItems,
						taskId,
					);

					if (!fromContainerId || !toContainerId) {
						syncItems(snapshot);
						return;
					}

					const previousIndex =
						snapshot[fromContainerId]?.indexOf(taskId) ?? -1;
					const nextIndex =
						nextItems[toContainerId]?.indexOf(taskId) ?? -1;

					if (
						fromContainerId === toContainerId &&
						previousIndex === nextIndex
					) {
						return;
					}

					const neighbors = findTaskNeighbors(
						nextItems,
						toContainerId,
						taskId,
					);

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
				}}
			>
				{children}
			</DragDropProvider>
		</TableDndContext.Provider>
	);
}
