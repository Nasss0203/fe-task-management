import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function SettingsHeader({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className='mb-8 flex items-start justify-between gap-4'>
			<div className='min-w-0'>
				<h2 className='text-2xl font-semibold tracking-tight'>{title}</h2>
				<p className='mt-1 text-sm text-muted-foreground'>{description}</p>
			</div>
			{action}
		</div>
	);
}

export function SettingsGroup({
	title,
	children,
	className,
}: {
	title?: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("mb-8", className)}>
			{title && (
				<h3 className='mb-1 border-b pb-2 text-sm font-medium'>{title}</h3>
			)}
			<div className='divide-y'>{children}</div>
		</section>
	);
}

export function SettingsRow({
	label,
	description,
	children,
}: {
	label: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
}) {
	return (
		<div className='flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8'>
			<div className='min-w-0'>
				<div className='text-sm font-medium'>{label}</div>
				{description && (
					<p className='mt-0.5 text-xs text-muted-foreground'>{description}</p>
				)}
			</div>
			{children && <div className='shrink-0 sm:max-w-[55%]'>{children}</div>}
		</div>
	);
}

export function DangerZone({ children }: { children: ReactNode }) {
	return (
		<section className='rounded-xl border border-destructive/30 bg-destructive/5 px-5'>
			<h3 className='pt-4 text-sm font-medium text-destructive'>Danger zone</h3>
			<div className='divide-y divide-destructive/15'>{children}</div>
		</section>
	);
}

export function formatSettingsDate(value: string | null | undefined) {
	if (!value) return "—";
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "—"
		: date.toLocaleDateString("en-GB", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});
}
