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
			<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
				<h3 className='text-lg font-semibold text-white mb-6'>
					Task của tôi
				</h3>
				<p className='text-sm text-zinc-500'>Bạn chưa có task nào</p>
			</div>
		);
	}

	return (
		<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
			<div className='mb-6 flex items-center justify-between'>
				<h3 className='text-lg font-semibold text-white'>
					Task của tôi
				</h3>
				<Link
					href={`/dashboard/${workspaceSlug}/tasks?assignee=me`}
					className='text-xs font-medium text-zinc-400 hover:text-white transition-colors'
				>
					Xem tất cả
				</Link>
			</div>

			<div className='space-y-3'>
				{tasks?.map((task) => (
					<Link
						key={task.id}
						href={`/dashboard/${workspaceSlug}/tasks/${task.id}`}
						className='group flex flex-col gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-800/40'
					>
						<div className='flex items-start justify-between'>
							<div>
								<h4 className='text-sm font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors'>
									{task.title}
								</h4>
								<p className='text-[10px] text-zinc-500 mt-0.5'>
									{task.project.name}
								</p>
							</div>
							<ChevronRight
								size={14}
								className='text-zinc-600 group-hover:text-zinc-400'
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
										: "text-zinc-500",
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
