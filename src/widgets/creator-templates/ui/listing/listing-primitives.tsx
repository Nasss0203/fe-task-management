import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export function ListingSection({
	id,
	title,
	description,
	children,
	aside,
}: {
	id: string;
	title: string;
	description?: ReactNode;
	children: ReactNode;
	aside?: ReactNode;
}) {
	return (
		<section
			aria-labelledby={`${id}-title`}
			className='flex flex-col gap-3.5 rounded-[12px] border bg-card p-5'
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex flex-col gap-0.5'>
					<h2 id={`${id}-title`} className='text-[15px] font-semibold'>
						{title}
					</h2>
					{description && (
						<p className='text-[13px] text-muted-foreground'>{description}</p>
					)}
				</div>
				{aside}
			</div>
			<div className='flex flex-col gap-4'>{children}</div>
		</section>
	);
}

/** Radio rendered as a selectable card; keeps native radio semantics. */
export function OptionCard({
	name,
	value,
	checked,
	onChange,
	title,
	description,
	disabled,
}: {
	name: string;
	value: string;
	checked: boolean;
	onChange: (value: string) => void;
	title: string;
	description: string;
	icon?: ReactNode;
	disabled?: boolean;
}) {
	return (
		<label
			className={cn(
				"flex cursor-pointer items-start gap-2.5 rounded-[10px] border p-3.5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
				checked
					? "border-[1.5px] border-[#5e6ad2] bg-[#eeeffc]/60 dark:border-indigo-400 dark:bg-indigo-500/10"
					: "hover:bg-muted/40",
				disabled && "cursor-not-allowed opacity-60",
			)}
		>
			<input
				type='radio'
				name={name}
				value={value}
				checked={checked}
				disabled={disabled}
				onChange={() => onChange(value)}
				className='sr-only'
			/>
			<span
				aria-hidden
				className={cn(
					"mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-background transition-colors",
					checked
						? "border-[5px] border-[#5e6ad2] dark:border-indigo-400"
						: "border-[1.5px] border-muted-foreground/40",
				)}
			/>
			<span className='flex flex-col gap-0.5'>
				<span className='text-[13.5px] font-semibold'>{title}</span>
				<span className='text-[12.5px] text-muted-foreground'>{description}</span>
			</span>
		</label>
	);
}

export function FieldMessage({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<p role='alert' className='text-xs text-destructive'>
			{message}
		</p>
	);
}
