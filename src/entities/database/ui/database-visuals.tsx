import {
	AlignLeft,
	AtSign,
	CalendarDays,
	CircleChevronDown,
	CircleDot,
	Clock,
	Hash,
	History,
	Link2,
	ListChecks,
	Paperclip,
	Phone,
	SquareCheck,
	Type,
	UserPen,
	Users,
	type LucideIcon,
} from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const PROPERTY_ICONS: Record<string, LucideIcon> = {
	TITLE: Type,
	TEXT: AlignLeft,
	NUMBER: Hash,
	SELECT: CircleChevronDown,
	MULTI_SELECT: ListChecks,
	STATUS: CircleDot,
	DATE: CalendarDays,
	CHECKBOX: SquareCheck,
	PERSON: Users,
	URL: Link2,
	EMAIL: AtSign,
	PHONE: Phone,
	FILE: Paperclip,
	CREATED_TIME: Clock,
	UPDATED_TIME: History,
	CREATED_BY: UserPen,
};

export function PropertyIcon({
	type,
	className,
}: {
	type: string;
	className?: string;
}) {
	const Icon = PROPERTY_ICONS[type.toUpperCase()] ?? AlignLeft;

	return <Icon className={cn("size-4 shrink-0", className)} />;
}

/** Default column width per type; views without a stored width use this. */
export function getDefaultColumnWidth(type: string): number {
	switch (type.toUpperCase()) {
		case "TITLE":
			return 280;
		case "CHECKBOX":
			return 110;
		case "NUMBER":
			return 140;
		case "DATE":
			return 170;
		default:
			return 200;
	}
}

/** Option colors are snapshot data, using the same CSS color contract as Workspace. */
export function PropertyOptionBadge({
	name,
	color,
	className,
}: {
	name: string;
	color?: string | null;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex max-w-full items-center truncate rounded-[4px] bg-muted px-1.5 py-0.5 text-xs leading-4 font-medium text-foreground",
				className,
			)}
			// Tinted background + text in the option's hue (Notion-style), readable
			// in both themes because the text mixes toward the foreground color.
			style={
				color
					? {
							backgroundColor: `color-mix(in srgb, ${color} 30%, transparent)`,
							color: `color-mix(in srgb, ${color} 72%, var(--foreground))`,
						}
					: undefined
			}
		>
			{name}
		</span>
	);
}

export function DatabaseTableSurface({
	children,
	className,
	tableClassName,
	tableStyle,
}: {
	children: ReactNode;
	className?: string;
	tableClassName?: string;
	tableStyle?: CSSProperties;
}) {
	return (
		<div
			className={cn(
				"w-full min-w-0 max-w-full overflow-x-auto",
				className,
			)}
		>
			<table
				className={cn(
					"min-w-max table-fixed border-collapse text-sm",
					tableClassName,
				)}
				style={tableStyle}
			>
				{children}
			</table>
		</div>
	);
}
export function DatabaseHeaderCell({
	className,
	...props
}: ComponentProps<"th">) {
	return (
		<th
			{...props}
			className={cn(
				"h-9 min-w-[100px] border-y border-r border-border px-2 text-left text-[13px] font-normal text-muted-foreground last:border-r-0",
				className,
			)}
		/>
	);
}
export function DatabaseValueCell({
	className,
	...props
}: ComponentProps<"td">) {
	return (
		<td
			{...props}
			className={cn(
				"h-9 min-w-[100px] border-b border-r border-border px-1 align-middle last:border-r-0",
				className,
			)}
		/>
	);
}

/** Formats a DATE row value ({ start, end? }) for display, e.g. "Oct 18, 2026". */
export function formatDatabaseDate(value: unknown): string {
	if (!value || typeof value !== "object" || !("start" in value)) return "";
	const { start, end } = value as { start?: unknown; end?: unknown };
	const format = (raw: unknown) => {
		if (typeof raw !== "string" || !raw) return "";
		// Date-only strings are parsed as UTC; pin to local midnight to avoid off-by-one.
		const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00` : raw);
		return Number.isNaN(date.getTime())
			? raw
			: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				});
	};
	const startText = format(start);
	const endText = format(end);
	return endText ? `${startText} → ${endText}` : startText;
}

export function formatDatabaseValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string" || typeof value === "number")
		return String(value);
	if (typeof value === "boolean") return value ? "✓" : "";
	if (typeof value === "object" && "start" in value)
		return formatDatabaseDate(value);
	return JSON.stringify(value);
}
