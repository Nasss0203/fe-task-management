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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import type { TaskItem } from "@/services/task/type";
import TaskAssignees from "./TaskAssignees";

type TaskTableProps = {
	tasks: TaskItem[];
	showSprint?: boolean;
};

const TaskTable = ({ tasks, showSprint = false }: TaskTableProps) => {
	if (!tasks.length) {
		return (
			<div className='rounded-md border px-4 py-8 text-center text-sm text-muted-foreground'>
				Không có task.
			</div>
		);
	}

	return (
		<div className='overflow-hidden border'>
			<div className='max-h-140 overflow-auto'>
				<Table>
					<TableHeader className='sticky z-10 bg-background opacity-0'>
						<TableRow className=''>
							<TableHead className='w-12' />
							<TableHead>Task</TableHead>

							{showSprint && (
								<TableHead className='w-40'>Sprint</TableHead>
							)}

							<TableHead className='w-40'>Status</TableHead>
							<TableHead className='w-40'>Priority</TableHead>
							<TableHead className='w-40'>Assignee</TableHead>
							<TableHead className='w-12' />
						</TableRow>
					</TableHeader>

					<TableBody>
						{tasks.map((task) => (
							<TableRow key={task.id} className='h-14'>
								<TableCell>
									<Checkbox />
								</TableCell>

								<TableCell>
									<div className='flex min-w-0 flex-col'>
										<span className='truncate font-medium text-foreground'>
											{task.title}
										</span>
										<span className='text-xs text-muted-foreground'>
											TM-{task.projectSeq}
										</span>
									</div>
								</TableCell>

								{showSprint && (
									<TableCell className='text-sm text-muted-foreground'>
										{task.sprintName ?? "-"}
									</TableCell>
								)}

								<TableCell>
									<Select value={task.statusId}>
										<SelectTrigger className='h-8 w-32.5'>
											<SelectValue>
												{task.statusName ?? "No status"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={task.statusId}>
												{task.statusName ?? "No status"}
											</SelectItem>
										</SelectContent>
									</Select>
								</TableCell>

								<TableCell>
									<Select value={task.priorityId ?? "none"}>
										<SelectTrigger className='h-8 w-32.5'>
											<SelectValue>
												{task.priorityName ??
													"No priority"}
											</SelectValue>
										</SelectTrigger>

										<SelectContent>
											<SelectItem value='none'>
												No priority
											</SelectItem>

											{task.priorityId && (
												<SelectItem
													value={task.priorityId}
												>
													{task.priorityName ??
														"No priority"}
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</TableCell>

								<TableCell>
									<TaskAssignees assignees={task.assignees} />
								</TableCell>

								<TableCell>
									<Button
										variant='ghost'
										size='icon'
										className='size-8'
									>
										<Ellipsis className='size-4' />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default TaskTable;
