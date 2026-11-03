"use client";

import type {
	DatabasePerson,
	PropertyOption,
} from "@/entities/database/model/database.types";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import { PersonAvatar } from "./person-cell";

const MAX_CHIP_AVATARS = 2;

export interface CalendarRowMeta {
	status: { label: string; option: PropertyOption | null } | null;
	people: { label: string; list: DatabasePerson[] } | null;
	date: { label: string; text: string };
	fields: CalendarMetaField[];
}

export interface CalendarMetaField {
	id: string;
	label: string;
	text: string;
	options?: PropertyOption[];
}

export function StatusDot({
	option,
	className,
}: {
	option: PropertyOption | null;
	className?: string;
}) {
	return (
		<span
			aria-hidden
			className={cn("size-2 shrink-0 rounded-full bg-faint", className)}
			style={option?.color ? { backgroundColor: option.color } : undefined}
		/>
	);
}

function ChipAvatars({ people }: { people: DatabasePerson[] }) {
	const shown = people.slice(0, MAX_CHIP_AVATARS);
	const hiddenCount = people.length - shown.length;

	return (
		<span className='flex shrink-0 items-center -space-x-1.5 *:data-[slot=avatar]:ring-1 *:data-[slot=avatar]:ring-background'>
			{shown.map((person) => (
				<PersonAvatar
					key={person.user_id}
					person={person}
					className='size-4'
				/>
			))}
			{hiddenCount > 0 && (
				<span className='pl-2 text-[11px] text-muted-foreground'>
					+{hiddenCount}
				</span>
			)}
		</span>
	);
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<>
			<dt className='truncate text-muted-foreground'>{label}</dt>
			<dd className='min-w-0 break-words text-foreground'>{children}</dd>
		</>
	);
}

export function CalendarEventChip({
	title,
	meta,
	isMirror,
}: {
	title: string;
	meta: CalendarRowMeta | undefined;
	isMirror: boolean;
}) {
	const chip = (
		<div className='flex w-full min-w-0 items-center gap-1.5 px-1.5'>
			{meta?.status && <StatusDot option={meta.status.option} />}
			<span
				className={cn(
					"min-w-0 flex-1 truncate",
					title === "Untitled" && "text-muted-foreground",
				)}
			>
				{title}
			</span>
			{meta?.people && meta.people.list.length > 0 && (
				<ChipAvatars people={meta.people.list} />
			)}
		</div>
	);

	if (!meta || isMirror) return chip;

	return (
		<Tooltip delayDuration={300}>
			<TooltipTrigger asChild>{chip}</TooltipTrigger>
			<TooltipContent
				side='bottom'
				align='start'
				sideOffset={6}
				className='w-80 rounded-[10px] border bg-popover p-3 text-left text-popover-foreground shadow-md [&>span:has(svg)]:hidden'
			>
				<p className='truncate text-[13px] font-semibold'>{title}</p>
				<dl className='mt-2 grid grid-cols-[96px_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs'>
					{meta.status && (
						<MetaRow label={meta.status.label}>
							{meta.status.option ? (
								<span className='inline-flex items-center gap-1.5'>
									<StatusDot option={meta.status.option} className='size-[7px]' />
									{meta.status.option.name}
								</span>
							) : (
								<span className='text-faint'>Empty</span>
							)}
						</MetaRow>
					)}
					{meta.people && (
						<MetaRow label={meta.people.label}>
							{meta.people.list.length > 0 ? (
								meta.people.list.map((person) => person.full_name).join(", ")
							) : (
								<span className='text-faint'>Empty</span>
							)}
						</MetaRow>
					)}
					<MetaRow label={meta.date.label}>{meta.date.text}</MetaRow>
					{meta.fields.map((field) => (
						<MetaRow key={field.id} label={field.label}>
							{field.options ? (
								<span className='inline-flex flex-wrap items-center gap-x-2 gap-y-0.5'>
									{field.options.map((option) => (
										<span key={option.id} className='inline-flex items-center gap-1.5'>
											<StatusDot option={option} className='size-[7px]' />
											{option.name}
										</span>
									))}
								</span>
							) : (
								<span className='line-clamp-2'>{field.text}</span>
							)}
						</MetaRow>
					))}
				</dl>
			</TooltipContent>
		</Tooltip>
	);
}
