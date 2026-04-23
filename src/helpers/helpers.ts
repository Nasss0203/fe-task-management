export function getStatusBadgeVariant(status: string) {
	switch (status) {
		case "On Track":
		case "Almost Done":
			return "default";
		case "At Risk":
			return "destructive";
		default:
			return "secondary";
	}
}

export function getTaskBadgeClass(status: string) {
	switch (status) {
		case "In Progress":
			return "bg-blue-500/10 text-blue-600 border-blue-200";
		case "Todo":
			return "bg-neutral-500/10 text-neutral-700 border-neutral-200 dark:text-neutral-300";
		case "Review":
			return "bg-amber-500/10 text-amber-600 border-amber-200";
		default:
			return "";
	}
}

export function getPriorityClass(priority: string) {
	switch (priority) {
		case "High":
			return "bg-red-500/10 text-red-600 border-red-200";
		case "Medium":
			return "bg-amber-500/10 text-amber-600 border-amber-200";
		case "Low":
			return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
		default:
			return "";
	}
}
