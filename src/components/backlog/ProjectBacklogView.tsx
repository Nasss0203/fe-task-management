"use client";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSprints } from "@/hooks/use-sprint";
import { useTask, useTaskMoveSprint } from "@/hooks/use-task";

import { useMemo } from "react";
import { ProviderSprintDnd } from "../dnd/backlog-sprint/ProviderSprintDnd";
import SprintProjectSection from "../spints/SprintProjectSection";
import BacklogSection from "./BacklogSection";

type ProjectBacklogViewProps = {
	workspaceId: string;
	projectId: string;
};

const ProjectBacklogView = ({
	workspaceId,
	projectId,
}: ProjectBacklogViewProps) => {
	const { sprintsQuery } = useSprints({ workspaceId, projectId });
	const sprints = sprintsQuery.data?.data ?? [];

	const { taskQuery } = useTask(workspaceId, projectId);
	const allTasks = taskQuery.data?.data ?? [];

	const initialItems = useMemo(() => {
		const items: Record<string, string[]> = { backlog: [] };

		// Khởi tạo từng sprint container
		for (const sprint of sprints) {
			items[`sprint:${sprint.id}`] = [];
		}

		// Phân loại task vào đúng container
		for (const task of allTasks) {
			if (task.sprintId) {
				const key = `sprint:${task.sprintId}`;
				if (items[key]) {
					items[key].push(task.id);
				}
			} else {
				items["backlog"].push(task.id);
			}
		}

		return items;
	}, [allTasks, sprints]);

	const { taskMoveSprint, removeTaskSprint, taskSprintToSprint } =
		useTaskMoveSprint({
			workspaceId,
			projectId,
		});

	const SPRINT_PREFIX = "sprint:";
	const BACKLOG_ID = "backlog";

	const getSprintId = (containerId: string) => {
		if (!containerId.startsWith(SPRINT_PREFIX)) return null;

		return containerId.replace(SPRINT_PREFIX, "");
	};

	const handleTaskMove = ({
		taskId,
		fromContainerId,
		toContainerId,
	}: {
		taskId: string;
		fromContainerId: string;
		toContainerId: string;
	}) => {
		if (fromContainerId === toContainerId) return;

		const sourceSprintId = getSprintId(fromContainerId);
		const targetSprintId = getSprintId(toContainerId);

		const isMoveToBacklog = toContainerId === BACKLOG_ID;
		const isMoveFromBacklog = fromContainerId === BACKLOG_ID;

		// sprint -> backlog
		if (sourceSprintId && isMoveToBacklog) {
			removeTaskSprint.mutate({ taskId });
			return;
		}

		// backlog -> sprint
		if (isMoveFromBacklog && targetSprintId) {
			taskMoveSprint.mutate({
				taskId,
				sprintId: targetSprintId,
			});
			return;
		}

		// sprint -> sprint
		if (sourceSprintId && targetSprintId) {
			taskSprintToSprint.mutate({
				taskId,
				sourceSprintId,
				targetSprintId,
			});
			return;
		}
	};
	return (
		<div className='flex flex-col gap-5'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div className='flex items-center gap-3'>
					<div className='relative w-65'>
						<Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							placeholder='Search backlog'
							className='h-10 pl-9'
						/>
					</div>

					<Button variant='outline' size='icon' className='h-10 w-10'>
						<Filter className='size-4' />
					</Button>
				</div>
			</div>

			<ProviderSprintDnd
				onTaskMove={handleTaskMove}
				initialItems={initialItems}
			>
				<div className='flex flex-col gap-5'>
					{sprints.map((sprint) => (
						<SprintProjectSection
							key={sprint.id}
							sprint={sprint}
							projectId={projectId as string}
							workspaceId={workspaceId as string}
							status={sprint.status}
							containerId={`sprint:${sprint.id}`}
						/>
					))}

					<BacklogSection
						containerId='backlog'
						context='project'
						projectId={projectId as string}
						workspaceId={workspaceId as string}
					/>
				</div>
			</ProviderSprintDnd>
		</div>
	);
};

export default ProjectBacklogView;
