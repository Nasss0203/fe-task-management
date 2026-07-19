"use client";

import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import {
	useReorderTaskPosition,
	useTask,
	useTaskStatus,
} from "@/features/task/hooks/useTask";
import type { TaskPositionContextInput } from "@/services/task/type";
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
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
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
		updateTask: {
			mutate: updateTaskMutate,
			mutateAsync: updateTaskMutateAsync,
		},
	} = useTask(workspaceId, projectId, positionContext);
	const reorderTaskPosition = useReorderTaskPosition({
		workspaceId,
		projectId,
	});

	useSprints({
		workspaceId,
		projectId,
		sprintId,
	});

	const taskStatusQuery = useTaskStatus(workspaceId, projectId);

	const taskList = useMemo(() => {
		const tasks = taskQuery.data?.data;
		return Array.isArray(tasks) ? tasks : [];
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
	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(
		null,
	);

	const syncItems = (next: DndColumns) => {
		itemsRef.current = next;
		setItems(next);
	};

	useEffect(() => {
		itemsRef.current = mappedItems;
		setItems(mappedItems);
	}, [mappedItems]);

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

	if (taskQuery.isLoading || taskStatusQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (taskQuery.isError || taskStatusQuery.isError) {
		return <div>Load data failed</div>;
	}

	const handleAddTask = (statusId: string) => {
		createTask({
			workspaceId,
			projectId,
			title: "",
			statusId,
			...(positionContext ? { positionContext } : {}),
		});
	};

	const handleDragStart = (_event: DragStartEvent) => {
		snapshotRef.current = cloneItems(itemsRef.current);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		if (!over) {
			return;
		}

		const nextItems = reorderItems(
			itemsRef.current,
			String(active.id),
			String(over.id),
		);

		if (nextItems !== itemsRef.current) {
			syncItems(nextItems);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

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
				await updateTaskMutateAsync({
					id: taskId,
					statusId: nextStatusId,
					position: nextPosition,
				});

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
	};

	return (
		<>
			<DndContext
				collisionDetection={closestCorners}
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
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
								onAddTask={() => handleAddTask(status.id)}
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
												onUpdateName={(taskId, newName) => {
													updateTaskMutate({
														id: taskId,
														title: newName,
													});
												}}
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
