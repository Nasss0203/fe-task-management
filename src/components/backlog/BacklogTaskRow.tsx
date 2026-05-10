"use client";

import { Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { TaskBacklogItem } from "@/services/task/type";
import TaskAssignees from "../task/TaskAssignees";

type BacklogTaskRowProps = {
	task: TaskBacklogItem;
	showSprint?: boolean;
};

const BacklogTaskRow = ({ task, showSprint = false }: BacklogTaskRowProps) => {
	const statusName = task.statusName ?? "No status";
	const priorityName = task.priorityName ?? "No priority";
	return (
		<div
			className={
				showSprint
					? "grid grid-cols-[minmax(300px,1fr)_150px_150px_150px_120px_48px] items-center border-t bg-card px-4 py-2.5 text-sm hover:bg-muted/40"
					: "grid grid-cols-[minmax(300px,1fr)_150px_150px_120px_48px] items-center border-t bg-card px-4 py-2.5 text-sm hover:bg-muted/40"
			}
		>
			<div className='flex min-w-0 items-center gap-3'>
				<Checkbox />

				<div className='flex min-w-0 flex-col'>
					<span className='truncate font-medium text-foreground'>
						{task.title}
					</span>
				</div>
			</div>

			{showSprint && (
				<div className='truncate text-sm text-muted-foreground'>
					{task.sprintName || "-"}
				</div>
			)}

			<div>
				<Select
					defaultValue={statusName.toLowerCase().replace(" ", "_")}
				>
					<SelectTrigger className='h-8 w-32.5'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='todo'>Todo</SelectItem>
						<SelectItem value='in_progress'>In progress</SelectItem>
						<SelectItem value='done'>Done</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<Select defaultValue={priorityName.toLowerCase()}>
					<SelectTrigger className='h-8 w-32.5'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='low'>Low</SelectItem>
						<SelectItem value='medium'>Medium</SelectItem>
						<SelectItem value='high'>High</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<TaskAssignees assignees={task.assignees} />
			<div className='flex justify-end'>
				<Button variant='ghost' size='icon' className='size-8'>
					<Ellipsis className='size-4' />
				</Button>
			</div>
		</div>
	);
};

export default BacklogTaskRow;
