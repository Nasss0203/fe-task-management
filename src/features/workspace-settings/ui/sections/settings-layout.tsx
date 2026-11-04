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
		<div className='mb-6 flex items-start justify-between gap-4'>
			<div className='min-w-0'>
				<h2 className='text-xl font-semibold leading-[30px]'>{title}</h2>
				<p className='mt-1 text-[13.5px] leading-5 text-muted-foreground'>{description}</p>
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
		<section className={cn("mb-6", className)}>
			{title && (
				<h3 className='text-xs font-semibold leading-[18px] text-muted-foreground'>{title}</h3>
			)}
			<div className='[&>div]:border-b [&>form]:border-b'>{children}</div>
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
		<div className='flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6'>
			<div className='min-w-0'>
				<div className='text-[13.5px] font-medium leading-5'>{label}</div>
				{description && (
					<p className='mt-0.5 text-[12.5px] leading-[19px] text-muted-foreground'>{description}</p>
				)}
			</div>
			{children && <div className='min-w-0 shrink-0 sm:max-w-[55%]'>{children}</div>}
		</div>
	);
}

export function DangerZone({ children }: { children: ReactNode }) {
	return (
		<section className='rounded-xl border border-destructive/30 bg-destructive/5 px-5 pb-1.5'>
			<h3 className='pt-3.5 text-[13.5px] font-medium leading-5 text-destructive'>Danger zone</h3>
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
