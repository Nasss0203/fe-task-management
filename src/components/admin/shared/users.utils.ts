export function getStatusClass(status: string) {
	switch (status) {
		case "ACTIVE":
			return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
		case "LOCKED":
			return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
		case "PENDING":
			return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
		default:
			return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
	}
}

export function getStatusLabel(status: string) {
	switch (status) {
		case "ACTIVE":
			return "Hoạt động";
		case "LOCKED":
			return "Bị khóa";
		case "PENDING":
			return "Chờ kích hoạt";
		default:
			return status;
	}
}

export function getSystemRoleClass(role: string) {
	switch (role) {
		case "SYSTEM_ADMIN":
			return "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";
		default:
			return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
	}
}

export function getSystemRoleLabel(role: string) {
	switch (role) {
		case "SYSTEM_ADMIN":
			return "System Admin";
		default:
			return "User";
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

export function matchesCreatedFilter(date: string, filter: string) {
	if (filter === "all") return true;

	const createdAt = new Date(date).getTime();
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	if (filter === "7d") return now - createdAt <= 7 * day;
	if (filter === "30d") return now - createdAt <= 30 * day;
	if (filter === "90d") return now - createdAt <= 90 * day;

	return true;
}

export function getInitials(fullName: string) {
	return fullName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase())
		.join("");
}
