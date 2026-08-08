import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardTaskResponseDto } from "@/services/dashboard/type";
import { clampPercent, getPriorityClass, getStatusClass } from "../../utils/task-style";
import { formatDateTime } from "../../utils/date";
import Link from "next/link";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";

export function DashboardTaskItem({ task }: { task: DashboardTaskResponseDto }) {
	const progress = clampPercent(task.progressPercent);
	const { workspaceFindAll: { data: workspacesResponse } } = useWorkspace();
	const workspaces = workspacesResponse?.data || [];
	const workspaceSlug = workspaces.find((w) => w.id === task.workspaceId)?.slug || task.workspaceId;

	return (
		<div className='group rounded-xl border border-border/60 bg-background p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:bg-muted/20'>
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-start'>
				<div className='min-w-0'>
					<div className='flex flex-wrap items-center gap-2'>
						<h3 className='min-w-0 truncate text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors'>
							{task.title}
						</h3>
						<Badge
							variant='outline'
							className={cn("text-[10px] uppercase tracking-wider font-bold whitespace-nowrap", getPriorityClass(task.priorityLevel))}
						>
							{task.priorityName ?? "No priority"}
						</Badge>
						<Badge
							variant='outline'
							className={cn("text-[10px] uppercase tracking-wider font-bold whitespace-nowrap", getStatusClass(task.statusName))}
						>
							{task.statusName ?? "No status"}
						</Badge>
					</div>
					<p className='mt-2 truncate text-[12px] text-muted-foreground'>
						{workspaceSlug ? (
							<>
								<Link
									href={`/dashboard/${workspaceSlug}`}
									onClick={(e) => e.stopPropagation()}
									className="hover:text-foreground transition-colors hover:underline"
								>
									{task.workspaceName}
								</Link>
								{" / "}
								<Link
									href={`/dashboard/${workspaceSlug}/projects/${task.projectId}`}
									onClick={(e) => e.stopPropagation()}
									className="hover:text-foreground transition-colors hover:underline"
								>
									{task.projectName}
								</Link>
							</>
						) : (
							<>{task.workspaceName} / {task.projectName}</>
						)}
					</p>
				</div>

				<div className='text-left lg:text-right'>
					<p className='text-[13px] font-medium text-foreground'>
						{formatDateTime(task.dueAt)}
					</p>
					<p className='mt-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
						{progress}% hoàn thành
					</p>
				</div>
			</div>
			<Progress value={progress} className='mt-4 h-1.5 bg-muted/60' />
		</div>
	);
}
