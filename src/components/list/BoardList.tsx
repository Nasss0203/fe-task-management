"use client";

import React from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import DialogAddTask from "@/components/dialog/DialogAddTask";

import { useTask, useTaskStatus } from "@/features/task/hooks/useTask";
import { useUser } from "@/features/auth/hooks/useUser";
import { cn } from "@/lib/utils";
import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";
import { TaskNameCell, TaskAssigneeCell } from "@/components/table/columns/column-task";
import DropdownTaskContextMenu from "@/components/dropdown/DropdownTaskContextMenu";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import type { TaskItem } from "@/services/task/type";

type BoardListProps = {
	workspaceId: string;
	projectId: string;
};

const BoardList = ({ workspaceId, projectId }: BoardListProps) => {
	const { taskQuery, createTask } = useTask(workspaceId, projectId);
	const { data: taskStatusData } = useTaskStatus(workspaceId, projectId);
	const taskStatus = React.useMemo(() => taskStatusData?.data ?? [], [taskStatusData?.data]);
	const { user } = useUser();

	const [isQuickAdding, setIsQuickAdding] = React.useState(false);
	const [quickAddTitle, setQuickAddTitle] = React.useState("");
	const [isCreating, setIsCreating] = React.useState(false);

	const handleQuickAdd = async () => {
		if (!quickAddTitle.trim() || !taskStatus.length) {
			setIsQuickAdding(false);
			setQuickAddTitle("");
			return;
		}

		setIsCreating(true);
		try {
			await createTask({
				title: quickAddTitle.trim(),
				statusId: taskStatus[0].id,
				workspaceId,
				projectId,
				createdBy: user?.id || "",
			});
			setQuickAddTitle("");
		} catch (error) {
			console.error("Failed to create task", error);
		} finally {
			setIsCreating(false);
		}
	};
	const rawTasks = Array.isArray(taskQuery?.data?.data)
		? taskQuery.data.data
		: [];

	const [activeDrawerTaskId, setActiveDrawerTaskId] = React.useState<string | null>(null);
	const activeDrawerTask = React.useMemo(() => {
		return rawTasks.find((t: TaskItem) => t.id === activeDrawerTaskId) || null;
	}, [rawTasks, activeDrawerTaskId]);

	return (
		<>
		<section className='col-span-12 flex h-full min-h-0 flex-col xl:col-span-6'>
			<div className='flex-1 overflow-y-auto overflow-x-hidden'>
				<div className='flex flex-col'>
					{rawTasks.length > 0 ? (
						rawTasks.map((task) => {
							const isAssignee = task.assignees?.some((a: any) => a.userId === user?.id) || false;
							const canEdit = isAssignee;
							const isReadOnly = !canEdit;

							return (
								<div
									key={task.id}
									className={cn(
										'group flex items-center justify-between gap-4 border-b p-3 transition-all last:border-b-0 hover:bg-muted/40 border-border/50 bg-card'
									)}
								>
									{/* Left side: Status and Name */}
								<div className='flex min-w-0 flex-1 items-center gap-3'>
									<div className='shrink-0'>
										<DropdownTaskStatus
											taskId={task.id}
											projectId={projectId}
											workspaceId={workspaceId}
											statusName={task.statusName ?? ""}
										/>
									</div>
									<div className='flex min-w-0 flex-col gap-0.5 w-full'>
										<div className="w-full">
											<TaskNameCell
												taskId={task.id}
												workspaceId={workspaceId}
												projectId={projectId}
												initialTitle={task.title}
											/>
										</div>
										<div className='text-[11px] font-medium text-muted-foreground ml-1'>
											#{task.id.slice(0, 8)} • Task management project
										</div>
									</div>
								</div>

								{/* Right side: Assignee, Priority, Actions */}
								<div className='flex shrink-0 items-center gap-4 opacity-100 sm:opacity-80 transition-opacity group-hover:opacity-100'>
									<div className='w-32'>
										<DropdownTaskPriority
											taskId={task.id}
											projectId={projectId}
											workspaceId={workspaceId}
											priorityName={task.priorityName}
										/>
									</div>
									<div className='w-40'>
										<TaskAssigneeCell
											taskId={task.id}
											workspaceId={workspaceId}
											projectId={projectId}
											assignees={task.assignees}
										/>
									</div>
									<DropdownTaskContextMenu
										taskId={task.id}
										workspaceId={workspaceId}
										projectId={projectId}
										onOpenDetail={() => setActiveDrawerTaskId(task.id)}
									>
										<button className='rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'>
											<MoreHorizontal size={15} />
										</button>
									</DropdownTaskContextMenu>
								</div>
							</div>
							);
						})
					) : (
						<div className='flex h-28 items-center justify-center text-sm text-muted-foreground'>
							No tasks found.
						</div>
					)}
					{isQuickAdding ? (
						<div className="flex w-full items-center gap-2 border-b border-transparent p-2 px-3">
							<Plus className="size-4 text-muted-foreground" />
							<input
								autoFocus
								type="text"
								value={quickAddTitle}
								onChange={(e) => setQuickAddTitle(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleQuickAdd();
									} else if (e.key === "Escape") {
										setIsQuickAdding(false);
										setQuickAddTitle("");
									}
								}}
								onBlur={() => {
									if (!quickAddTitle.trim()) {
										setIsQuickAdding(false);
									}
								}}
								disabled={isCreating}
								placeholder="Nhập tên nhiệm vụ..."
								className="flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
							/>
						</div>
					) : (
						<button 
							onClick={() => setIsQuickAdding(true)}
							className='flex w-full items-center gap-2 border-b border-transparent p-3 text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer text-left'
						>
							<Plus className='size-4' />
							nhiệm vụ mới
						</button>
					)}
				</div>
			</div>
		</section>

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

export default BoardList;
