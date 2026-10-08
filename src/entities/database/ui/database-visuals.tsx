import { CalendarDays, CheckSquare, Hash, Text } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export function PropertyIcon({ type }: { type: string }) {
	switch (type.toUpperCase()) {
		case "NUMBER":
			return <Hash className='size-4' />;
		case "DATE":
			return <CalendarDays className='size-4' />;
		case "CHECKBOX":
			return <CheckSquare className='size-4' />;
		default:
			return <Text className='size-4' />;
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
				"inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground",
				className,
			)}
			style={{
				backgroundColor: color
					? `color-mix(in srgb, ${color} 18%, transparent)`
					: undefined,
			}}
		>
			{name}
		</span>
	);
}

export function DatabaseTableSurface({
	children,
	className,
	tableClassName,
}: {
	children: ReactNode;
	className?: string;
	tableClassName?: string;
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
					"min-w-max border-collapse text-sm",
					tableClassName,
				)}
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
				"min-w-[160px] border-r px-3 py-2 text-left font-medium",
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
				"h-10 min-w-[160px] border-r px-2 py-1 align-middle",
				className,
			)}
		/>
	);
}

export function formatDatabaseValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string" || typeof value === "number")
		return String(value);
	if (typeof value === "boolean") return value ? "✓" : "";
	return JSON.stringify(value);
}
