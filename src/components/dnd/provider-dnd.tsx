"use client";

import { useTask, useTaskStatus } from "@/hooks/use-task";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ColumnDnd from "./column-dnd";
import ItemsDnd from "./items-dnd";

type TaskItem = {
	id: string;
	title: string;
	statusId?: string;
	statusName?: string;
};

type DndColumns = Record<string, string[]>;

type ProviderDragDropProps = {
	workspaceId: string;
	projectId: string;
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

const ProviderDragDrop = ({
	workspaceId,
	projectId,
}: ProviderDragDropProps) => {
	const {
		taskQuery,
		createTask: { mutate: createTaskMutate },
		updateTask: { mutate: updateTaskMutate },
	} = useTask(workspaceId, projectId);

	const taskStatusQuery = useTaskStatus(workspaceId, projectId);

	const taskList: TaskItem[] = useMemo(() => {
		return taskQuery.data?.data ?? [];
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

	const syncItems = (next: DndColumns) => {
		itemsRef.current = next;
		setItems(next);
	};

	useEffect(() => {
		itemsRef.current = mappedItems;
		setItems(mappedItems);
	}, [mappedItems]);

	if (taskQuery.isLoading || taskStatusQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (taskQuery.isError || taskStatusQuery.isError) {
		return <div>Load data failed</div>;
	}

	const handleAddTask = (statusId: string) => {
		createTaskMutate({
			workspaceId,
			projectId,
			title: "Test update task hoàn tất",
			statusId,
		});
	};

	return (
		<DragDropProvider
			onDragStart={() => {
				snapshotRef.current = cloneItems(itemsRef.current);
			}}
			onDragOver={(event) => {
				const { source } = event.operation;

				if (!source || source.type === "column") {
					return;
				}

				const nextItems = move(itemsRef.current, event);
				syncItems(nextItems);
			}}
			onDragEnd={(event) => {
				const { source } = event.operation;

				if (!source || source.type === "column") {
					return;
				}

				if (event.canceled) {
					syncItems(snapshotRef.current);
					return;
				}

				const taskId = String(source.id);
				const nextItems = itemsRef.current;
				const nextStatusId = findStatusIdByTaskId(nextItems, taskId);

				if (!nextStatusId) {
					syncItems(snapshotRef.current);
					return;
				}

				const nextPosition = findPositionInColumn(
					nextItems,
					nextStatusId,
					taskId,
				);

				if (nextPosition == null) {
					syncItems(snapshotRef.current);
					return;
				}

				updateTaskMutate(
					{
						id: taskId,
						statusId: nextStatusId,
						position: nextPosition,
					},
					{
						onError: () => {
							syncItems(snapshotRef.current);
						},
					},
				);
			}}
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
							statusColor={status.color}
							isDone={status.isDone}
							onAddTask={() => handleAddTask(status.id)}
						>
							{columnItems.map((id, index) => {
								const task = taskMap[id];

								return (
									<ItemsDnd
										key={id}
										id={id}
										column={status.id}
										index={index}
										status={status.name}
										name={task?.title ?? ""}
										onUpdateName={(taskId, newName) => {
											updateTaskMutate({
												id: taskId,
												title: newName,
											});
										}}
									/>
								);
							})}
						</ColumnDnd>
					);
				})}
			</div>
		</DragDropProvider>
	);
};

export default ProviderDragDrop;
