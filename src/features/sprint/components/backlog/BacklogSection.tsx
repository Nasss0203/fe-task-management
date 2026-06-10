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

import { useSprints } from "@/features/sprint/hooks/useSprint";
import { useTask } from "@/features/task/hooks/useTask";
import { useState } from "react";
import TableBacklog from "@/components/table/TableBacklog";
import type { BacklogRenderContext } from "./types";
import { cn } from "@/lib/utils";



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
	const [open, setOpen] = useState<boolean>(true);
	const isProjectContext = context === "project";
	const { findTaskBacklog } = useTask(
		workspaceId,
		projectId,
		undefined,
	);
	const taskBacklog = findTaskBacklog.data?.data ?? [];

	const { createSprint } = useSprints({
		projectId,
		workspaceId,
	});

	const handleCreateSprint = () => {
		if (!workspaceId || !projectId) return;

		createSprint.mutate({
			workspaceId,
			projectId,
		});
	};

	const handleOpenTable = () => {
		setOpen(!open);
	};

	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-0 rounded-2xl border-border bg-muted/50'>
			<div className='flex items-center justify-between gap-4 border-b border-border bg-muted/50 px-4 py-3'>
				<div className='flex items-center gap-3'>
					<Button
						variant='ghost'
						size='icon'
						className='size-7 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors'
						onClick={handleOpenTable}
					>
						<ChevronDown className={cn("size-4 transition-transform duration-300", !open && "-rotate-90")} />
					</Button>

					<div className='flex items-center gap-2.5'>
						<span className='text-[14px] font-semibold text-foreground'>
							Backlog
						</span>
						<span className='text-[12px] font-medium text-muted-foreground'>
							{taskBacklog.length} items
						</span>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					{isProjectContext && (
						<Button
							variant='outline'
							size='sm'
							className="h-8 rounded-lg border-border bg-background text-[12px] font-medium hover:hover:bg-accent hover:text-accent-foreground hover:border-neutral-600 transition-all hover:text-foreground"
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
								className='size-8 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground transition-colors'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className="bg-popover border-border rounded-xl min-w-[160px]">
							<DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">Collapse</DropdownMenuItem>
							<DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">Export tasks</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{open ? (
				<div className='flex flex-col gap-6 p-4'>
					<div className="overflow-x-auto rounded-xl border border-border/50 bg-muted/50">
						<TableBacklog tasks={taskBacklog} containerId={containerId} />
					</div>

				</div>
			) : null}
		</Card>
	);
};
export default BacklogSection;
