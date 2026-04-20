export function getStatusClass(status: string) {
	switch (status) {
		case "Active":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "Pending":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "Suspended":
			return "border-red-500/20 bg-red-500/10 text-red-400";
		default:
			return "border-neutral-700 bg-neutral-800 text-neutral-300";
	}
}

export function getHealthClass(level: string) {
	switch (level) {
		case "success":
			return "text-emerald-400";
		case "warning":
			return "text-amber-400";
		case "danger":
			return "text-red-400";
		default:
			return "text-neutral-300";
	}
}