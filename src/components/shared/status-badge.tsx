import { getTaskStatusKey } from "@/lib/task-status-style";
import { cn } from "@/lib/utils";

export const USER_FACING_STATUS_STYLE = {
	todo: {
		label: "Todo",
		badge: "bg-slate-500/10 border-slate-700 text-slate-300",
		dot: "bg-slate-400",
	},
	inprogress: {
		label: "In Progress",
		badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
		dot: "bg-blue-400",
	},
	done: {
		label: "Done",
		badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
		dot: "bg-emerald-400",
	},
};

export function getUserFacingStatusStyle(statusName?: string | null, isDone?: boolean) {
	const key = getTaskStatusKey(statusName, isDone);
	return USER_FACING_STATUS_STYLE[key];
}

interface StatusBadgeProps {
	statusName?: string | null;
	isDone?: boolean;
	className?: string;
}

export function StatusBadge({ statusName, isDone, className }: StatusBadgeProps) {
	const style = getUserFacingStatusStyle(statusName, isDone);

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
				style.badge,
				className
			)}
		>
			<span className={cn("size-1.5 rounded-full", style.dot)} />
			<span>{statusName || style.label}</span>
		</div>
	);
}
