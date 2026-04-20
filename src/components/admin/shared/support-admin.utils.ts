import type {
	SupportIssueType,
	SupportMessageSenderType,
	SupportTicketPriority,
	SupportTicketStatus,
} from "./support-admin.types";

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

export function matchesSupportDateFilter(date: string, filter: string) {
	if (filter === "all") return true;

	const value = new Date(date).getTime();
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	if (filter === "24h") return now - value <= day;
	if (filter === "7d") return now - value <= 7 * day;
	if (filter === "30d") return now - value <= 30 * day;

	return true;
}

export function getSupportIssueTypeLabel(type: SupportIssueType) {
	switch (type) {
		case "SUPPORT_TICKET":
			return "Support ticket";
		case "BUG_REPORT":
			return "Bug report";
		case "PAYMENT_ISSUE":
			return "Lỗi thanh toán";
		case "INVITE_ISSUE":
			return "Lỗi invite";
		case "SYNC_ISSUE":
			return "Lỗi đồng bộ";
		case "LOGIN_ISSUE":
			return "Lỗi đăng nhập";
		default:
			return type;
	}
}

export function getSupportIssueTypeClass(type: SupportIssueType) {
	switch (type) {
		case "SUPPORT_TICKET":
			return "border-white/10 bg-white/5 text-neutral-300";
		case "BUG_REPORT":
			return "border-violet-500/20 bg-violet-500/10 text-violet-400";
		case "PAYMENT_ISSUE":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "INVITE_ISSUE":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "SYNC_ISSUE":
			return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
		case "LOGIN_ISSUE":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getSupportPriorityLabel(priority: SupportTicketPriority) {
	switch (priority) {
		case "LOW":
			return "Thấp";
		case "MEDIUM":
			return "Trung bình";
		case "HIGH":
			return "Cao";
		case "URGENT":
			return "Khẩn cấp";
		default:
			return priority;
	}
}

export function getSupportPriorityClass(priority: SupportTicketPriority) {
	switch (priority) {
		case "LOW":
			return "border-white/10 bg-white/5 text-neutral-300";
		case "MEDIUM":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "HIGH":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "URGENT":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getSupportStatusLabel(status: SupportTicketStatus) {
	switch (status) {
		case "OPEN":
			return "Mới mở";
		case "IN_PROGRESS":
			return "Đang xử lý";
		case "WAITING_CUSTOMER":
			return "Chờ khách hàng";
		case "RESOLVED":
			return "Đã xử lý";
		case "CLOSED":
			return "Đã đóng";
		default:
			return status;
	}
}

export function getSupportStatusClass(status: SupportTicketStatus) {
	switch (status) {
		case "OPEN":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "IN_PROGRESS":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "WAITING_CUSTOMER":
			return "border-violet-500/20 bg-violet-500/10 text-violet-400";
		case "RESOLVED":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "CLOSED":
			return "border-white/10 bg-white/5 text-neutral-300";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}

export function getSupportSenderLabel(senderType: SupportMessageSenderType) {
	switch (senderType) {
		case "CUSTOMER":
			return "Khách hàng";
		case "SUPPORT":
			return "Support";
		case "SYSTEM":
			return "System";
		default:
			return senderType;
	}
}

export function getSupportSenderClass(senderType: SupportMessageSenderType) {
	switch (senderType) {
		case "CUSTOMER":
			return "border-white/10 bg-white/5 text-neutral-300";
		case "SUPPORT":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "SYSTEM":
			return "border-violet-500/20 bg-violet-500/10 text-violet-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
	}
}
