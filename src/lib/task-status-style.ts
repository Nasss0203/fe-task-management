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
		background: "bg-neutral-600/60",
		columnBackground: "bg-neutral-600/30",
		badge: "border-neutral-500/20 bg-neutral-600/20 text-neutral-200",
		dot: "bg-neutral-400",
		ring: "ring-neutral-400/40",
	},
	inprogress: {
		label: "In Progress",
		background: "bg-blue-500/20",
		columnBackground: "bg-blue-500/20",
		badge: "border-blue-500/20 bg-blue-500/10 text-blue-300",
		dot: "bg-blue-400",
		ring: "ring-blue-400/40",
	},
	done: {
		label: "Done",
		background: "bg-emerald-500/30",
		columnBackground: "bg-emerald-500/20",
		badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
		dot: "bg-emerald-400",
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
