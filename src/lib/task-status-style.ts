export type TaskStatusKey = "todo" | "inprogress" | "done";

type TaskStatusStyle = {
	label: string;
	background: string;
	columnBackground: string;
	badge: string;
	dot: string;
	ring: string;
};

export const TASK_STATUS_STYLE = {
	todo: {
		label: "Todo",
		background: "bg-card dark:bg-neutral-800/40",
		columnBackground: "bg-neutral-200/80 dark:bg-neutral-800/30",
		badge: "border-neutral-300 bg-neutral-200 text-neutral-700 dark:border-neutral-500/20 dark:bg-neutral-600/20 dark:text-neutral-200",
		dot: "bg-neutral-500",
		ring: "ring-neutral-400/40",
	},
	inprogress: {
		label: "In Progress",
		background: "bg-card dark:bg-blue-900/20",
		columnBackground: "bg-blue-100/80 dark:bg-blue-900/10",
		badge: "border-blue-300 bg-blue-200 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
		dot: "bg-blue-600 dark:bg-blue-400",
		ring: "ring-blue-400/40",
	},
	done: {
		label: "Done",
		background: "bg-card dark:bg-emerald-900/20",
		columnBackground: "bg-emerald-100/80 dark:bg-emerald-900/10",
		badge: "border-emerald-300 bg-emerald-200 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
		dot: "bg-emerald-600 dark:bg-emerald-400",
		ring: "ring-emerald-400/40",
	},
} as const satisfies Record<TaskStatusKey, TaskStatusStyle>;

export const normalizeTaskStatusName = (value?: string | null) =>
	(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/[\s_-]+/g, "");

export const getTaskStatusKey = (
	statusName?: string | null,
	isDone?: boolean,
): TaskStatusKey => {
	if (isDone) return "done";

	switch (normalizeTaskStatusName(statusName)) {
		case "done":
		case "complete":
		case "completed":
		case "closed":
		case "hoantat":
		case "dahoanthanh":
			return "done";
		case "inprogress":
		case "progress":
		case "doing":
		case "active":
		case "dangthuchien":
			return "inprogress";
		default:
			return "todo";
	}
};

export const getTaskStatusStyle = (
	statusName?: string | null,
	isDone?: boolean,
) => TASK_STATUS_STYLE[getTaskStatusKey(statusName, isDone)];

export const getTaskStatusBackgroundClass = (
	statusName?: string | null,
	isDone?: boolean,
) => getTaskStatusStyle(statusName, isDone).background;

export const getTaskStatusColumnClass = (
	statusName?: string | null,
	isDone?: boolean,
) => getTaskStatusStyle(statusName, isDone).columnBackground;

export const getTaskStatusBadgeClass = (
	statusName?: string | null,
	isDone?: boolean,
) => getTaskStatusStyle(statusName, isDone).badge;

export const getTaskStatusDotClass = (
	statusName?: string | null,
	isDone?: boolean,
) => getTaskStatusStyle(statusName, isDone).dot;
