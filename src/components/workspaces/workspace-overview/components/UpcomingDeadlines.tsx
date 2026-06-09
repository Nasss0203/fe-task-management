import { cn } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { WorkspaceOverviewDeadline } from "../workspace-overview.types";
import { formatDate } from "../workspace-overview.utils";

interface UpcomingDeadlinesProps {
	workspaceSlug: string;
	items: WorkspaceOverviewDeadline[];
}

export function UpcomingDeadlines({
	workspaceSlug,
	items,
}: UpcomingDeadlinesProps) {
	if (items?.length === 0) {
		return (
			<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
				<h3 className='mb-4 text-lg font-semibold text-white'>
					Deadline sắp tới
				</h3>
				<p className='text-sm text-zinc-500'>
					Không có deadline trong 7 ngày tới
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
			<h3 className='mb-4 text-lg font-semibold text-white'>
				Deadline sắp tới
			</h3>
			<div className='space-y-4'>
				{items?.map((item) => (
					<Link
						key={item.id}
						href={
							item.type === "task"
								? `/dashboard/${workspaceSlug}/tasks/${item.id}`
								: `/dashboard/${workspaceSlug}/tasks`
						}
						className={cn(
							"flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-800/40",
							item.isUrgent &&
								"border-red-500/20 bg-red-500/5 shadow-[0_0_15px_-5px_rgba(239,68,68,0.1)]",
						)}
					>
						<div className='flex items-center gap-3'>
							<div
								className={cn(
									"flex h-10 w-10 items-center justify-center rounded-lg",
									item.isUrgent
										? "bg-red-500/10 text-red-500"
										: "bg-zinc-800 text-zinc-400",
								)}
							>
								{item.isUrgent ? (
									<AlertTriangle size={18} />
								) : (
									<Clock size={18} />
								)}
							</div>
							<div className='flex flex-col'>
								<span className='text-sm font-semibold text-white line-clamp-1'>
									{item.title}
								</span>
								<span className='text-[10px] font-bold uppercase tracking-wider text-zinc-500'>
									{item.type === "task" ? "Task" : "Sprint"}
								</span>
							</div>
						</div>

						<div className='text-right shrink-0'>
							<p
								className={cn(
									"text-xs font-bold",
									item.isUrgent
										? "text-red-400"
										: "text-zinc-300",
								)}
							>
								{item.daysRemaining === 0
									? "Hôm nay"
									: `Còn ${item.daysRemaining} ngày`}
							</p>
							<p className='text-[10px] text-zinc-500'>
								{formatDate(item.deadline)}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
