"use client";

import { ChevronDown, MoreHorizontal, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SprintItem } from "@/services/sprint/type";
import BacklogTaskRow from "../backlog/BacklogTaskRow";

const formatDate = (date?: string | Date | null) => {
	if (!date) return "Chưa có";

	return new Date(date).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};
type SprintSectionProps = {
	sprint: SprintItem;
};

const SprintSection = ({ sprint }: SprintSectionProps) => {
	const isActive = sprint.status === "ACTIVE";
	const isCompleted = sprint.status === "COMPLETED";

	const queryTask = sprint.tasks ?? [];

	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-1 rounded-none'>
			<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3'>
				<div className='flex items-center gap-3'>
					<Checkbox />

					<Button variant='ghost' size='icon' className='size-7'>
						<ChevronDown className='size-4 text-muted-foreground' />
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-sm font-semibold'>
								{sprint.name}
							</span>
						</div>

						<p className='text-xs text-muted-foreground'>
							{queryTask.length} work items ·{" "}
							{formatDate(sprint.startAt)} -{" "}
							{formatDate(sprint.endAt)}
						</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{!isActive && !isCompleted && (
						<Button variant='outline' size='sm' className='gap-2'>
							<Play className='size-3.5' />
							Start sprint
						</Button>
					)}

					{isActive && (
						<Button variant='outline' size='sm'>
							Complete sprint
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
							<DropdownMenuItem>Edit sprint</DropdownMenuItem>
							<DropdownMenuItem>Move tasks</DropdownMenuItem>
							<DropdownMenuItem className='text-destructive'>
								Delete sprint
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className='overflow-x-auto p-0 px-1'>
				{queryTask.length === 0 ? (
					<div className='py-2 text-center'>Chưa có task</div>
				) : (
					<div className='min-w-215 overflow-hidden border'>
						<div className='grid grid-cols-[minmax(300px,1fr)_150px_150px_120px_48px] bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
							<div>Task</div>
							<div>Status</div>
							<div>Priority</div>
							<div>Assignee</div>
							<div />
						</div>

						{queryTask.map((task) => (
							<BacklogTaskRow key={task.id} task={task} />
						))}
					</div>
				)}
			</div>
		</Card>
	);
};

export default SprintSection;
