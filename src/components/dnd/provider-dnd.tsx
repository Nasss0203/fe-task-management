"use client";

import { findAllTask } from "@/services/task/task.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import ColumnDnd from "./column-dnd";
import ItemsDnd from "./items-dnd";

type TaskItem = {
	id: string;
	title: string;
	statusId?: string;
	statusName?: string;
};

type DndColumns = {
	todo: string[];
	inProgress: string[];
	done: string[];
};

const emptyColumns: DndColumns = {
	todo: [],
	inProgress: [],
	done: [],
};

const ProviderDragDrop = () => {
	const { currentWorkspaceId, currentProjectId, currentBoardId } =
		useProjectSelectionStore();

	const taskQuery = useQuery({
		queryKey: [
			"tasks",
			currentWorkspaceId,
			currentProjectId,
			currentBoardId,
		],
		queryFn: () =>
			findAllTask(
				currentWorkspaceId!,
				currentProjectId!,
				currentBoardId!,
			),
		enabled: !!currentWorkspaceId && !!currentProjectId && !!currentBoardId,
	});

	const taskList: TaskItem[] | undefined = taskQuery.data?.data;

	const mappedItems = useMemo<DndColumns>(() => {
		const grouped: DndColumns = {
			todo: [],
			inProgress: [],
			done: [],
		};

		if (!taskList?.length) return grouped;

		for (const task of taskList) {
			const status = (task.statusName ?? "").trim().toUpperCase();

			if (status === "TODO") {
				grouped.todo.push(task.id);
				continue;
			}

			if (status === "IN PROGRESS" || status === "IN_PROGRESS") {
				grouped.inProgress.push(task.id);
				continue;
			}

			if (status === "DONE") {
				grouped.done.push(task.id);
			}
		}

		return grouped;
	}, [taskList]);

	const [items, setItems] = useState<DndColumns>(emptyColumns);

	useEffect(() => {
		setItems(mappedItems);
	}, [mappedItems]);

	if (taskQuery.isLoading) {
		return <div>Loading tasks...</div>;
	}

	if (taskQuery.isError) {
		return <div>Load task failed</div>;
	}

	return (
		<DragDropProvider
			onDragOver={(event) => {
				setItems((prev) => move(prev, event));
			}}
		>
			<div className='inline-flex flex-row gap-3 w-full'>
				{Object.entries(items).map(([column, columnItems]) => (
					<ColumnDnd key={column} id={column} isEmpty status={column}>
						{columnItems.map((id, index) => {
							const task = taskList?.find(
								(item) => item.id === id,
							);

							return (
								<ItemsDnd
									key={id}
									id={id}
									index={index}
									status={column}
									title={task?.title ?? id}
									name={task?.title}
								/>
							);
						})}
					</ColumnDnd>
				))}
			</div>
		</DragDropProvider>
	);
};

export default ProviderDragDrop;
