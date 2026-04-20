import type {
	AuditActionType,
	AuditSeverity,
	AuditTargetType,
} from "./audit-log-admin.types";

export function formatDate(date: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
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

export function getSeverityClass(severity: AuditSeverity) {
	switch (severity) {
		case "INFO":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "WARNING":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "CRITICAL":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getSeverityLabel(severity: AuditSeverity) {
	switch (severity) {
		case "INFO":
			return "Thông tin";
		case "WARNING":
			return "Cảnh báo";
		case "CRITICAL":
			return "Nghiêm trọng";
		default:
			return severity;
	}
}

export function getActionLabel(action: AuditActionType) {
	switch (action) {
		case "WORKSPACE_CREATED":
			return "Tạo workspace";
		case "WORKSPACE_DELETED":
			return "Xóa workspace";
		case "WORKSPACE_LOCKED":
			return "Khóa workspace";
		case "USER_LOCKED":
			return "Khóa tài khoản";
		case "USER_UNLOCKED":
			return "Mở khóa tài khoản";
		case "ROLE_CHANGED":
			return "Đổi role";
		case "BILLING_CHANGED":
			return "Thay đổi billing";
		case "ADMIN_LOGIN":
			return "Đăng nhập admin";
		default:
			return action;
	}
}

export function getTargetLabel(target: AuditTargetType) {
	switch (target) {
		case "WORKSPACE":
			return "Workspace";
		case "USER":
			return "User";
		case "ROLE":
			return "Role";
		case "BILLING":
			return "Billing";
		case "AUTH":
			return "Auth";
		default:
			return target;
	}
}

export function matchesAuditDateFilter(date: string, filter: string) {
	if (filter === "all") return true;

	const value = new Date(date).getTime();
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	if (filter === "24h") return now - value <= day;
	if (filter === "7d") return now - value <= 7 * day;
	if (filter === "30d") return now - value <= 30 * day;

	return true;
}

export function prettyJson(value: Record<string, unknown> | null) {
	if (!value) return "No data";
	return JSON.stringify(value, null, 2);
}
