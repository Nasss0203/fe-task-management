import { getTaskPriorityKey } from "@/lib/task-priority-style";
import { cn } from "@/lib/utils";

export const USER_FACING_PRIORITY_STYLE = {
	none: {
		label: "No priority",
		badge: "bg-slate-500/10 border-slate-700 text-slate-300",
		dot: "bg-slate-400",
	},
	low: {
		label: "Low",
		badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
		dot: "bg-emerald-400",
	},
	medium: {
		label: "Medium",
		badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
		dot: "bg-amber-400",
	},
	high: {
		label: "High",
		badge: "bg-rose-500/10 border-rose-500/20 text-rose-400",
		dot: "bg-rose-400",
	},
};

export function getUserFacingPriorityStyle(priorityName?: string | null) {
	const key = getTaskPriorityKey(priorityName);
	return USER_FACING_PRIORITY_STYLE[key];
}

interface PriorityBadgeProps {
	priorityName?: string | null;
	className?: string;
}

export function PriorityBadge({ priorityName, className }: PriorityBadgeProps) {
	const style = getUserFacingPriorityStyle(priorityName);

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
				style.badge,
				className
			)}
		>
			<span className={cn("size-1.5 rounded-full", style.dot)} />
			<span>{priorityName || style.label}</span>
		</div>
	);
}
