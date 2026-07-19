"use client";

import { useState } from "react";

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

type StartSprintDialogProps = {
	defaultSprintName?: string;
	workspaceId: string;
	projectId: string;
	sprintId: string;
	workItemCount?: number;
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

const formatDateInput = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const addWeeksToDate = (date: string, weeks: number) => {
	if (!date) return "";

	const current = new Date(`${date}T00:00:00`);
	current.setDate(current.getDate() + weeks * 7);

	return formatDateInput(current);
};

const toISOStringDateTime = (date: string, time: string) => {
	return new Date(`${date}T${time}:00`).toISOString();
};

export function StartSprintDialog({
	defaultSprintName = "Sprint",
	workspaceId,
	projectId,
	sprintId,
	workItemCount = 0,
	trigger,
}: StartSprintDialogProps) {
	const { startSprint } = useSprints({
		workspaceId,
		projectId,
	});

	const today = formatDateInput(new Date());

	const [open, setOpen] = useState(false);
	const [name, setName] = useState(defaultSprintName);
	const [duration, setDuration] = useState("1");
	const [startDate, setStartDate] = useState(today);
	const [startTime, setStartTime] = useState("09:00");
	const [endDate, setEndDate] = useState(addWeeksToDate(today, 1));
	const [goal, setGoal] = useState("");

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

	const handleStart = () => {
		if (
			!name.trim() ||
			!startDate ||
			!startTime ||
			!endDate ||
			isInvalidDateRange
		) {
			return;
		}

		startSprint.mutate(
			{
				workspaceId,
				projectId,
				sprintId,
				data: {
					name: name.trim(),
					goal: goal.trim() || undefined,
					startAt: toISOStringDateTime(startDate, startTime),
					endAt: toISOStringDateTime(endDate, startTime),
				},
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
						className='h-8 rounded-lg border-border bg-background text-[12px] font-medium hover:hover:bg-accent hover:text-accent-foreground hover:border-neutral-600 transition-all hover:text-foreground'
					>
						Start sprint
					</Button>
				)}
			</DialogTrigger>

			<DialogContent
				className={cn(
					"2xl:max-w-140 xl:max-w-120 max-h-[90vh] overflow-y-auto border border-border bg-popover p-0 text-foreground shadow-2xl",
					"sm:max-w-140",
				)}
			>
				<div className='border-b border-border px-6 py-3'>
					<DialogHeader>
						<DialogTitle className='text-base font-semibold text-foreground'>
							Start sprint
						</DialogTitle>
					</DialogHeader>
				</div>

				<div className='px-6 py-2'>
					<div className='space-y-3'>
						<p className='text-sm text-foreground'>
							<span className='font-semibold text-foreground'>
								{workItemCount}
							</span>{" "}
							work item{workItemCount > 1 ? "s" : ""} will be
							included in this sprint.
						</p>

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
								onChange={(e) => setName(e.target.value)}
								className={cn(
									"h-9 rounded-md border-border bg-background text-sm text-foreground",
									"placeholder:text-muted-foreground",
									"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
								)}
							/>
						</div>

						<div className='space-y-1.5'>
							<Label className='text-xs font-semibold text-foreground'>
								Duration <span className='text-red-400'>*</span>
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
									Start date{" "}
									<span className='text-red-400'>*</span>
								</Label>

								<Input
									type='date'
									value={startDate}
									onChange={(e) =>
										handleStartDateChange(e.target.value)
									}
									className={cn(
										"h-9 rounded-md border-border bg-background text-sm text-foreground",
										"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
									)}
								/>
							</div>

							<div className='space-y-1.5'>
								<Label className='text-xs font-semibold text-foreground'>
									Start time{" "}
									<span className='text-red-400'>*</span>
								</Label>

								<Input
									type='time'
									value={startTime}
									onChange={(e) =>
										setStartTime(e.target.value)
									}
									className={cn(
										"h-9 rounded-md border-border bg-background text-sm text-foreground",
										"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
									)}
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div className='space-y-1.5'>
								<Label className='text-xs font-semibold text-foreground'>
									End date{" "}
									<span className='text-red-400'>*</span>
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
									End time{" "}
									<span className='text-red-400'>*</span>
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
									"min-h-20 resize-none rounded-md border-border bg-background text-sm text-foreground",
									"placeholder:text-muted-foreground",
									"focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500",
								)}
							/>
						</div>
					</div>

					<div className='mt-4 flex justify-end gap-2'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => setOpen(false)}
							className='h-8 rounded-md px-4 text-xs font-semibold text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground'
						>
							Hủy bỏ
						</Button>

						<Button
							type='button'
							onClick={handleStart}
							disabled={
								!name.trim() ||
								!startDate ||
								!startTime ||
								!endDate ||
								isInvalidDateRange ||
								startSprint.isPending
							}
							className='h-8 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50'
						>
							{startSprint.isPending
								? "Đang bắt đầu..."
								: "Bắt đầu"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
