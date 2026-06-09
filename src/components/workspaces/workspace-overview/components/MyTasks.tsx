import { cn } from "@/lib/utils";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { WorkspaceOverviewMyTask } from "../workspace-overview.types";
import { formatDate } from "../workspace-overview.utils";

interface MyTasksProps {
	workspaceSlug: string;
	tasks: WorkspaceOverviewMyTask[];
}

export function MyTasks({ workspaceSlug, tasks }: MyTasksProps) {
	if (tasks?.length === 0) {
		return (
			<div className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm'>
				<h3 className='text-lg font-semibold text-foreground mb-6'>
					Task của tôi
				</h3>
				<p className='text-sm text-muted-foreground'>Bạn chưa có task nào</p>
			</div>
		);
	}

	return (
		<div className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm'>
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-lg font-semibold text-foreground'>
					Task của tôi
				</h3>
				<Link
					href={`/dashboard/${workspaceSlug}/tasks?assignee=me`}
					className='text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
				>
					Xem tất cả
				</Link>
			</div>

			<div className='space-y-3'>
				{tasks?.map((task) => (
					<Link
						key={task.id}
						href={`/dashboard/${workspaceSlug}/tasks/${task.id}`}
						className='group flex flex-col gap-3 rounded-xl border border-border/50 bg-background/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
					>
						<div className='flex items-start justify-between'>
							<div>
								<h4 className='text-sm font-semibold text-foreground line-clamp-1 group-hover:text-blue-400 transition-colors'>
									{task.title}
								</h4>
								<p className='text-[10px] text-muted-foreground mt-0.5'>
									{task.project.name}
								</p>
							</div>
							<ChevronRight
								size={14}
								className='text-muted-foreground group-hover:text-primary transition-colors'
							/>
						</div>

						<div className='flex items-center gap-3'>
							{task.priority && (
								<span
									className='text-[10px] font-bold uppercase tracking-wider'
									style={{
										color: task.priority.color || "#71717a",
									}}
								>
									{task.priority.name}
								</span>
							)}
							<span
								className='rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border'
								style={{
									backgroundColor: `${task.status.color || "#71717a"}1a`,
									color: task.status.color || "#71717a",
									borderColor: `${task.status.color || "#71717a"}33`,
								}}
							>
								{task.status.name}
							</span>
							<div
								className={cn(
									"ml-auto flex items-center gap-1.5 text-[10px]",
									task.isOverdue
										? "text-red-400 font-bold"
										: "text-muted-foreground",
								)}
							>
								<Calendar size={12} />
								<span>
									{task.dueAt
										? formatDate(task.dueAt)
										: "Chưa có"}
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
