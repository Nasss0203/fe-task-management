import {
	Bell,
	Columns3,
	Lock,
	RotateCcw,
	Settings,
	Trash2,
	Users,
	Zap,
	LayoutTemplate,
} from "lucide-react";
import type React from "react";

export type SettingsSection = "details" | "access" | "features" | "board" | "template" | "danger";

export const SETTINGS_NAV: {
	key: SettingsSection;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ key: "details", label: "Details", icon: Settings },
	{ key: "access", label: "Access", icon: Users },
	{ key: "features", label: "Features", icon: Zap },
	{ key: "board", label: "Board", icon: Columns3 },
	{ key: "template", label: "Templates", icon: LayoutTemplate },
	{ key: "danger", label: "Danger zone", icon: Trash2 },
];

export const formatDeletedAt = (value?: string | null) => {
	if (!value) return "Unknown time";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "Unknown time";

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

export const formatPlanName = (value?: string | null) => {
	if (!value) return "FREE";

	return value.replace(/-/g, " ").toUpperCase();
};

// re-export icons used in sections to avoid repetition
export { Bell, Lock, RotateCcw };
