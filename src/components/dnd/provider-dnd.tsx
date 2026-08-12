"use client";

import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import {
	useReorderTaskPosition,
	useTask,
	useTaskStatus,
	useUpdateTask,
} from "@/features/task/hooks/useTask";
import { isTaskVisible } from "@/lib/task-completion";
import type { TaskPositionContextInput } from "@/services/task/type";
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	PointerSensor,
	closestCorners,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	startTransition,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ColumnDnd from "./column-dnd";
import ItemsDnd from "./items-dnd";

type DndColumns = Record<string, string[]>;

type ProviderDragDropProps = {
	workspaceId: string;
	projectId: string;
	className?: string;
	sprintId?: string;
	positionContext?: TaskPositionContextInput;
};

function cloneItems(items: DndColumns): DndColumns {
	return Object.fromEntries(
		Object.entries(items).map(([key, value]) => [key, [...value]]),
	);
}

function findStatusIdByTaskId(items: DndColumns, taskId: string) {
	for (const [statusId, taskIds] of Object.entries(items)) {
		if (taskIds.includes(taskId)) {
			return statusId;
		}
	}

	return null;
}

function findContainerId(items: DndColumns, id: string) {
	if (id in items) {
		return id;
	}

	for (const [containerId, taskIds] of Object.entries(items)) {
		if (taskIds.includes(id)) {
			return containerId;
		}
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

function findPositionInColumn(
	items: DndColumns,
	statusId: string,
	taskId: string,
) {
	const index = items[statusId]?.findIndex((id) => id === taskId) ?? -1;

	if (index < 0) {
		return null;
	}

	return index + 1;
}

function findTaskNeighborsInColumn(
	items: DndColumns,
	statusId: string,
	taskId: string,
) {
	const taskIds = items[statusId] ?? [];
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

const ProviderDragDrop = ({
	workspaceId,
	projectId,
	sprintId,
	className,
	positionContext,
}: ProviderDragDropProps) => {
	const {
		taskQuery,
		createTask,
	} = useTask(workspaceId, projectId, positionContext);
	const { mutate: updateTaskMutate, mutateAsync: updateTaskMutateAsync } =
		useUpdateTask(workspaceId, projectId, {
			refetchOnSuccess: false,
		});
	const reorderTaskPosition = useReorderTaskPosition({
		workspaceId,
		projectId,
		refetchOnSuccess: false,
	});

	useSprints({
		workspaceId,
		projectId,
		sprintId,
	});

	const taskStatusQuery = useTaskStatus(workspaceId, projectId);

	const taskList = useMemo(() => {
		const tasks = taskQuery.data?.data;
		return Array.isArray(tasks) ? tasks.filter(isTaskVisible) : [];
	}, [taskQuery.data?.data]);

	const statusList = useMemo(() => {
		return [...(taskStatusQuery.data?.data ?? [])].sort(
			(a, b) => a.position - b.position,
		);
	}, [taskStatusQuery.data?.data]);

	const taskMap = useMemo(() => {
		return Object.fromEntries(taskList.map((task) => [task.id, task]));
	}, [taskList]);

	const mappedItems = useMemo<DndColumns>(() => {
		const grouped: DndColumns = {};

		for (const status of statusList) {
			grouped[status.id] = [];
		}

		for (const task of taskList) {
			if (!task.statusId) continue;

			if (!grouped[task.statusId]) {
				grouped[task.statusId] = [];
			}

			grouped[task.statusId].push(task.id);
		}

		return grouped;
	}, [taskList, statusList]);

	const [items, setItems] = useState<DndColumns>({});
	const itemsRef = useRef<DndColumns>({});
	const snapshotRef = useRef<DndColumns>({});
	const isDraggingRef = useRef(false);
	const lastPreviewKeyRef = useRef<string | null>(null);
	const previewFrameRef = useRef<number | null>(null);
	const pendingPreviewRef = useRef<{
		activeId: string;
		overId: string;
	} | null>(null);
	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(
		null,
	);

	const syncItems = useCallback((next: DndColumns) => {
		itemsRef.current = next;
		setItems(next);
	}, []);

	useEffect(() => {
		if (isDraggingRef.current) {
			return;
		}

		itemsRef.current = mappedItems;
		startTransition(() => {
			setItems(mappedItems);
		});
	}, [mappedItems]);

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
			syncItems(nextItems);
		}
	}, [syncItems]);

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

	useEffect(() => {
		return () => {
			cancelPendingPreview();
		};
	}, [cancelPendingPreview]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const activeDrawerTask = activeDrawerTaskId
		? taskMap[activeDrawerTaskId]
		: null;

	const handleAddTask = useCallback((statusId: string) => {
		createTask({
			workspaceId,
			projectId,
			title: "",
			statusId,
			startAt: null,
			dueAt: null,
			...(positionContext ? { positionContext } : {}),
		});
	}, [createTask, projectId, workspaceId, positionContext]);

	const handleUpdateTaskName = useCallback(
		(taskId: string, newName: string) => {
			updateTaskMutate({
				id: taskId,
				title: newName,
			});
		},
		[updateTaskMutate],
	);

	const handleDragStart = useCallback(() => {
		cancelPendingPreview();
		isDraggingRef.current = true;
		snapshotRef.current = cloneItems(itemsRef.current);
		lastPreviewKeyRef.current = null;
	}, [cancelPendingPreview]);

	const handleDragOver = useCallback((event: DragOverEvent) => {
		const { active, over } = event;

		if (!over) {
			return;
		}

		schedulePreview(String(active.id), String(over.id));
	}, [schedulePreview]);

	const handleDragEnd = useCallback((event: DragEndEvent) => {
		const { active, over } = event;
		isDraggingRef.current = false;
		cancelPendingPreview();

		if (!over) {
			syncItems(snapshotRef.current);
			return;
		}

		const taskId = String(active.id);
		const nextItems = reorderItems(
			itemsRef.current,
			taskId,
			String(over.id),
		);
		syncItems(nextItems);

		const previousStatusId = findStatusIdByTaskId(snapshotRef.current, taskId);
		const nextStatusId = findStatusIdByTaskId(nextItems, taskId);

		if (!previousStatusId || !nextStatusId) {
			syncItems(snapshotRef.current);
			return;
		}

		const previousPosition = findPositionInColumn(
			snapshotRef.current,
			previousStatusId,
			taskId,
		);
		const nextPosition = findPositionInColumn(nextItems, nextStatusId, taskId);

		if (previousPosition == null || nextPosition == null) {
			syncItems(snapshotRef.current);
			return;
		}

		if (
			previousStatusId === nextStatusId &&
			previousPosition === nextPosition
		) {
			return;
		}

		const neighbors = findTaskNeighborsInColumn(nextItems, nextStatusId, taskId);

		if (!neighbors) {
			syncItems(snapshotRef.current);
			return;
		}

		void (async () => {
			try {
				if (previousStatusId !== nextStatusId) {
					await updateTaskMutateAsync({
						id: taskId,
						statusId: nextStatusId,
					});
				}

				if (positionContext) {
					await reorderTaskPosition.mutateAsync({
						taskId,
						...positionContext,
						previousTaskId: neighbors.previousTaskId,
						nextTaskId: neighbors.nextTaskId,
					});
				}
			} catch {
				syncItems(snapshotRef.current);
			}
		})();
	}, [
		cancelPendingPreview,
		positionContext,
		reorderTaskPosition,
		syncItems,
		updateTaskMutateAsync,
	]);

	const handleDragCancel = useCallback(() => {
		isDraggingRef.current = false;
		cancelPendingPreview();
		syncItems(snapshotRef.current);
	}, [cancelPendingPreview, syncItems]);

	if (taskQuery.isLoading || taskStatusQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (taskQuery.isError || taskStatusQuery.isError) {
		return <div>Load data failed</div>;
	}

	return (
		<>
			<DndContext
				collisionDetection={closestCorners}
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragCancel={handleDragCancel}
				onDragEnd={handleDragEnd}
			>
				<div className='inline-flex w-full flex-row gap-3'>
					{statusList.map((status) => {
						const columnItems = items[status.id] ?? [];

						return (
							<ColumnDnd
								key={status.id}
								id={status.id}
								statusId={status.id}
								statusName={status.name}
								isDone={status.isDone}
								onAddTask={handleAddTask}
								className={className}
							>
								<SortableContext
									items={columnItems}
									strategy={verticalListSortingStrategy}
								>
									{columnItems.map((id, index) => {
										const task = taskMap[id];

										if (!task) {
											return null;
										}

										return (
											<ItemsDnd
												key={id}
												id={id}
												task={task}
												column={status.id}
												index={index}
												status={status.name}
												name={task?.title ?? ""}
												description={task?.description ?? undefined}
												priority={task?.priorityName ?? undefined}
												assignees={task?.assignees ?? []}
												startAt={task?.startAt}
												dueAt={task?.dueAt}
												onOpenDetail={setActiveDrawerTaskId}
												onUpdateName={handleUpdateTaskName}
											/>
										);
									})}
								</SortableContext>
							</ColumnDnd>
						);
					})}
				</div>
			</DndContext>

			{activeDrawerTask ? (
				<DrawerItemView
					open={!!activeDrawerTask}
					onOpenChange={(open) => {
						if (!open) {
							setActiveDrawerTaskId(null);
						}
					}}
					task={activeDrawerTask}
				/>
			) : null}
		</>
	);
};

export default ProviderDragDrop;
