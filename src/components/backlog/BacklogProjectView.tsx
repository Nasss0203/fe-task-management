"use client";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSprints } from "@/hooks/use-sprint";
import SprintSection from "../spints/SprintSection";
import BacklogSection from "./BacklogSection";

type BacklogProjectViewProps = {
	workspaceId?: string;
	projectId?: string;
};

const BacklogProjectView = ({
	workspaceId,
	projectId,
}: BacklogProjectViewProps) => {
	const { sprintsQuery } = useSprints({ workspaceId, projectId });
	const sprints = sprintsQuery.data?.data ?? [];
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

			<div className='flex flex-col gap-5'>
				{sprints?.map((sprint) => (
					<SprintSection key={sprint.id} sprint={sprint} />
				))}

				<BacklogSection
					context='project'
					projectId={projectId as string}
					workspaceId={workspaceId as string}
				/>
			</div>
		</div>
	);
};

export default BacklogProjectView;
