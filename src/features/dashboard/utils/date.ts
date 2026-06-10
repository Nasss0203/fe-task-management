export const toLocalDateInputValue = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export const getClientTimezone = () => {
	if (typeof Intl === "undefined") return undefined;

	return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatDashboardDate = (dateValue?: string) => {
	if (!dateValue) return "";

	const [year, month, day] = dateValue.split("-").map(Number);

	if (!year || !month || !day) return dateValue;

	return new Intl.DateTimeFormat("vi-VN", {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, month - 1, day)));
};

export const formatDateTime = (dateValue?: string | null) => {
	if (!dateValue) return "Chưa đặt hạn";

	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) return "Chưa đặt hạn";

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

export const formatRelativeTime = (dateValue: string) => {
	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) return "Vừa xong";

	const diffMinutes = Math.max(
		0,
		Math.floor((Date.now() - date.getTime()) / 60000),
	);

	if (diffMinutes < 1) return "Vừa xong";
	if (diffMinutes < 60) return `${diffMinutes} phút trước`;

	const diffHours = Math.floor(diffMinutes / 60);

	if (diffHours < 24) return `${diffHours} giờ trước`;

	const diffDays = Math.floor(diffHours / 24);

	return `${diffDays} ngày trước`;
};
