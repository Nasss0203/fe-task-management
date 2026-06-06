"use client";

import { ChevronDown, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSprints } from "@/features/sprint/hooks/useSprint";
import { useTask } from "@/features/task/hooks/useTask";
import { useState } from "react";
import TableBacklog from "../table/TableBacklog";
import type { BacklogRenderContext } from "./types";

const formatDeletedAt = (value?: string | null) => {
	if (!value) return "Unknown time";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "Unknown time";

	return new Intl.DateTimeFormat("vi-VN", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

type BacklogSectionProps = {
	context?: BacklogRenderContext;
	workspaceId: string;
	projectId: string;
	containerId: string;
};

const BacklogSection = ({
	context = "project",
	projectId,
	workspaceId,
	containerId,
}: BacklogSectionProps) => {
	const [open, setOpen] = useState<boolean>(true);
	const isProjectContext = context === "project";
	const { findTaskBacklog, deletedTasks, restoreTask } = useTask(
		workspaceId,
		projectId,
		undefined,
		{
			includeTrash: true,
		},
	);
	const taskBacklog = findTaskBacklog.data?.data ?? [];
	const deletedTaskItems = deletedTasks.data?.data ?? [];

	const { createSprint } = useSprints({
		projectId,
		workspaceId,
	});

	const handleCreateSprint = () => {
		if (!workspaceId || !projectId) return;

		createSprint.mutate({
			workspaceId,
			projectId,
		});
	};

	const handleOpenTable = () => {
		setOpen(!open);
	};

	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-1 rounded-none'>
			<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-3 py-3'>
				<div className='flex items-center gap-3'>
					<Button
						variant='ghost'
						size='icon'
						className='size-7'
						onClick={handleOpenTable}
					>
						<ChevronDown className='size-4 text-muted-foreground' />
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-sm font-semibold'>
								Backlog
							</span>
							<span className='text-sm text-muted-foreground'>
								({taskBacklog.length} work items)
							</span>
						</div>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{isProjectContext && (
						<Button
							variant='outline'
							size='sm'
							onClick={handleCreateSprint}
						>
							{createSprint.isPending
								? "Creating..."
								: "Create sprint"}
						</Button>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='size-8'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end'>
							<DropdownMenuItem>Collapse</DropdownMenuItem>
							<DropdownMenuItem>Export tasks</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{open ? (
				<div className='flex flex-col gap-4 overflow-x-auto px-1 pb-1'>
					<TableBacklog tasks={taskBacklog} containerId={containerId} />

					<div className='rounded-xl border border-dashed border-border/80 bg-muted/20 p-4'>
						<div className='flex items-center justify-between gap-3'>
							<div className='flex items-center gap-2'>
								<div className='rounded-full border border-border/80 bg-background p-2 text-muted-foreground'>
									<Trash2 className='size-4' />
								</div>
								<div>
									<div className='text-sm font-semibold'>
										Deleted tasks
									</div>
									<div className='text-xs text-muted-foreground'>
										Task da xoa mem se hien o day de ban khoi
										phuc lai.
									</div>
								</div>
							</div>
							<span className='text-xs text-muted-foreground'>
								{deletedTaskItems.length} item
							</span>
						</div>

						<div className='mt-4'>
							{deletedTasks.isPending ? (
								<div className='text-sm text-muted-foreground'>
									Dang tai deleted tasks...
								</div>
							) : deletedTaskItems.length === 0 ? (
								<div className='text-sm text-muted-foreground'>
									Chua co task nao trong thung rac.
								</div>
							) : (
								<div className='space-y-2'>
									{deletedTaskItems.map((task) => (
										<div
											key={task.id}
											className='flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-3'
										>
											<div className='min-w-0'>
												<div className='truncate text-sm font-medium'>
													{task.title}
												</div>
												<div className='text-xs text-muted-foreground'>
													Deleted at{" "}
													{formatDeletedAt(task.deletedAt)}
												</div>
											</div>

											<Button
												type='button'
												variant='outline'
												size='sm'
												className='shrink-0'
												onClick={() =>
													restoreTask.mutate({
														taskId: task.id,
													})
												}
												disabled={restoreTask.isPending}
											>
												<RotateCcw className='mr-2 size-4' />
												Restore
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			) : null}
		</Card>
	);
};
export default BacklogSection;
