"use client";

import { Filter, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useTask } from "@/features/task/hooks/useTask";
import SprintFilter from "../spints/SprintFilter";
import SprintWorkspaceSection from "../spints/SprintWorkspaceSection";

type WorkspaceBacklogViewProps = {
	workspaceId?: string;
	projectId?: string;
};

const WorkspaceBacklogView = ({
	workspaceId,
	projectId,
}: WorkspaceBacklogViewProps) => {
	const [selectedSprintId, setSelectedSprintId] = useState<string>("all");
	const { findTaskBacklog } = useTask(
		workspaceId as string,
		projectId as string,
	);
	const taskBacklog = findTaskBacklog.data?.data ?? [];

	return (
		<div className='flex flex-col gap-5'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div className='flex items-center gap-3'>
					<div className='relative w-65'>
						<Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							placeholder='Search task'
							className='h-10 pl-9'
						/>
					</div>

					<Button variant='outline' size='icon' className='h-10 w-10'>
						<Filter className='size-4' />
					</Button>
				</div>

				<SprintFilter
					value={selectedSprintId}
					onChange={setSelectedSprintId}
				/>
			</div>

			<SprintWorkspaceSection
				projectId={projectId as string}
				workspaceId={workspaceId as string}
			/>

			{/* <div className='overflow-x-auto px-1'>
				<TableBacklog tasks={taskBacklog} />
			</div> */}
		</div>
	);
};

export default WorkspaceBacklogView;
