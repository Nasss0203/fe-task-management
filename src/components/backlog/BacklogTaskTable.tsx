"use client";

import { Card } from "@/components/ui/card";
import { useTask } from "@/hooks/use-task";
import TaskTable from "../task/TaskTableBacklog";
import type { TaskItem } from "./types";

const mockBacklogTasks: TaskItem[] = [
	{
		id: "3",
		code: "TM-201",
		title: "Create task drawer",
		status: "Todo",
		priority: "Low",
		assigneeName: "Unassigned",
		sprintId: null,
	},
	{
		id: "4",
		code: "TM-202",
		title: "Fix table layout",
		status: "Todo",
		priority: "Medium",
		assigneeName: "NA",
		sprintId: null,
	},
];
type BacklogTaskTableProps = {
	workspaceId: string;
	projectId: string;
};

const BacklogTaskTable = ({
	workspaceId,
	projectId,
}: BacklogTaskTableProps) => {
	const { findTaskBacklog } = useTask(
		workspaceId as string,
		projectId as string,
	);
	const taskBacklog = findTaskBacklog.data?.data ?? [];
	return (
		<Card className='overflow-hidden flex flex-col gap-5'>
			<div className='flex items-center justify-between border-b bg-muted/30 px-5 py-3'>
				<div>
					<h3 className='text-sm font-semibold'>Backlog</h3>
					<p className='text-xs text-muted-foreground'>
						Task chưa được đưa vào sprint nào
					</p>
				</div>

				<span className='text-xs text-muted-foreground'>
					{mockBacklogTasks.length} tasks
				</span>
			</div>

			<TaskTable tasks={taskBacklog} />
		</Card>
	);
};

export default BacklogTaskTable;
