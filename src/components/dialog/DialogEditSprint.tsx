"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { cn } from "@/lib/utils";

type EditSprintDialogProps = {
	defaultSprintName?: string;
	defaultGoal?: string;
	defaultStartAt?: Date | null;
	defaultEndAt?: Date | null;
	isSprintActive?: boolean;
	workspaceId: string;
	projectId: string;
	sprintId: string;
	trigger?: React.ReactNode;
};

const CUSTOM_DURATION = "custom";

const durationOptions = [
	{ label: "1 week", value: "1" },
	{ label: "2 weeks", value: "2" },
	{ label: "3 weeks", value: "3" },
	{ label: "4 weeks", value: "4" },
	{ label: "Custom", value: CUSTOM_DURATION },
];

const formatDateInput = (date: Date | null | undefined) => {
	if (!date) return "";
	const d = new Date(date);
	if (isNaN(d.getTime())) return "";
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const formatTimeInput = (date: Date | null | undefined) => {
	if (!date) return "09:00";
	const d = new Date(date);
	if (isNaN(d.getTime())) return "09:00";
	const hours = String(d.getHours()).padStart(2, "0");
	const mins = String(d.getMinutes()).padStart(2, "0");
	return `${hours}:${mins}`;
}

const addWeeksToDate = (date: string, weeks: number) => {
	if (!date) return "";

	const current = new Date(`${date}T00:00:00`);
	current.setDate(current.getDate() + weeks * 7);

	return formatDateInput(current);
};

const toISOStringDateTime = (date: string, time: string) => {
	return new Date(`${date}T${time}:00`).toISOString();
};

export function EditSprintDialog({
	defaultSprintName = "Sprint",
	defaultGoal = "",
	defaultStartAt,
	defaultEndAt,
	isSprintActive = false,
	workspaceId,
	projectId,
	sprintId,
	trigger,
}: EditSprintDialogProps) {
	const { updateSprint } = useSprints({
		workspaceId,
		projectId,
	});

	const [open, setOpen] = useState(false);
	const [name, setName] = useState(defaultSprintName);
	const [duration, setDuration] = useState("1");
	const [startDate, setStartDate] = useState(formatDateInput(defaultStartAt));
	const [startTime, setStartTime] = useState(formatTimeInput(defaultStartAt));
	const [endDate, setEndDate] = useState(formatDateInput(defaultEndAt));
	const [goal, setGoal] = useState(defaultGoal);

	useEffect(() => {
		if (open) {
			setName(defaultSprintName);
			setGoal(defaultGoal || "");
			setStartDate(formatDateInput(defaultStartAt));
			setStartTime(formatTimeInput(defaultStartAt));
			setEndDate(formatDateInput(defaultEndAt));
			setDuration(CUSTOM_DURATION);
		}
	}, [open, defaultSprintName, defaultGoal, defaultStartAt, defaultEndAt]);

	const isCustomDuration = duration === CUSTOM_DURATION;

	const isInvalidDateRange =
		!!startDate &&
		!!endDate &&
		!!startTime &&
		new Date(`${startDate}T${startTime}:00`) >=
			new Date(`${endDate}T${startTime}:00`);

	const handleDurationChange = (value: string) => {
		setDuration(value);

		if (value !== CUSTOM_DURATION) {
			setEndDate(addWeeksToDate(startDate, Number(value)));
		}
	};

	const handleStartDateChange = (value: string) => {
		setStartDate(value);

		if (duration !== CUSTOM_DURATION) {
			setEndDate(addWeeksToDate(value, Number(duration)));
		}
	};

	const handleUpdate = () => {
		if (
			(!isSprintActive && !name.trim()) ||
			(startDate && endDate && isInvalidDateRange)
		) {
			return;
		}

		const data: any = {
			goal: goal.trim() || undefined,
			endAt: endDate ? toISOStringDateTime(endDate, startTime) : null,
		};

		if (!isSprintActive) {
			data.name = name.trim();
			data.startAt = startDate ? toISOStringDateTime(startDate, startTime) : null;
		}

		updateSprint.mutate(
			{
				workspaceId,
				projectId,
				sprintId,
				data,
			},
			{
				onSuccess: () => {
					setOpen(false);
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ? (
					trigger
				) : (
					<Button
						type='button'
						variant='outline'
						size='sm'
						className="h-8 rounded-lg border-border bg-background text-[12px] font-medium hover:hover:bg-accent hover:text-accent-foreground hover:border-neutral-600 transition-all hover:text-foreground"
					>
						Edit sprint
					</Button>
				)}
			</DialogTrigger>

			<DialogContent
				className={cn(
					"max-w-140 border border-border bg-popover p-0 text-foreground shadow-2xl",
					"sm:max-w-140",
				)}
			>
				<div className='border-b border-border px-6 py-4'>
					<DialogHeader>
						<DialogTitle className='text-base font-semibold text-foreground'>
							Edit sprint
						</DialogTitle>
					</DialogHeader>
				</div>

				<div className='px-6 py-5'>
					<div className='space-y-4'>
						<p className='text-xs font-medium text-muted-foreground'>
							Required fields are marked with an asterisk{" "}
							<span className='text-red-400'>*</span>
						</p>

						<div className='space-y-1.5'>
							<Label className='text-xs font-semibold text-foreground'>
								Sprint name{" "}
								<span className='text-red-400'>*</span>
							</Label>

							<Input
								value={name}
								disabled={isSprintActive}
								onChange={(e) => setName(e.target.value)}
								className={cn(
									"h-9 rounded-md border-border bg-background text-sm text-foreground",
									"placeholder:text-muted-foreground",
									"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
									isSprintActive && "opacity-50 cursor-not-allowed"
								)}
							/>
						</div>

						<div className='space-y-1.5'>
							<Label className='text-xs font-semibold text-foreground'>
								Duration
							</Label>

							<Select
								value={duration}
								onValueChange={handleDurationChange}
							>
								<SelectTrigger
									className={cn(
										"h-9 rounded-md border-border bg-background text-sm text-foreground",
										"focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
									)}
								>
									<SelectValue placeholder='Select duration' />
								</SelectTrigger>

								<SelectContent className='border-border bg-popover text-foreground'>
									{durationOptions.map((item) => (
										<SelectItem
											key={item.value}
											value={item.value}
											className='focus:focus:bg-accent focus:text-accent-foreground'
										>
											{item.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div className='space-y-1.5'>
								<Label className='text-xs font-semibold text-foreground'>
									Start date
								</Label>

								<Input
									type='date'
									value={startDate}
									disabled={isSprintActive}
									onChange={(e) =>
										handleStartDateChange(e.target.value)
									}
									className={cn(
										"h-9 rounded-md border-border bg-background text-sm text-foreground",
										"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
										isSprintActive && "opacity-50 cursor-not-allowed"
									)}
								/>
							</div>

							<div className='space-y-1.5'>
								<Label className='text-xs font-semibold text-foreground'>
									Start time
								</Label>

								<Input
									type='time'
									value={startTime}
									disabled={isSprintActive}
									onChange={(e) =>
										setStartTime(e.target.value)
									}
									className={cn(
										"h-9 rounded-md border-border bg-background text-sm text-foreground",
										"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
										isSprintActive && "opacity-50 cursor-not-allowed"
									)}
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div className='space-y-1.5'>
								<Label className='text-xs font-semibold text-foreground'>
									End date
								</Label>

								<Input
									type='date'
									value={endDate}
									min={startDate}
									disabled={!isCustomDuration}
									onChange={(e) => setEndDate(e.target.value)}
									className={cn(
										"h-9 rounded-md text-sm",
										isCustomDuration
											? "border-border bg-background text-foreground focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500"
											: "border-border bg-background text-muted-foreground disabled:cursor-not-allowed disabled:opacity-100",
									)}
								/>

								{isInvalidDateRange && (
									<p className='text-xs text-red-400'>
										End date must be after start date.
									</p>
								)}
							</div>

							<div className='space-y-1.5'>
								<Label className='text-xs font-semibold text-foreground'>
									End time
								</Label>

								<Input
									type='time'
									value={startTime}
									disabled
									className={cn(
										"h-9 rounded-md border-border bg-background text-sm text-muted-foreground",
										"disabled:cursor-not-allowed disabled:opacity-100",
									)}
								/>
							</div>
						</div>

						<div className='space-y-1.5'>
							<Label className='text-xs font-semibold text-foreground'>
								Sprint goal
							</Label>

							<Textarea
								value={goal}
								onChange={(e) => setGoal(e.target.value)}
								placeholder='What should this sprint accomplish?'
								className={cn(
									"min-h-27.5 resize-none rounded-md border-border bg-background text-sm text-foreground",
									"placeholder:text-muted-foreground",
									"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
								)}
							/>
						</div>
					</div>

					<div className='mt-6 flex justify-end gap-2 border-t border-border pt-4'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => setOpen(false)}
							className='h-8 rounded-md px-4 text-xs font-semibold text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground'
						>
							Cancel
						</Button>

						<Button
							type='button'
							onClick={handleUpdate}
							disabled={
								!name.trim() ||
								isInvalidDateRange ||
								updateSprint.isPending
							}
							className='h-8 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50'
						>
							{updateSprint.isPending ? "Updating..." : "Update sprint"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
