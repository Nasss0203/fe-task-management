import type { TaskItem } from "@/services/task/type";
import type { LocalAttachment } from "./task-detail-types";

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
			return "border-destructive/20 bg-destructive/10 text-destructive";
		case "medium":
		case "trungbinh":
			return "border-border bg-accent text-accent-foreground";
		case "low":
		case "thap":
			return "border-border bg-secondary text-secondary-foreground";
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

	return new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
};

export const formatDateTime = (value?: string | null) => {
	if (!value) return "No activity yet";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "No activity yet";

	return new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

export const formatCommentTime = (date: Date) =>
	new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);

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

export const buildAttachmentFallback = (task: TaskItem): LocalAttachment[] => {
	const fileBase = slugify(task.title);

	return [
		{
			id: `${task.id}-attachment-brief`,
			name: `${fileBase}-brief.pdf`,
			size: "1.5 MB",
			kind: "PDF",
		},
		{
			id: `${task.id}-attachment-notes`,
			name: `${fileBase}-notes.txt`,
			size: "28 KB",
			kind: "TXT",
		},
		{
			id: `${task.id}-attachment-notes`,
			name: `${fileBase}-notes.txt`,
			size: "28 KB",
			kind: "TXT",
		},
	];
};
