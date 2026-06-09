"use client";

import { useSprints } from "@/features/sprint/hooks/useSprint";
import type { TaskItem } from "@/services/task/type";
import {
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import BacklogTable from "../table/BacklogTable";
import { columnsBacklog } from "../table/columns/column-backlog";
import { Button } from "../ui/button";
import { DrawerItemView } from "../drawer/DrawerItemView";

type SprintTaskListProps = {
	workspaceId: string;
	projectId: string;
	sprintId: string;
};

const SprintTaskList = ({
	workspaceId,
	projectId,
	sprintId,
}: SprintTaskListProps) => {
	const { sprintsTaskQuery } = useSprints({
		workspaceId,
		projectId,
		sprintId,
	});

	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(
		null,
	);

	const sprintTasks = useMemo(() => {
		const data = sprintsTaskQuery.data?.data;
		return Array.isArray(data) ? data : [];
	}, [sprintsTaskQuery.data?.data]);

	const taskMap = useMemo(() => {
		return Object.fromEntries(sprintTasks.map((task) => [task.id, task]));
	}, [sprintTasks]);

	const activeDrawerTask = activeDrawerTaskId
		? taskMap[activeDrawerTaskId]
		: null;

	// Enhanced columns to support opening detail
	const columns = useMemo(() => {
		return columnsBacklog.map((col) => {
			if ("accessorKey" in col && col.accessorKey === "title") {
				return {
					...col,
					cell: (info: any) => {
						const task = info.row.original as TaskItem;
						return (
							<div
								className='flex cursor-pointer min-w-0 flex-col py-1'
								onClick={() => setActiveDrawerTaskId(task.id)}
							>
								<span className='truncate text-[14px] font-medium text-foreground hover:text-blue-400 transition-colors'>
									{task.title}
								</span>
								{task.description ? (
									<span className='truncate text-[12px] text-muted-foreground'>
										{task.description}
									</span>
								) : null}
							</div>
						);
					},
				};
			}
			return col;
		});
	}, []);

	const table = useReactTable({
		data: sprintTasks,
		columns,
		getRowId: (row) => row.id,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (sprintsTaskQuery.isLoading) {
		return (
			<div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
				Đang tải danh sách công việc...
			</div>
		);
	}

	return (
		<div className='flex h-full min-h-0 flex-col'>
			<BacklogTable
				table={table}
				emptyText='Chưa có công việc nào trong sprint này'
				className='min-h-0 flex-1 rounded-none border-0 bg-transparent shadow-none'
			/>

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
		</div>
	);
};

export default SprintTaskList;
