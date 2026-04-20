export function getWorkspaceStatusClass(status: string) {
	switch (status) {
		case "ACTIVE":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "LOCKED":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		case "DELETED":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getWorkspaceStatusLabel(status: string) {
	switch (status) {
		case "ACTIVE":
			return "Đang hoạt động";
		case "LOCKED":
			return "Bị khóa";
		case "DELETED":
			return "Đã xóa mềm";
		default:
			return status;
	}
}

export function getWorkspacePlanClass(plan: string) {
	switch (plan) {
		case "FREE":
			return "border-white/10 bg-white/5 text-neutral-300";
		case "PRO":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "ENTERPRISE":
			return "border-violet-500/20 bg-violet-500/10 text-violet-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getWorkspacePlanLabel(plan: string) {
	switch (plan) {
		case "FREE":
			return "Free";
		case "PRO":
			return "Pro";
		case "ENTERPRISE":
			return "Enterprise";
		default:
			return plan;
	}
}

export function getWorkspaceMemberRoleClass(role: string) {
	switch (role) {
		case "OWNER":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "ADMIN":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function formatDate(date: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(date));
}

export function formatRelativeTime(date: string) {
	const diff = Date.now() - new Date(date).getTime();

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (diff < minute) return "Vừa xong";
	if (diff < hour) return `${Math.floor(diff / minute)} phút trước`;
	if (diff < day) return `${Math.floor(diff / hour)} giờ trước`;
	if (diff < 7 * day) return `${Math.floor(diff / day)} ngày trước`;

	return formatDate(date);
}

export function formatStorage(used: number, limit: number) {
	return `${used.toFixed(1)} / ${limit} GB`;
}

export function matchesWorkspaceCreatedFilter(date: string, filter: string) {
	if (filter === "all") return true;

	const createdAt = new Date(date).getTime();
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	if (filter === "7d") return now - createdAt <= 7 * day;
	if (filter === "30d") return now - createdAt <= 30 * day;
	if (filter === "90d") return now - createdAt <= 90 * day;

	return true;
}

export function getInitials(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase())
		.join("");
}
