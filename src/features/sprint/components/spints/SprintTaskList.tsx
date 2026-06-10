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
import BacklogTable from "@/components/table/BacklogTable";
import { getColumnsBacklog } from "@/components/table/columns/column-backlog";
import { Button } from "@/components/ui/button";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";

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
		return getColumnsBacklog({
			workspaceId,
			projectId,
			onOpenDetail: setActiveDrawerTaskId,
		});
	}, [workspaceId, projectId]);

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
