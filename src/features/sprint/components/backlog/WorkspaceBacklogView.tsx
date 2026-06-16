"use client";

import { Filter, Search, ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTask } from "@/features/task/hooks/useTask";
import SprintFilter from "../spints/SprintFilter";
import SprintWorkspaceSection from "../spints/SprintWorkspaceSection";
import TableBacklog from "@/components/table/TableBacklog";

type WorkspaceBacklogViewProps = {
	workspaceId?: string;
	projectId?: string;
};

const WorkspaceBacklogView = ({
	workspaceId,
	projectId,
}: WorkspaceBacklogViewProps) => {
	const [selectedSprintId, setSelectedSprintId] = useState<string>("all");
	const [isBacklogOpen, setIsBacklogOpen] = useState(true);
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

			<Card className='flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm !py-0'>
				<div className='flex items-center justify-between gap-4 border-b border-border px-4 py-3 bg-transparent'>
					<div className='flex items-center gap-3'>
						<Button
							variant='ghost'
							size='icon'
							className='size-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:text-foreground transition-colors'
							onClick={() => setIsBacklogOpen((prev) => !prev)}
						>
							<ChevronDown
								className={cn("size-4 transition-transform duration-300", !isBacklogOpen && "-rotate-90")}
							/>
						</Button>

						<div className='flex flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<span className='text-[14px] font-semibold text-foreground'>
									Backlog tasks
								</span>
							</div>
							<p className='text-[12px] text-muted-foreground'>
								{taskBacklog.length} items in backlog
							</p>
						</div>
					</div>
				</div>

				{isBacklogOpen && (
					<div className='relative overflow-auto border-t-0'>
						<TableBacklog tasks={taskBacklog} containerId="backlog" showSprint={false} />
					</div>
				)}
			</Card>
		</div>
	);
};

export default WorkspaceBacklogView;
