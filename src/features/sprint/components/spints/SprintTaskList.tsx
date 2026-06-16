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
import { useTask, useTaskStatus } from "@/features/task/hooks/useTask";
import { TaskBulkActionBar } from "@/features/task/components/task/TaskBulkActionBar";
import TaskTrashDialog from "@/features/task/components/task/TaskTrashDialog";
import MoveToSprintDialog from "@/components/dialog/MoveToSprintDialog";

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

	const { bulkUpdateTasks, bulkMoveToSprint } = useTask(workspaceId, projectId);
	const { data: taskStatusData } = useTaskStatus(workspaceId, projectId);

	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(
		null,
	);
	const [rowSelection, setRowSelection] = useState({});
	const [taskTrashOpen, setTaskTrashOpen] = useState(false);
	const [moveToSprintOpen, setMoveToSprintOpen] = useState(false);

	const sprintTasks = useMemo<TaskItem[]>(() => {
		return sprintsTaskQuery.data?.data?.tasks || [];
	}, [sprintsTaskQuery.data?.data?.tasks]);

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
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	const selectedTaskIds = Object.keys(rowSelection);
	const selectedTasks = selectedTaskIds
		.map((id) => taskMap[id])
		.filter((task): task is TaskItem => task !== undefined);

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
				className='min-h-0 flex-1 rounded-none border-0 shadow-none'
			/>

			<TaskBulkActionBar
				selectedCount={selectedTaskIds.length}
				totalCount={sprintTasks.length}
				selectedTaskIds={selectedTaskIds}
				taskStatus={taskStatusData?.data ?? []}
				isChangeStatusPending={bulkUpdateTasks.isPending}
				onSelectAll={() => table.toggleAllRowsSelected(true)}
				onClear={() => table.resetRowSelection()}
				onSubmitChangeStatus={async ({
					taskIds,
					statusId,
					sendNotification,
				}) => {
					await bulkUpdateTasks.mutateAsync({
						taskIds,
						statusId,
						sendNotification,
					});
					table.resetRowSelection();
				}}
				onMoveToSprint={() => setMoveToSprintOpen(true)}
				onDelete={() => {
					setTaskTrashOpen(true);
				}}
			/>

			<MoveToSprintDialog
				open={moveToSprintOpen}
				onOpenChange={setMoveToSprintOpen}
				workspaceId={workspaceId}
				projectId={projectId}
				isPending={bulkMoveToSprint.isPending}
				onConfirm={async (selectedSprintId) => {
					await bulkMoveToSprint.mutateAsync({
						taskIds: selectedTaskIds,
						sprintId: selectedSprintId,
					});
					table.resetRowSelection();
				}}
			/>

			<TaskTrashDialog
				tasks={selectedTasks}
				workspaceId={workspaceId}
				projectId={projectId}
				open={taskTrashOpen}
				onOpenChange={setTaskTrashOpen}
				onDeleted={() => {
					table.resetRowSelection();
				}}
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
