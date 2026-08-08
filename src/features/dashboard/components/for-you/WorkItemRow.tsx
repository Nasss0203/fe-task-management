import { cn } from "@/lib/utils";
import type { DashboardTaskResponseDto } from "@/services/dashboard/type";
import { ClipboardList } from "lucide-react";
import { getPriorityClass, getStatusClass } from "@/features/dashboard/utils/task-style";
import Link from "next/link";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";

const getDateOnly = (value?: string | null) => {
	if (!value) return null;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;

	date.setHours(0, 0, 0, 0);
	return date;
};

const formatTaskKey = (task: DashboardTaskResponseDto, index: number) => {
	const prefix = task.projectName
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.slice(0, 3)
		.toUpperCase();

	return `${prefix || "TASK"}-${index + 1}`;
};

const getTaskStateLabel = (task: DashboardTaskResponseDto) => {
	const dueDate = getDateOnly(task.dueAt);
	if (!dueDate) return "Không có hạn";

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (dueDate < today) return "Quá hạn";
	if (dueDate.getTime() === today.getTime()) return "Hôm nay";

	return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dueDate);
};

const getTaskStateClass = (task: DashboardTaskResponseDto) => {
	const label = getTaskStateLabel(task);

	if (label === "Quá hạn") return "text-red-500 dark:text-red-400";
	if (label === "Hôm nay") return "text-blue-500 dark:text-blue-400";

	return "text-muted-foreground";
};

const getInitials = (name?: string | null) => {
	if (!name) return "ME";

	const words = name.trim().split(/\s+/).filter(Boolean);
	if (!words.length) return "ME";

	return words
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();
};

export function WorkItemRow({
	task,
	index,
	displayName,
	onClick,
}: {
	task: DashboardTaskResponseDto;
	index: number;
	displayName?: string;
	onClick?: (task: DashboardTaskResponseDto) => void;
}) {
	const { workspaceFindAll: { data: workspacesResponse } } = useWorkspace();
	const workspaces = workspacesResponse?.data || [];
	const workspaceSlug = workspaces.find((w) => w.id === task.workspaceId)?.slug || task.workspaceId;

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onClick?.(task)}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick?.(task);
				}
			}}
			className='cursor-pointer group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 -mx-3'
		>
			<div className='flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground'>
				<ClipboardList className='size-4' />
			</div>

			<div className='min-w-0'>
				<p className='truncate text-[14px] font-semibold text-foreground transition-colors group-hover:text-primary'>{task.title}</p>
				<div className='mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-muted-foreground'>
					<span className="uppercase tracking-wider text-muted-foreground/80">{formatTaskKey(task, index)}</span>
					<span className="text-muted-foreground/50">•</span>
					{workspaceSlug ? (
						<Link
							href={`/dashboard/${workspaceSlug}/projects/${task.projectId}`}
							onClick={(e) => e.stopPropagation()}
							className="truncate hover:text-foreground transition-colors hover:underline"
						>
							{task.projectName}
						</Link>
					) : (
						<span className='truncate'>{task.projectName}</span>
					)}
					<span className="text-muted-foreground/50">•</span>
					{workspaceSlug ? (
						<Link
							href={`/dashboard/${workspaceSlug}`}
							onClick={(e) => e.stopPropagation()}
							className="truncate hover:text-foreground transition-colors hover:underline"
						>
							{task.workspaceName}
						</Link>
					) : (
						<span className='truncate'>{task.workspaceName}</span>
					)}
				</div>
			</div>

			<div className='flex min-w-[200px] items-center justify-end gap-4'>
				<div className='hidden sm:flex items-center gap-2'>
					{task.priorityName && (
						<span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", getPriorityClass(task.priorityLevel))}>
							{task.priorityName}
						</span>
					)}
					<span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", getStatusClass(task.statusName))}>
						{task.statusName || "To do"}
					</span>
				</div>
				<span className={cn("hidden md:inline text-[12px] font-medium min-w-[70px] text-right", getTaskStateClass(task))}>
					{getTaskStateLabel(task)}
				</span>
				<div className='flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-bold tracking-wider text-foreground shadow-sm'>
					{getInitials(displayName)}
				</div>
			</div>
		</div>
	);
}
