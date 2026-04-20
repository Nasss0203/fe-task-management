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
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
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
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "DISABLED":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		case "DRAFT":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
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
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "TRIAL":
			return "border-sky-500/20 bg-sky-500/10 text-sky-400";
		case "EXPIRED":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		case "CANCELED":
			return "border-rose-500/20 bg-rose-500/10 text-rose-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
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
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
		case "INACTIVE":
			return "border-neutral-500/20 bg-neutral-500/10 text-neutral-300";
		case "EXPIRED":
			return "border-amber-500/20 bg-amber-500/10 text-amber-400";
		default:
			return "border-white/10 bg-white/5 text-neutral-300";
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
			return "text-emerald-400";
		case "FAILED":
			return "text-rose-400";
		case "REFUNDED":
			return "text-amber-400";
		case "PENDING":
			return "text-sky-400";
		default:
			return "text-neutral-300";
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
		case "COUPONS":
			return "Tìm theo mã coupon hoặc mô tả";
		default:
			return "Tìm kiếm";
	}
}
