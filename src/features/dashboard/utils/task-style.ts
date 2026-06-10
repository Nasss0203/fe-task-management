export const clampPercent = (value?: number | null) => {
	if (typeof value !== "number" || Number.isNaN(value)) return 0;

	return Math.min(100, Math.max(0, value));
};

export const formatMinutes = (minutes: number) => {
	if (minutes < 60) return `${minutes} phút`;

	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;

	return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const getPriorityClass = (priorityLevel?: number | null) => {
	if (!priorityLevel) {
		return "border-border bg-muted text-muted-foreground";
	}

	if (priorityLevel >= 3) {
		return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300";
	}

	if (priorityLevel === 2) {
		return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
	}

	return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
};

export const getStatusClass = (statusName?: string | null) => {
	const normalized = (statusName ?? "").trim().toLowerCase();

	if (normalized.includes("progress")) {
		return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300";
	}

	if (normalized.includes("done") || normalized.includes("complete")) {
		return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
	}

	return "border-border bg-muted text-muted-foreground";
};

export const getActivityTone = (action: string) => {
	if (action.includes("START")) return "bg-emerald-500";
	if (action.includes("TASK")) return "bg-blue-500";
	if (action.includes("SPRINT")) return "bg-amber-500";

	return "bg-muted-foreground";
};
