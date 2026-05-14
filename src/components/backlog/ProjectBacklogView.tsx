"use client";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSprints } from "@/hooks/use-sprint";
import { useTaskMoveSprint } from "@/hooks/use-task";

import { ProviderTableDnd } from "../dnd/backlog-sprint/ProviderTableDnd";
import SprintProjectSection from "../spints/SprintProjectSection";
import BacklogSection from "./BacklogSection";

type ProjectBacklogViewProps = {
	workspaceId?: string;
	projectId?: string;
};

const ProjectBacklogView = ({
	workspaceId,
	projectId,
}: ProjectBacklogViewProps) => {
	const { sprintsQuery } = useSprints({ workspaceId, projectId });
	const sprints = sprintsQuery.data?.data ?? [];

	const { taskMoveSprint, removeTaskSprint } = useTaskMoveSprint({
		workspaceId,
		projectId,
	});

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

		const isMoveToBacklog = toContainerId === "backlog";
		const isMoveFromSprint = fromContainerId.startsWith("sprint:");
		const isMoveToSprint = toContainerId.startsWith("sprint:");

		if (isMoveToBacklog && isMoveFromSprint) {
			removeTaskSprint.mutate({ taskId });
			return;
		}

		if (isMoveToSprint) {
			const sprintId = toContainerId.replace("sprint:", "");

			taskMoveSprint.mutate({
				taskId,
				sprintId,
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

			<ProviderTableDnd onTaskMove={handleTaskMove}>
				<div className='flex flex-col gap-5'>
					{sprints.map((sprint) => (
						<SprintProjectSection
							key={sprint.id}
							sprint={sprint}
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
			</ProviderTableDnd>
		</div>
	);
};

export default ProjectBacklogView;
