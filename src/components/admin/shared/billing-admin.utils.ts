import type {
	BillingCycle,
	BillingSection,
	CouponStatus,
	CouponType,
	PaymentStatus,
	PlanStatus,
	SubscriptionStatus,
} from "./billing-admin.types";

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		currencyDisplay: "symbol",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
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

export function toDateInputValue(date: string) {
	return new Date(date).toISOString().slice(0, 10);
}

export function getInitials(value: string) {
	return value
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function getPlanStatusClass(status: PlanStatus) {
	switch (status) {
		case "ACTIVE":
			return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
		case "DISABLED":
			return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
		case "DRAFT":
			return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
		default:
			return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
	}
}

export function getPlanStatusLabel(status: PlanStatus) {
	switch (status) {
		case "ACTIVE":
			return "Đang bán";
		case "DISABLED":
			return "Đã tắt";
		case "DRAFT":
			return "Bản nháp";
		default:
			return status;
	}
}

export function getSubscriptionStatusClass(status: SubscriptionStatus) {
	switch (status) {
		case "ACTIVE":
			return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
		case "TRIAL":
			return "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";
		case "EXPIRED":
			return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
		case "CANCELED":
			return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
		default:
			return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
	}
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus) {
	switch (status) {
		case "ACTIVE":
			return "Đang active";
		case "TRIAL":
			return "Đang trial";
		case "EXPIRED":
			return "Hết hạn";
		case "CANCELED":
			return "Đã hủy";
		default:
			return status;
	}
}

export function getCouponStatusClass(status: CouponStatus) {
	switch (status) {
		case "ACTIVE":
			return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
		case "INACTIVE":
			return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
		case "EXPIRED":
			return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
		default:
			return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
	}
}

export function getCouponStatusLabel(status: CouponStatus) {
	switch (status) {
		case "ACTIVE":
			return "Đang chạy";
		case "INACTIVE":
			return "Đã tắt";
		case "EXPIRED":
			return "Hết hạn";
		default:
			return status;
	}
}

export function getCouponTypeLabel(type: CouponType) {
	switch (type) {
		case "PERCENT":
			return "Giảm %";
		case "FIXED":
			return "Giảm cố định";
		case "TRIAL_DAYS":
			return "Ngày trial";
		default:
			return type;
	}
}

export function getPaymentStatusClass(status: PaymentStatus) {
	switch (status) {
		case "PAID":
			return "text-[#15803D]";
		case "FAILED":
			return "text-[#B91C1C]";
		case "REFUNDED":
			return "text-[#A16207]";
		case "PENDING":
			return "text-[#1D4ED8]";
		default:
			return "text-[#475569]";
	}
}

export function getCycleLabel(cycle: BillingCycle) {
	return cycle === "MONTHLY" ? "Tháng" : "Năm";
}

export function matchesBillingDateFilter(date: string, filter: string) {
	if (filter === "all") return true;

	const createdAt = new Date(date).getTime();
	const now = Date.now();
	const day = 24 * 60 * 60 * 1000;

	if (filter === "7d") return now - createdAt <= 7 * day;
	if (filter === "30d") return now - createdAt <= 30 * day;
	if (filter === "90d") return now - createdAt <= 90 * day;

	return true;
}

export function getBillingSearchPlaceholder(section: BillingSection) {
	switch (section) {
		case "PLANS":
			return "Tìm theo tên gói hoặc mã gói";
		case "SUBSCRIPTIONS":
			return "Tìm theo workspace, owner hoặc plan";
		default:
			return "Tìm kiếm";
	}
}

export function getNumberInputValue(value: number | undefined | null): string {
	if (value === undefined || value === null || isNaN(value)) return "";
	return value.toString();
}

export function parseNumberInput(value: string): number {
	if (value === "") return 0;
	return Number(value);
}

export function toSlug(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[đĐ]/g, "d")
		.replace(/[^a-z0-9 -]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}
