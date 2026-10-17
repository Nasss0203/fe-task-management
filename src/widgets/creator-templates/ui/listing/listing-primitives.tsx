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
			className='rounded-xl border bg-card'
		>
			<div className='flex items-start justify-between gap-3 border-b px-5 py-4'>
				<div className='flex flex-col gap-0.5'>
					<h2 id={`${id}-title`} className='text-sm font-semibold'>
						{title}
					</h2>
					{description && (
						<p className='text-xs text-muted-foreground'>{description}</p>
					)}
				</div>
				{aside}
			</div>
			<div className='flex flex-col gap-5 p-5'>{children}</div>
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
	icon,
	disabled,
}: {
	name: string;
	value: string;
	checked: boolean;
	onChange: (value: string) => void;
	title: string;
	description: string;
	icon: ReactNode;
	disabled?: boolean;
}) {
	return (
		<label
			className={cn(
				"flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
				checked
					? "border-primary bg-primary/5"
					: "hover:bg-muted/50",
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
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-md",
					checked ? "bg-primary text-primary-foreground" : "bg-muted",
				)}
			>
				{icon}
			</span>
			<span className='flex flex-col gap-0.5'>
				<span className='text-sm font-medium'>{title}</span>
				<span className='text-xs text-muted-foreground'>{description}</span>
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
