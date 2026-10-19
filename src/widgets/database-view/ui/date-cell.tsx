"use client";

import { format, isValid, parseISO, startOfMonth } from "date-fns";
import { Switch } from "radix-ui";
import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";

import { formatDatabaseDate } from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

type DateValue = { start: string; end?: string | null };

interface DateCellProps {
	name: string;
	value: unknown;
	interactive: boolean;
	disabled?: boolean;
	onChange: (value: DateValue | null) => void;
}

const DATE_KEY = "yyyy-MM-dd";

function readDate(value: unknown): { start?: Date; end?: Date } {
	if (!value || typeof value !== "object" || !("start" in value)) return {};
	const { start, end } = value as { start?: unknown; end?: unknown };
	const parse = (raw: unknown) => {
		if (typeof raw !== "string") return undefined;
		const date = parseISO(raw.slice(0, 10));
		return isValid(date) ? date : undefined;
	};
	return { start: parse(start), end: parse(end) };
}

/** Tailwind styles for react-day-picker (no default stylesheet). */
const CALENDAR_CLASSES = {
	root: "relative w-full",
	months: "w-full",
	month: "w-full",
	month_caption: "flex h-8 items-center px-1",
	caption_label: "text-sm font-semibold",
	nav: "absolute right-0 top-0 flex h-8 items-center gap-0.5",
	button_previous:
		"flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40",
	button_next:
		"flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40",
	chevron: "size-4 fill-current",
	month_grid: "mt-1 w-full border-collapse",
	weekdays: "flex",
	weekday:
		"flex h-7 flex-1 items-center justify-center text-[11px] font-normal text-muted-foreground",
	week: "mt-0.5 flex",
	day: "flex flex-1 items-center justify-center p-0 text-sm",
	day_button:
		"flex size-8 items-center justify-center rounded-md outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
	today: "font-semibold text-primary",
	outside: "text-muted-foreground/50",
	selected:
		"[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
	range_start: "rounded-l-md bg-primary/15",
	range_middle:
		"bg-primary/15 [&>button]:!bg-transparent [&>button]:!text-foreground [&>button]:hover:!bg-muted",
	range_end: "rounded-r-md bg-primary/15",
	hidden: "invisible",
};

export function DateCell({
	name,
	value,
	interactive,
	disabled,
	onChange,
}: DateCellProps) {
	const text = formatDatabaseDate(value);
	const { start, end } = readDate(value);
	const [month, setMonth] = useState<Date>(() =>
		startOfMonth(start ?? new Date()),
	);
	const [rangeMode, setRangeMode] = useState(Boolean(end));

	if (!interactive) {
		return <span className='block truncate px-1'>{text}</span>;
	}

	const emit = (nextStart?: Date, nextEnd?: Date) => {
		if (!nextStart) return onChange(null);
		const startKey = format(nextStart, DATE_KEY);
		const endKey = nextEnd ? format(nextEnd, DATE_KEY) : null;
		onChange(
			endKey && endKey > startKey
				? { start: startKey, end: endKey }
				: { start: startKey },
		);
	};

	const dateBox = (date: Date | undefined, label: string) => (
		<div
			className={cn(
				"flex h-8 min-w-0 flex-1 items-center rounded-md border border-input bg-muted/30 px-2 text-sm",
				!date && "text-muted-foreground",
			)}
			aria-label={label}
		>
			<span className='truncate'>{date ? format(date, "MMM d, yyyy") : label}</span>
		</div>
	);

	return (
		<Popover
			onOpenChange={(open) => {
				if (!open) return;
				setMonth(startOfMonth(start ?? new Date()));
				setRangeMode(Boolean(end));
			}}
		>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label={name}
					disabled={disabled}
					className='group/date flex h-8 w-full items-center rounded-sm px-1 text-left outline-none hover:bg-muted/60 focus-visible:bg-muted/60'
				>
					{text ? (
						<span className='truncate'>{text}</span>
					) : (
						<span className='text-muted-foreground opacity-0 group-hover/date:opacity-100 group-focus-visible/date:opacity-100'>
							Pick a date
						</span>
					)}
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-[17.5rem] p-2'>
				<div className='flex gap-1.5'>
					{dateBox(start, rangeMode ? "Start date" : "Date")}
					{rangeMode && dateBox(end, "End date")}
				</div>

				<div className='relative mt-2'>
					<button
						type='button'
						onClick={() => setMonth(startOfMonth(new Date()))}
						className='absolute right-[3.75rem] top-0 z-10 h-8 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
					>
						Today
					</button>
					{rangeMode ? (
						<DayPicker
							mode='range'
							selected={{ from: start, to: end } satisfies DateRange}
							onSelect={(range) => emit(range?.from, range?.to)}
							month={month}
							onMonthChange={setMonth}
							weekStartsOn={1}
							showOutsideDays
							disabled={disabled}
							classNames={CALENDAR_CLASSES}
						/>
					) : (
						<DayPicker
							mode='single'
							selected={start}
							onSelect={(date) => emit(date)}
							month={month}
							onMonthChange={setMonth}
							weekStartsOn={1}
							showOutsideDays
							disabled={disabled}
							classNames={CALENDAR_CLASSES}
						/>
					)}
				</div>

				<div className='mt-2 border-t pt-1'>
					<label className='flex h-8 items-center justify-between rounded-md px-2 text-sm hover:bg-muted'>
						End date
						<Switch.Root
							checked={rangeMode}
							disabled={disabled || !start}
							onCheckedChange={(checked) => {
								setRangeMode(checked);
								// Turning the range off keeps only the start day.
								if (!checked) emit(start);
							}}
							className='relative h-5 w-9 shrink-0 rounded-full bg-muted-foreground/30 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 data-[state=checked]:bg-primary'
						>
							<Switch.Thumb className='block size-4 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[1.125rem]' />
						</Switch.Root>
					</label>

					{text && (
						<button
							type='button'
							disabled={disabled}
							onClick={() => {
								setRangeMode(false);
								onChange(null);
							}}
							className='flex h-8 w-full items-center rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
						>
							Clear
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
