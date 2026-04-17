"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../ui/calendar";

type DatePickerInputProps = {
	value?: string;
	onChange?: (value: string) => void;
};

function formatDate(date: Date | undefined) {
	if (!date) return "";

	return date.toLocaleDateString("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function isValidDate(date: Date | undefined) {
	if (!date) return false;
	return !isNaN(date.getTime());
}

function parseDateString(value?: string) {
	if (!value) return undefined;

	const [month, day, year] = value.split("/");
	if (!month || !day || !year) return undefined;

	const date = new Date(Number(year), Number(month) - 1, Number(day));
	return isValidDate(date) ? date : undefined;
}

export function DatePickerInput({ value, onChange }: DatePickerInputProps) {
	const initialDate = React.useMemo(() => parseDateString(value), [value]);

	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(initialDate);
	const [month, setMonth] = React.useState<Date | undefined>(initialDate);
	const [inputValue, setInputValue] = React.useState(formatDate(initialDate));

	React.useEffect(() => {
		const parsed = parseDateString(value);
		setDate(parsed);
		setMonth(parsed);
		setInputValue(formatDate(parsed));
	}, [value]);

	return (
		<InputGroup className='w-36'>
			<InputGroupInput
				value={inputValue}
				placeholder='MM/DD/YYYY'
				onChange={(e) => {
					const nextValue = e.target.value;
					setInputValue(nextValue);

					const nextDate = parseDateString(nextValue);
					if (isValidDate(nextDate)) {
						setDate(nextDate);
						setMonth(nextDate);
						onChange?.(formatDate(nextDate));
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setOpen(true);
					}
				}}
			/>

			<InputGroupAddon align='inline-end'>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<InputGroupButton
							variant='ghost'
							size='icon-xs'
							aria-label='Select date'
						>
							<CalendarIcon className='size-4' />
						</InputGroupButton>
					</PopoverTrigger>

					<PopoverContent
						className='w-auto overflow-hidden p-0'
						align='end'
						alignOffset={-8}
						sideOffset={10}
					>
						<Calendar
							mode='single'
							selected={date}
							month={month}
							onMonthChange={setMonth}
							onSelect={(selectedDate) => {
								setDate(selectedDate);
								setInputValue(formatDate(selectedDate));
								setOpen(false);

								if (selectedDate) {
									onChange?.(formatDate(selectedDate));
								}
							}}
						/>
					</PopoverContent>
				</Popover>
			</InputGroupAddon>
		</InputGroup>
	);
}
