export type TaskPriorityKey = "none" | "low" | "medium" | "high";

type TaskPriorityStyle = {
	label: string;
	badge: string;
	dot: string;
};

export const TASK_PRIORITY_STYLE = {
	none: {
		label: "No priority",
		badge: "border-slate-500/20 bg-slate-500/10 text-slate-300",
		dot: "bg-slate-400",
	},
	low: {
		label: "Low",
		badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
		dot: "bg-emerald-400",
	},
	medium: {
		label: "Medium",
		badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
		dot: "bg-amber-400",
	},
	high: {
		label: "High",
		badge: "border-red-500/20 bg-red-500/10 text-red-300",
		dot: "bg-red-400",
	},
} as const satisfies Record<TaskPriorityKey, TaskPriorityStyle>;

export const normalizeTaskPriorityName = (value?: string | null) =>
	(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/[\s_-]+/g, "");

export const getTaskPriorityKey = (
	priorityName?: string | null,
): TaskPriorityKey => {
	switch (normalizeTaskPriorityName(priorityName)) {
		case "high":
		case "cao":
			return "high";
		case "medium":
		case "normal":
		case "trungbinh":
			return "medium";
		case "low":
		case "thap":
			return "low";
		default:
			return "none";
	}
};

export const getTaskPriorityStyle = (priorityName?: string | null) =>
	TASK_PRIORITY_STYLE[getTaskPriorityKey(priorityName)];
