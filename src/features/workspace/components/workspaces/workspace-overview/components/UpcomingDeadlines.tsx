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
			<div className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm'>
				<h3 className='mb-4 text-lg font-semibold text-foreground'>
					Deadline sắp tới
				</h3>
				<p className='text-sm text-muted-foreground'>
					Không có deadline trong 7 ngày tới
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm'>
			<h3 className='mb-4 text-lg font-semibold text-foreground'>
				Deadline sắp tới
			</h3>
			<div className='space-y-4'>
				{items?.map((item) => (
					<Link
						key={item.id}
						href={`/dashboard/${workspaceSlug}/projects/${item.projectId}`}
						className={cn(
							"flex items-center justify-between rounded-xl border border-border/50 bg-background/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md",
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
										: "bg-muted text-muted-foreground",
								)}
							>
								{item.isUrgent ? (
									<AlertTriangle size={18} />
								) : (
									<Clock size={18} />
								)}
							</div>
							<div className='flex flex-col'>
								<span className='text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors'>
									{item.title}
								</span>
								<span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
									{item.type === "task" ? "Task" : "Sprint"}
								</span>
							</div>
						</div>

						<div className='text-right shrink-0'>
							<p
								className={cn(
									"text-xs font-bold",
									item.isUrgent
										? "text-red-500"
										: "text-foreground",
								)}
							>
								{item.daysRemaining === 0
									? "Hôm nay"
									: `Còn ${item.daysRemaining} ngày`}
							</p>
							<p className='text-[10px] text-muted-foreground'>
								{formatDate(item.deadline)}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
