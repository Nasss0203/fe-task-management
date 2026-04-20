import type {
	MonitoringEventStatus,
	MonitoringEventType,
	MonitoringServiceCategory,
	MonitoringServiceStatus,
	MonitoringSeverity,
} from "./monitoring-admin.types";

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

export function matchesMonitoringDateFilter(date: string, filter: string) {
	if (filter === "all") return true;

	const value = new Date(date).getTime();
	const now = Date.now();
	const hour = 60 * 60 * 1000;
	const day = 24 * hour;

	if (filter === "1h") return now - value <= hour;
	if (filter === "24h") return now - value <= day;
	if (filter === "7d") return now - value <= 7 * day;
	if (filter === "30d") return now - value <= 30 * day;

	return true;
}

export function getServiceStatusLabel(status: MonitoringServiceStatus) {
	switch (status) {
		case "HEALTHY":
			return "Ổn định";
		case "DEGRADED":
			return "Suy giảm";
		case "DOWN":
			return "Ngừng hoạt động";
		default:
			return status;
	}
}

export function getServiceStatusClass(status: MonitoringServiceStatus) {
	switch (status) {
		case "HEALTHY":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "DEGRADED":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "DOWN":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getSeverityLabel(severity: MonitoringSeverity) {
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

export function getSeverityClass(severity: MonitoringSeverity) {
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

export function getEventTypeLabel(type: MonitoringEventType) {
	switch (type) {
		case "REQUEST_ERROR":
			return "Request error";
		case "QUEUE_FAILED":
			return "Queue failed";
		case "EMAIL_FAILED":
			return "Email failed";
		case "WEBHOOK_FAILED":
			return "Webhook failed";
		case "SYSTEM_LOG":
			return "System log";
		case "ALERT":
			return "Alert";
		default:
			return type;
	}
}

export function getEventTypeClass(type: MonitoringEventType) {
	switch (type) {
		case "REQUEST_ERROR":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		case "QUEUE_FAILED":
			return "border-violet-500/20 bg-violet-500/10 text-violet-400";
		case "EMAIL_FAILED":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "WEBHOOK_FAILED":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "SYSTEM_LOG":
			return "border-white/10 bg-white/5 text-neutral-300";
		case "ALERT":
			return "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getEventStatusLabel(status: MonitoringEventStatus) {
	switch (status) {
		case "OPEN":
			return "Mới";
		case "ACKNOWLEDGED":
			return "Đã ghi nhận";
		case "RESOLVED":
			return "Đã xử lý";
		default:
			return status;
	}
}

export function getEventStatusClass(status: MonitoringEventStatus) {
	switch (status) {
		case "OPEN":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		case "ACKNOWLEDGED":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "RESOLVED":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getServiceCategoryLabel(category: MonitoringServiceCategory) {
	switch (category) {
		case "API":
			return "API";
		case "DATABASE":
			return "Database";
		case "QUEUE":
			return "Queue";
		case "MAIL":
			return "Mail";
		case "STORAGE":
			return "Storage";
		case "WEBHOOK":
			return "Webhook";
		default:
			return category;
	}
}

export function prettyJson(value: Record<string, unknown>) {
	return JSON.stringify(value, null, 2);
}
