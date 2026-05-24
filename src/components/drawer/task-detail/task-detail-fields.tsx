"use client";

import { cn } from "@/lib/utils";
import type { TaskStatusItem } from "@/services/task-status/type";
import {
	CalendarDays,
	Check,
	ChevronDown,
	Circle,
	Download,
	FileText,
	Paperclip,
	Plus,
	Tag,
	Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Textarea } from "../../ui/textarea";
import type { DateRange } from "react-day-picker";
import { DetailRow } from "./task-detail-row";
import type { LocalAttachment, MemberOption } from "./task-detail-types";
import {
	formatDateLabel,
	getInitials,
	getPriorityBadgeClass,
	normalizeText,
} from "./task-detail-utils";

type TaskStatusFieldProps = {
	currentStatusColor: string;
	currentStatusName: string;
	isUpdatingTask: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	statuses: TaskStatusItem[];
	selectedStatusId: string;
	onSelect: (statusId: string) => Promise<void> | void;
};

type TaskPriorityFieldProps = {
	currentPriorityColor: string;
	currentPriorityName: string;
	isUpdatingTask: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	priorities: TaskStatusItem[];
	selectedPriorityId: string | null;
	onSelect: (priorityId: string | null) => Promise<void> | void;
};

type TaskDueDateFieldProps = {
	dueDate?: Date;
	isUpdatingTask: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (selectedDate?: Date) => Promise<void> | void;
};

type TaskScheduleFieldProps = {
	startDate?: Date;
	dueDate?: Date;
	isUpdatingTask: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (selectedDate?: DateRange) => Promise<void> | void;
};

type TaskAssigneeFieldProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isUpdatingTask: boolean;
	selectedMembers: MemberOption[];
	members: MemberOption[];
	selectedAssigneeIds: string[];
	onToggleAssignee: (memberId: string) => Promise<void> | void;
};

type TaskTagsFieldProps = {
	contextTag: string;
	priorityName: string;
};

type TaskDescriptionFieldProps = {
	description?: string | null;
};

type TaskAttachmentsFieldProps = {
	attachments: LocalAttachment[];
};

function getTodayBoundary() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
}

function formatScheduleLabel(startDate?: Date, dueDate?: Date) {
	if (
		startDate &&
		dueDate &&
		startDate.toDateString() === dueDate.toDateString()
	) {
		return formatDateLabel(startDate);
	}

	if (startDate && dueDate) {
		return `${formatDateLabel(startDate)} -> ${formatDateLabel(dueDate)}`;
	}

	if (startDate) {
		return formatDateLabel(startDate);
	}

	return "Set schedule";
}

function AttachmentCard({ attachment }: { attachment: LocalAttachment }) {
	return (
		<div className='flex h-16 min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-3 shadow-xs transition-colors hover:bg-accent/40'>
			<div className='flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground'>
				<FileText className='size-4' />
			</div>

			<div className='min-w-0 flex-1'>
				<div className='truncate text-sm font-medium text-foreground'>
					{attachment.name}
				</div>

				<div className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
					<span className='uppercase'>{attachment.kind}</span>
					<span>•</span>
					<span>{attachment.size}</span>
				</div>
			</div>
		</div>
	);
}

export function TaskStatusField({
	currentStatusColor,
	currentStatusName,
	isUpdatingTask,
	open,
	onOpenChange,
	statuses,
	selectedStatusId,
	onSelect,
}: TaskStatusFieldProps) {
	return (
		<DetailRow icon={Circle} label='Status'>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<button
						type='button'
						disabled={isUpdatingTask}
						className='inline-flex items-center gap-2 rounded-full border border-transparent px-0 py-1 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-foreground/80 disabled:opacity-60 cursor-pointer'
					>
						<Circle
							className='size-3.5'
							style={{
								color: currentStatusColor,
							}}
							strokeWidth={2.6}
						/>
						<span>{currentStatusName}</span>
						<ChevronDown className='size-4 text-muted-foreground' />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align='start'
					sideOffset={12}
					className='w-64 rounded-2xl border border-border bg-popover p-2 shadow-md'
				>
					<div className='px-2 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
						Status
					</div>
					<div className='space-y-1'>
						{statuses.map((status) => {
							const active =
								status.id === selectedStatusId ||
								normalizeText(status.name) ===
									normalizeText(currentStatusName);

							return (
								<button
									key={status.id}
									type='button'
									onClick={() => {
										void onSelect(status.id);
									}}
									className={cn(
										"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
										active &&
											"bg-accent text-accent-foreground",
									)}
								>
									<Circle
										className='size-3.5 shrink-0'
										style={{
											color: status.color,
										}}
										strokeWidth={2.6}
									/>
									<div className='flex-1 font-medium text-foreground'>
										{status.name}
									</div>
									{active ? (
										<Check className='size-4 text-primary' />
									) : null}
								</button>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>
		</DetailRow>
	);
}

export function TaskPriorityField({
	currentPriorityColor,
	currentPriorityName,
	isUpdatingTask,
	open,
	onOpenChange,
	priorities,
	selectedPriorityId,
	onSelect,
}: TaskPriorityFieldProps) {
	const noPriorityLabel = "No priority";
	const noPriorityActive =
		!selectedPriorityId &&
		normalizeText(currentPriorityName) === normalizeText(noPriorityLabel);

	return (
		<DetailRow icon={Tag} label='Priority'>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<button
						type='button'
						disabled={isUpdatingTask}
						className='inline-flex items-center gap-2 rounded-full border border-transparent px-0 py-1 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-foreground/80 disabled:opacity-60 cursor-pointer'
					>
						<Circle
							className='size-3.5'
							style={{
								color: currentPriorityColor,
							}}
							strokeWidth={2.6}
						/>
						<span>{currentPriorityName}</span>
						<ChevronDown className='size-4 text-muted-foreground' />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align='start'
					sideOffset={12}
					className='w-64 rounded-2xl border border-border bg-popover p-2 shadow-md'
				>
					<div className='px-2 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
						Priority
					</div>
					<div className='space-y-1'>
						<button
							type='button'
							onClick={() => {
								void onSelect(null);
							}}
							className={cn(
								"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
								noPriorityActive &&
									"bg-accent text-accent-foreground",
							)}
						>
							<Circle
								className='size-3.5 shrink-0 text-muted-foreground'
								strokeWidth={2.6}
							/>
							<div className='flex-1 font-medium text-foreground'>
								{noPriorityLabel}
							</div>
							{noPriorityActive ? (
								<Check className='size-4 text-primary' />
							) : null}
						</button>

						{priorities.map((priority) => {
							const active =
								priority.id === selectedPriorityId ||
								normalizeText(priority.name) ===
									normalizeText(currentPriorityName);

							return (
								<button
									key={priority.id}
									type='button'
									onClick={() => {
										void onSelect(priority.id);
									}}
									className={cn(
										"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
										active &&
											"bg-accent text-accent-foreground",
									)}
								>
									<Circle
										className='size-3.5 shrink-0'
										style={{
											color: priority.color,
										}}
										strokeWidth={2.6}
									/>
									<div className='flex-1 font-medium text-foreground'>
										{priority.name}
									</div>
									{active ? (
										<Check className='size-4 text-primary' />
									) : null}
								</button>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>
		</DetailRow>
	);
}

export function TaskScheduleField({
	startDate,
	dueDate,
	isUpdatingTask,
	open,
	onOpenChange,
	onSelect,
}: TaskScheduleFieldProps) {
	const today = getTodayBoundary();

	return (
		<DetailRow icon={CalendarDays} label='Schedule'>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<button
						type='button'
						className='inline-flex items-center gap-2 rounded-full px-0 py-1 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-foreground/80 disabled:opacity-60 cursor-pointer'
						disabled={isUpdatingTask}
					>
						<span
							className={cn(
								!startDate && !dueDate && "text-muted-foreground",
							)}
						>
							{formatScheduleLabel(startDate, dueDate)}
						</span>
						<ChevronDown className='size-4 text-muted-foreground' />
					</button>
				</PopoverTrigger>

				<PopoverContent
					align='start'
					sideOffset={12}
					className='w-auto rounded-2xl border border-border bg-popover p-0 shadow-md'
				>
					<Calendar
						mode='range'
						selected={{
							from: startDate,
							to: dueDate,
						}}
						defaultMonth={startDate ?? dueDate}
						disabled={{ before: today }}
						onSelect={(selectedRange) => {
							void onSelect(selectedRange);
						}}
						className='bg-popover p-4'
					/>
				</PopoverContent>
			</Popover>
		</DetailRow>
	);
}

export function TaskDueDateField({
	dueDate,
	isUpdatingTask,
	open,
	onOpenChange,
	onSelect,
}: TaskDueDateFieldProps) {
	const today = getTodayBoundary();

	return (
		<DetailRow icon={CalendarDays} label='Due date'>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<button
						type='button'
						className='inline-flex items-center gap-2 rounded-full px-0 py-1 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-foreground/80 disabled:opacity-60 cursor-pointer'
						disabled={isUpdatingTask}
					>
						<span
							className={cn(!dueDate && "text-muted-foreground")}
						>
							{formatDateLabel(dueDate)}
						</span>
						<ChevronDown className='size-4 text-muted-foreground' />
					</button>
				</PopoverTrigger>

				<PopoverContent
					align='start'
					sideOffset={12}
					className='w-auto rounded-2xl border border-border bg-popover p-0 shadow-md'
				>
					<Calendar
						mode='single'
						selected={dueDate}
						defaultMonth={dueDate}
						disabled={{ before: today }}
						onSelect={(selectedDate) => {
							void onSelect(selectedDate);
						}}
						className='bg-popover p-4'
					/>
				</PopoverContent>
			</Popover>
		</DetailRow>
	);
}

export function TaskAssigneeField({
	open,
	onOpenChange,
	isUpdatingTask,
	selectedMembers,
	members,
	selectedAssigneeIds,
	onToggleAssignee,
}: TaskAssigneeFieldProps) {
	return (
		<DetailRow icon={Users} label='Assignee'>
			<div className='flex flex-wrap items-center gap-3'>
				<Popover open={open} onOpenChange={onOpenChange}>
					<PopoverTrigger asChild>
						<button
							type='button'
							disabled={isUpdatingTask}
							className='flex min-h-10 flex-wrap items-center gap-2 rounded-2xl px-0 py-0 text-left disabled:opacity-60'
						>
							{selectedMembers.length ? (
								selectedMembers.map((member) => (
									<div
										key={member.id}
										className='inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1.5 text-sm text-foreground'
									>
										<Avatar className='size-7 border border-border'>
											<AvatarImage
												src={
													member.avatarUrl ??
													undefined
												}
												alt={member.name}
											/>
											<AvatarFallback className='bg-muted text-[11px] font-semibold text-foreground'>
												{getInitials(member.name)}
											</AvatarFallback>
										</Avatar>
										<span className='max-w-32 truncate font-medium'>
											{member.name}
										</span>
									</div>
								))
							) : (
								<div className='rounded-full bg-muted px-3 py-2 text-sm text-muted-foreground flex items-center gap-2 cursor-pointer'>
									No assignee
								</div>
							)}
							<ChevronDown className='size-4 text-muted-foreground cursor-pointer' />
						</button>
					</PopoverTrigger>

					<PopoverContent
						align='start'
						sideOffset={12}
						className='w-[340px] rounded-2xl border border-border bg-popover p-0 shadow-md'
					>
						<div className='border-b border-border px-4 py-3'>
							<div className='flex flex-wrap gap-2'>
								{selectedMembers.length ? (
									selectedMembers.map((member) => (
										<div
											key={member.id}
											className='inline-flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-sm text-foreground'
										>
											<Avatar className='size-6 border border-border'>
												<AvatarImage
													src={
														member.avatarUrl ??
														undefined
													}
													alt={member.name}
												/>
												<AvatarFallback className='bg-muted text-[10px] font-semibold text-foreground'>
													{getInitials(member.name)}
												</AvatarFallback>
											</Avatar>
											<span className='max-w-28 truncate'>
												{member.name}
											</span>
										</div>
									))
								) : (
									<span className='text-sm text-muted-foreground'>
										No one assigned yet
									</span>
								)}
							</div>
						</div>

						<Command className='bg-transparent'>
							<CommandInput placeholder='Search member...' />
							<CommandList className='max-h-64 p-1'>
								<CommandEmpty>
									No member found in this workspace.
								</CommandEmpty>
								<CommandGroup heading='Members'>
									{members.map((member) => {
										const checked =
											selectedAssigneeIds.includes(
												member.id,
											);

										return (
											<CommandItem
												key={member.id}
												value={`${member.name} ${member.email ?? ""}`}
												onSelect={() => {
													void onToggleAssignee(
														member.id,
													);
												}}
												className='cursor-pointer rounded-xl px-3 py-2.5 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground'
											>
												<Avatar className='size-8 border border-border'>
													<AvatarImage
														src={
															member.avatarUrl ??
															undefined
														}
														alt={member.name}
													/>
													<AvatarFallback className='bg-muted text-[10px] font-semibold text-foreground'>
														{getInitials(
															member.name,
														)}
													</AvatarFallback>
												</Avatar>
												<div className='min-w-0 flex-1'>
													<div className='truncate text-sm font-medium text-foreground'>
														{member.name}
														{member.isMe ? (
															<span className='ml-1 text-muted-foreground'>
																(you)
															</span>
														) : null}
													</div>
													{member.email ? (
														<div className='truncate text-xs text-muted-foreground'>
															{member.email}
														</div>
													) : null}
												</div>
												{checked ? (
													<Check className='size-4 text-primary' />
												) : null}
											</CommandItem>
										);
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</DetailRow>
	);
}

export function TaskTagsField({
	contextTag,
	priorityName,
}: TaskTagsFieldProps) {
	return (
		<DetailRow icon={Tag} label='Tags'>
			<div className='flex flex-wrap gap-2'>
				<Badge className='rounded-md border border-border bg-accent px-3 py-1 text-sm font-medium text-accent-foreground shadow-none'>
					{contextTag}
				</Badge>
				<Badge
					className={cn(
						"rounded-md border px-3 py-1 text-sm font-medium shadow-none",
						getPriorityBadgeClass(priorityName),
					)}
				>
					{priorityName}
				</Badge>
			</div>
		</DetailRow>
	);
}

export function TaskDescriptionField({
	description,
}: TaskDescriptionFieldProps) {
	return (
		<DetailRow icon={FileText} label='Description'>
			<Textarea
				readOnly
				value={
					description ??
					"This drawer now follows the KPI-style detail layout. Connect real task description editing when the backend update flow is ready."
				}
				className='min-h-22 resize-none rounded-2xl border-border bg-card px-4 py-3 text-sm leading-7 text-foreground shadow-none focus-visible:ring-0'
			/>
		</DetailRow>
	);
}

export function TaskAttachmentsField({
	attachments,
}: TaskAttachmentsFieldProps) {
	return (
		<DetailRow
			icon={Paperclip}
			label={`Attachment (${attachments.length})`}
		>
			<div className='space-y-2.5'>
				<div className='flex items-center justify-end gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='h-8 rounded-lg px-3 text-xs'
					>
						<Download className='size-3.5' />
						Download All
					</Button>

					<Button
						type='button'
						size='sm'
						className='h-8 rounded-lg px-3 text-xs'
					>
						<Plus className='size-3.5' />
						Add File
					</Button>
				</div>

				<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
					{attachments.map((attachment) => (
						<AttachmentCard
							key={attachment.id}
							attachment={attachment}
						/>
					))}

					<button
						type='button'
						className='flex h-16 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
					>
						<Plus className='size-4' />
						<span>Add attachment</span>
					</button>
				</div>
			</div>
		</DetailRow>
	);
}
