"use client";

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TaskDateSelectProps = {
	value?: DateRange;
	onChange: (date?: DateRange) => void;
};

export const TaskDateSelect = ({ value, onChange }: TaskDateSelectProps) => {
	const [open, setOpen] = useState(false);
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const label = value?.from
		? value.to
			? `${format(value.from, "MMM dd, yyyy")} - ${format(
					value.to,
					"MMM dd, yyyy",
				)}`
			: format(value.from, "MMM dd, yyyy")
		: "Trống";

	const handleClear = (event: React.MouseEvent) => {
		event.stopPropagation();
		onChange(undefined);
	};

	return (
		<div
			onPointerDown={(event) => event.stopPropagation()}
			onClick={(event) => event.stopPropagation()}
		>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						className={cn(
							"flex min-h-8 w-fit max-w-full items-center gap-2 rounded-md px-2 py-1 text-sm",
							"text-muted-foreground hover:bg-accent hover:text-foreground",
							value?.from && "text-foreground",
						)}
					>
						<CalendarIcon className='size-4 shrink-0' />

						<span className='truncate'>{label}</span>

						{value?.from && (
							<X
								className='size-3.5 shrink-0 text-muted-foreground hover:text-foreground'
								onClick={handleClear}
							/>
						)}
					</button>
				</PopoverTrigger>

				<PopoverContent
					align='start'
					sideOffset={8}
					className='z-[9999] w-auto rounded-xl border border-border bg-popover p-2 shadow-xl'
				>
					<Calendar
						mode='range'
						selected={value}
						disabled={{ before: today }}
						onSelect={onChange}
						defaultMonth={value?.from}
						numberOfMonths={1}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};
