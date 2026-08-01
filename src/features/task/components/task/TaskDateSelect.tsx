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

	const hasTimeFrom = value?.from && (value.from.getHours() !== 0 || value.from.getMinutes() !== 0);
	const hasTimeTo = value?.to && (value.to.getHours() !== 0 || value.to.getMinutes() !== 0);

	const formatStrFrom = hasTimeFrom ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";
	const formatStrTo = hasTimeTo ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy";

	const label = value?.from
		? value.to
			? `${format(value.from, formatStrFrom)} - ${format(
					value.to,
					formatStrTo,
				)}`
			: format(value.from, formatStrFrom)
		: "Trống";

	const handleClear = (event: React.MouseEvent) => {
		event.stopPropagation();
		onChange(undefined);
	};

	const handleSelect = (range?: DateRange) => {
		if (!range) {
			onChange(undefined);
			return;
		}
		const newRange = { ...range };
		if (newRange.from && value?.from) {
			newRange.from.setHours(value.from.getHours(), value.from.getMinutes());
		}
		if (newRange.to && value?.to) {
			newRange.to.setHours(value.to.getHours(), value.to.getMinutes());
		}
		onChange(newRange);
	};

	const handleTimeChange = (type: 'from' | 'to', timeString: string) => {
		if (!value) return;
		const [hours, minutes] = timeString.split(':').map(Number);
		const newRange = { ...value };
		if (type === 'from' && newRange.from) {
			const newFrom = new Date(newRange.from);
			newFrom.setHours(hours || 0, minutes || 0);
			newRange.from = newFrom;
		}
		if (type === 'to' && newRange.to) {
			const newTo = new Date(newRange.to);
			newTo.setHours(hours || 0, minutes || 0);
			newRange.to = newTo;
		}
		onChange(newRange);
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
						onSelect={handleSelect}
						defaultMonth={value?.from}
						numberOfMonths={1}
					/>
					{value?.from && (
						<div className="flex items-center gap-2 px-3 pb-2 pt-2 border-t mt-2">
							<div className="flex flex-col gap-1 flex-1">
								<label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Start Time</label>
								<input 
									type="time" 
									value={value.from ? format(value.from, "HH:mm") : ""}
									onChange={(e) => handleTimeChange('from', e.target.value)}
									className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								/>
							</div>
							{value?.to && (
								<div className="flex flex-col gap-1 flex-1">
									<label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">End Time</label>
									<input 
										type="time" 
										value={value.to ? format(value.to, "HH:mm") : ""}
										onChange={(e) => handleTimeChange('to', e.target.value)}
										className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									/>
								</div>
							)}
						</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
};
