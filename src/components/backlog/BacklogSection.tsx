"use client";

import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTask } from "@/hooks/use-task";
import TaskTable from "../task/TaskTable";
import type { BacklogRenderContext } from "./types";

type BacklogSectionProps = {
	context?: BacklogRenderContext;
	workspaceId: string;
	projectId: string;
};

const BacklogSection = ({
	context = "project",
	projectId,
	workspaceId,
}: BacklogSectionProps) => {
	const isProjectContext = context === "project";
	const { findTaskBacklog } = useTask(workspaceId, projectId);
	const taskBacklog = findTaskBacklog.data?.data ?? [];

	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-1 rounded-none'>
			<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-3 py-3'>
				<div className='flex items-center gap-3'>
					<Checkbox />

					<Button variant='ghost' size='icon' className='size-7'>
						<ChevronDown className='size-4 text-muted-foreground' />
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-sm font-semibold'>
								Backlog
							</span>
							<span className='text-sm text-muted-foreground'>
								({taskBacklog?.length} work items)
							</span>
						</div>

						<p className='text-xs text-muted-foreground'>
							Task chưa được đưa vào sprint nào
						</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{isProjectContext && (
						<Button variant='outline' size='sm'>
							Create sprint
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

			<div className='overflow-x-auto px-1'>
				<TaskTable tasks={taskBacklog} />

				{isProjectContext && (
					<Button
						variant='ghost'
						className='w-full justify-start gap-2 py-5 my-2'
					>
						<Plus className='size-4' />
						Create task
					</Button>
				)}
			</div>
		</Card>
	);
};

export default BacklogSection;
