"use client";

import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSprints } from "@/hooks/use-sprint";
import { useTask } from "@/hooks/use-task";
import TableBacklog from "../table/TableBacklog";
import type { BacklogRenderContext } from "./types";

type BacklogSectionProps = {
	context?: BacklogRenderContext;
	workspaceId: string;
	projectId: string;
	containerId: string;
};

const BacklogSection = ({
	context = "project",
	projectId,
	workspaceId,
	containerId,
}: BacklogSectionProps) => {
	const isProjectContext = context === "project";
	const { findTaskBacklog } = useTask(workspaceId, projectId);
	const taskBacklog = findTaskBacklog.data?.data ?? [];

	const { createSprint, sprintsQuery } = useSprints({
		projectId,
		workspaceId,
	});

	const lengSprint = sprintsQuery.data?.data.length ?? 0;

	const handleCreateSprint = () => {
		if (!workspaceId || !projectId) return;

		createSprint.mutate({
			workspaceId,
			projectId,
			name: `Sprint ${lengSprint + 1}`,
		});
	};

	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-1 rounded-none'>
			<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-3 py-3'>
				<div className='flex items-center gap-3'>
					<Button variant='ghost' size='icon' className='size-7'>
						<ChevronDown className='size-4 text-muted-foreground' />
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-sm font-semibold'>
								Backlog
							</span>
							<span className='text-sm text-muted-foreground'>
								({taskBacklog.length} work items)
							</span>
						</div>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{isProjectContext && (
						<Button
							variant='outline'
							size='sm'
							onClick={handleCreateSprint}
						>
							{createSprint.isPending
								? "Creating..."
								: "Create sprint"}
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
				<TableBacklog tasks={taskBacklog} containerId={containerId} />
			</div>
		</Card>
	);
};
export default BacklogSection;
