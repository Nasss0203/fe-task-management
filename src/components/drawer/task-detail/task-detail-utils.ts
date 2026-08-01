import type { TaskItem } from "@/services/task/type";
import type { AttachmentItem } from "@/services/attachment/type";
import { format } from "date-fns";

export const normalizeText = (value?: string | null) =>
	(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[\s_-]+/g, "");

export const hexToRgba = (hex: string, alpha = 0.14) => {
	const cleanHex = hex.replace("#", "");

	if (cleanHex.length !== 6) {
		return `rgba(99, 102, 241, ${alpha})`;
	}

	const r = Number.parseInt(cleanHex.slice(0, 2), 16);
	const g = Number.parseInt(cleanHex.slice(2, 4), 16);
	const b = Number.parseInt(cleanHex.slice(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getPriorityBadgeClass = (priorityName?: string | null) => {
	switch (normalizeText(priorityName)) {
		case "high":
		case "cao":
		case "urgent":
		case "khancap":
			return "border-destructive/20 bg-destructive/10 text-destructive";
		case "medium":
		case "normal":
		case "trungbinh":
			return "border-amber-500/20 bg-amber-500/10 text-amber-700";
		case "low":
		case "thap":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
		default:
			return "border-border bg-muted text-muted-foreground";
	}
};

export const parseDate = (value?: string | null) => {
	if (!value) return undefined;

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? undefined : date;
};

export const formatDateLabel = (value?: string | Date | null) => {
	if (!value) return "No due date";

	const date = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(date.getTime())) return "No due date";

	const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;

	return format(date, hasTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
};

export const formatDateTime = (value?: string | null) => {
	if (!value) return "No activity yet";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "No activity yet";

	return format(date, "dd/MM/yyyy HH:mm");
};

export const formatCommentTime = (date: Date) =>
	format(date, "dd/MM HH:mm");

export const getAssigneeName = (assignee: TaskItem["assignees"][number]) =>
	assignee.fullName?.trim() || assignee.username?.trim() || "Team member";

export const getInitials = (name?: string) => {
	if (!name) return "?";

	return name
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
};

const slugify = (value?: string | null) => {
	const fallback = "task-file";

	if (!value) return fallback;

	const nextValue = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 24);

	return nextValue || fallback;
};

export const formatBytes = (bytes: number, decimals = 2) => {
	if (!+bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string) => {
	return filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1).toUpperCase();
};

export const getAttachmentPreviewUrl = (attachment: AttachmentItem) => {
	if (attachment.provider === "CLOUDINARY" && attachment.secureUrl) {
		return attachment.secureUrl;
	}
	return null;
};
