import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/constants/permissions";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { cn } from "@/lib/utils";
import type { SprintItem } from "@/services/sprint/type";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { CompleteSprintDialog } from "@/components/dialog/CompleteSprintDialog";
import { StartSprintDialog } from "@/components/dialog/DialogStartSprint";
import { EditSprintDialog } from "@/components/dialog/DialogEditSprint";
import { DeleteSprintDialog } from "@/components/dialog/DialogDeleteSprint";
import { CancelSprintDialog } from "@/components/dialog/DialogCancelSprint";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BarChart2 } from "lucide-react";

enum SprintStatus {
	PLANNED = "PLANNED",
	ACTIVE = "ACTIVE",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

interface SprintSectionHeaderProps {
	sprint: SprintItem;
	status: SprintStatus | string;
	projectId: string;
	workspaceId: string;
	open: boolean;
	onToggle: () => void;
}

export function SprintSectionHeader({
	sprint,
	status,
	projectId,
	workspaceId,
	open,
	onToggle,
}: SprintSectionHeaderProps) {
	const tasks = sprint.tasks ?? [];
	const normalizedStatus = String(status).toUpperCase();
	const completedCount = tasks.filter((task: any) => task.status?.isDone === true).length;
	const openCount = tasks.filter((task: any) => task.status?.isDone !== true).length;
	const { slug } = useParams();

	return (
		<div className='flex items-center justify-between gap-4 border-b border-border bg-transparent px-4 py-3'>
			<div className='flex items-center gap-3'>
				<Button
					variant='ghost'
					size='icon'
					className='size-7 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors'
					onClick={onToggle}
				>
					<ChevronDown
						className={cn(
							"size-4 transition-transform duration-300",
							!open && "-rotate-90",
						)}
					/>
				</Button>

				<div className='flex flex-col gap-1'>
					<div className='flex items-center gap-2'>
						<span className='text-[14px] font-semibold text-foreground'>
							{sprint.name}
						</span>
						<span className='text-[12px] font-medium text-muted-foreground'>
							({tasks.length} work items)
						</span>
					</div>
				</div>
			</div>

			<div className='flex items-center gap-2'>
				{normalizedStatus === SprintStatus.PLANNED ? (
					<RequirePermission
						workspaceId={workspaceId}
						code={PERMISSIONS.SPRINT_START}
					>
						<StartSprintDialog
							defaultSprintName={sprint.name}
							projectId={projectId}
							sprintId={sprint.id}
							workspaceId={workspaceId}
							workItemCount={tasks.length}
						/>
					</RequirePermission>
				) : normalizedStatus === SprintStatus.ACTIVE ? (
					<RequirePermission
						workspaceId={workspaceId}
						code={PERMISSIONS.SPRINT_COMPLETE}
					>
						<CompleteSprintDialog
							defaultSprintName={sprint.name}
							projectId={projectId}
							sprintId={sprint.id}
							workspaceId={workspaceId}
							completedWorkItemCount={completedCount}
							openWorkItemCount={openCount}
						/>
					</RequirePermission>
				) : normalizedStatus === SprintStatus.COMPLETED ? (
					<RequirePermission
						workspaceId={workspaceId}
						code={PERMISSIONS.SPRINT_READ}
					>
						<Link href={`/dashboard/${slug}/projects/${projectId}/sprints/${sprint.id}/report`}>
							<Button
								variant="outline"
								size="sm"
								className="h-8 gap-2 text-primary hover:text-primary/90"
							>
								<BarChart2 className="w-4 h-4" />
								<span className="hidden sm:inline">View Report</span>
							</Button>
						</Link>
					</RequirePermission>
				) : null}

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
						<RequirePermission
							workspaceId={workspaceId}
							code={PERMISSIONS.SPRINT_UPDATE}
						>
							<EditSprintDialog
								workspaceId={workspaceId}
								projectId={projectId}
								sprintId={sprint.id}
								defaultSprintName={sprint.name}
								defaultGoal={sprint.goal || ""}
								defaultStartAt={sprint.startAt}
								defaultEndAt={sprint.endAt}
								isSprintActive={normalizedStatus === SprintStatus.ACTIVE}
								trigger={
									<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">
										Edit sprint
									</DropdownMenuItem>
								}
							/>
						</RequirePermission>
						{normalizedStatus === SprintStatus.ACTIVE && (
							<RequirePermission
								workspaceId={workspaceId}
								code={PERMISSIONS.SPRINT_CANCEL}
							>
								<CancelSprintDialog
									workspaceId={workspaceId}
									projectId={projectId}
									sprintId={sprint.id}
									sprintName={sprint.name}
									trigger={
										<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer text-orange-500 focus:text-orange-600">
											Cancel sprint
										</DropdownMenuItem>
									}
								/>
							</RequirePermission>
						)}
						{normalizedStatus !== SprintStatus.ACTIVE && normalizedStatus !== SprintStatus.COMPLETED && (
							<RequirePermission
								workspaceId={workspaceId}
								code={PERMISSIONS.SPRINT_DELETE}
							>
								<DeleteSprintDialog
									workspaceId={workspaceId}
									projectId={projectId}
									sprintId={sprint.id}
									sprintName={sprint.name}
									trigger={
										<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer text-red-500 focus:text-red-600">
											Delete sprint
										</DropdownMenuItem>
									}
								/>
							</RequirePermission>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
