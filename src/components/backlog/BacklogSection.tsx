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
import { cn } from "@/lib/utils";

const formatDeletedAt = (value?: string | null) => {
	if (!value) return "Unknown time";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "Unknown time";

	return new Intl.DateTimeFormat("en-GB", {
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
		<Card className='overflow-hidden py-0! flex flex-col gap-0 rounded-2xl border-neutral-800 bg-neutral-950/20'>
			<div className='flex items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-900/40 px-4 py-3'>
				<div className='flex items-center gap-3'>
					<Button
						variant='ghost'
						size='icon'
						className='size-7 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors'
						onClick={handleOpenTable}
					>
						<ChevronDown className={cn("size-4 transition-transform duration-300", !open && "-rotate-90")} />
					</Button>

					<div className='flex items-center gap-2.5'>
						<span className='text-[14px] font-semibold text-neutral-100'>
							Backlog
						</span>
						<span className='text-[12px] font-medium text-neutral-500'>
							{taskBacklog.length} items
						</span>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{isProjectContext && (
						<Button
							variant='outline'
							size='sm'
							className="h-8 rounded-lg border-neutral-700 bg-neutral-900 text-[12px] font-medium hover:bg-neutral-800 hover:border-neutral-600 transition-all text-neutral-200"
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
								className='size-8 text-neutral-400 hover:bg-neutral-800 transition-colors'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className="bg-neutral-950 border-neutral-800 rounded-xl min-w-[160px]">
							<DropdownMenuItem className="text-xs text-neutral-300 focus:bg-neutral-900 focus:text-neutral-100 cursor-pointer">Collapse</DropdownMenuItem>
							<DropdownMenuItem className="text-xs text-neutral-300 focus:bg-neutral-900 focus:text-neutral-100 cursor-pointer">Export tasks</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{open ? (
				<div className='flex flex-col gap-6 p-4'>
					<div className="overflow-x-auto rounded-xl border border-neutral-800/50 bg-neutral-950/30">
						<TableBacklog tasks={taskBacklog} containerId={containerId} />
					</div>

					<div className='rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/10 p-5'>
						<div className='flex items-center justify-between gap-3'>
							<div className='flex items-center gap-3'>
								<div className='flex size-8 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-500 shadow-sm'>
									<Trash2 className='size-4' />
								</div>
								<div>
									<div className='text-[14px] font-semibold text-neutral-200'>
										Recently deleted
									</div>
									<div className='text-[12px] text-neutral-500'>
										Tasks deleted in the last 30 days will appear here.
									</div>
								</div>
							</div>
							<span className='text-[11px] font-medium text-neutral-500 uppercase tracking-wider'>
								{deletedTaskItems.length} items
							</span>
						</div>

						{deletedTaskItems.length > 0 && (
							<div className='mt-5 space-y-2'>
								{deletedTasks.isPending ? (
									<div className='text-[12px] font-medium text-neutral-500 flex items-center justify-center h-12'>
										Loading deleted tasks...
									</div>
								) : (
									deletedTaskItems.map((task) => (
										<div
											key={task.id}
											className='flex items-center justify-between gap-3 rounded-xl border border-neutral-800/60 bg-neutral-950/40 px-4 py-3 hover:bg-neutral-900/40 hover:border-neutral-700 transition-all shadow-sm'
										>
											<div className='min-w-0'>
												<div className='truncate text-[13px] font-medium text-neutral-200'>
													{task.title}
												</div>
												<div className='text-[11px] text-neutral-500 mt-0.5'>
													Deleted on {formatDeletedAt(task.deletedAt)}
												</div>
											</div>

											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='h-8 shrink-0 rounded-lg text-[11px] font-semibold text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors'
												onClick={() =>
													restoreTask.mutate({
														taskId: task.id,
													})
												}
												disabled={restoreTask.isPending}
											>
												<RotateCcw className='mr-1.5 size-3.5' />
												Restore
											</Button>
										</div>
									))
								)}
							</div>
						)}
					</div>
				</div>
			) : null}
		</Card>
	);
};
export default BacklogSection;
