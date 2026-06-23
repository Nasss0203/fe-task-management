import { Badge } from "@/components/ui/badge";
import type { DashboardWorkspaceResponseDto } from "@/services/dashboard/type";
import { FolderKanban } from "lucide-react";
import Link from "next/link";

export function RecentSpaceCard({
	workspace,
	openWorkCount,
	doneCount,
}: {
	workspace: DashboardWorkspaceResponseDto;
	openWorkCount: number;
	doneCount: number;
}) {
	return (
		<div className='group flex h-full flex-col min-w-0 overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 shadow-sm'>
			<div className='flex h-full'>
				<div className='w-1.5 shrink-0 bg-blue-500/80 transition-colors group-hover:bg-blue-400' />
				<div className='flex flex-1 flex-col min-w-0 p-4'>
					<div className='flex items-start gap-3'>
						<div className='flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'>
							<FolderKanban className='size-5' strokeWidth={1.5} />
						</div>
						<div className='min-w-0 flex-1 mt-0.5'>
							<p className='truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
								{workspace.name}
							</p>
							<p className='mt-0.5 truncate text-xs text-muted-foreground'>
								Team workspace
							</p>
						</div>
					</div>

					<div className='mt-4 flex-1 space-y-2'>
						<p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
							Quick links
						</p>
						<div className='flex flex-col gap-1.5'>
							<div className='flex items-center justify-between gap-2 rounded-md p-1 transition-colors hover:bg-muted -mx-1 px-1.5'>
								<Link
									href='/dashboard/my-tasks'
									className='truncate text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-1'
								>
									My open work items
								</Link>
								<Badge variant='secondary' className='h-5 min-w-[20px] justify-center rounded-md border-border bg-muted px-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/80'>
									{openWorkCount}
								</Badge>
							</div>
							<div className='flex items-center justify-between gap-2 rounded-md p-1 transition-colors hover:bg-muted -mx-1 px-1.5'>
								<Link
									href='/dashboard/my-tasks'
									className='truncate text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-1'
								>
									Done work items
								</Link>
								<Badge
									variant='secondary'
									className='h-5 min-w-[20px] justify-center rounded-md border-border bg-muted px-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/80'
								>
									{doneCount}
								</Badge>
							</div>
						</div>
					</div>

					<div className='mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-muted-foreground'>
						<span>{workspace.projectCount || 1} {workspace.projectCount === 1 ? 'project' : 'projects'}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
