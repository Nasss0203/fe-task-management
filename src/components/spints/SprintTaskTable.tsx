"use client";

import { Card } from "@/components/ui/card";
import { useSprints } from "@/hooks/use-sprint";
import BacklogTaskRow from "../backlog/BacklogTaskRow";

type SprintTaskTableProps = {
	workspaceId?: string;
	projectId?: string;
};

const SprintTaskTable = ({ projectId, workspaceId }: SprintTaskTableProps) => {
	const { sprintsQuery } = useSprints({ workspaceId, projectId });
	const sprints = sprintsQuery.data?.data ?? [];
	const tasks = sprints.flatMap((sprint) =>
		(sprint.tasks ?? []).map((task) => ({
			...task,
			sprintId: sprint.id,
			sprintName: sprint.name,
		})),
	);
	return (
		<Card className='overflow-hidden'>
			<div className='flex items-center justify-between border-b bg-muted/30 px-5 py-3'>
				<div>
					<h3 className='text-sm font-semibold'>Sprint tasks</h3>
					<p className='text-xs text-muted-foreground'>
						Các task đã được đưa vào sprint
					</p>
				</div>

				<span className='text-xs text-muted-foreground'>
					{tasks.length} tasks
				</span>
			</div>

			<div className='overflow-x-auto p-3'>
				<div className='min-w-245 overflow-hidden rounded-md border'>
					<div className='grid grid-cols-[minmax(300px,1fr)_150px_150px_150px_120px_48px] bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
						<div>Task</div>
						<div>Sprint</div>
						<div>Status</div>
						<div>Priority</div>
						<div>Assignee</div>
						<div />
					</div>

					{tasks.length > 0 ? (
						tasks.map((task) => (
							<BacklogTaskRow
								key={task.id}
								task={task}
								showSprint
							/>
						))
					) : (
						<div className='px-4 py-8 text-center text-sm text-muted-foreground'>
							Không có task trong sprint này.
						</div>
					)}
				</div>
			</div>
		</Card>
	);
};

export default SprintTaskTable;
