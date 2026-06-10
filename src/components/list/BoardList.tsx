"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

import { useTask } from "@/features/task/hooks/useTask";
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
	const { taskQuery } = useTask(workspaceId, projectId);
	const { user } = useUser();
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
										'group flex items-center justify-between gap-4 border-b p-3 transition-all last:border-b-0 hover:bg-muted/40',
										isReadOnly 
											? 'opacity-60 bg-muted/20 border-dashed border-border/80' 
											: 'border-border/50 bg-background'
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
