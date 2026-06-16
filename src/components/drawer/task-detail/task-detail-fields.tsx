"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getTaskStatusStyle } from "@/lib/task-status-style";
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
	Loader2,
	Trash2,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Badge } from "../../ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Textarea } from "../../ui/textarea";
import { DetailRow } from "./task-detail-row";
import {
	formatDateLabel,
	getPriorityBadgeClass,
	normalizeText,
	formatBytes,
	getFileExtension,
	getAttachmentPreviewUrl,
} from "./task-detail-utils";
import type { AttachmentItem } from "@/services/attachment/type";
import { useTaskAttachments } from "@/features/task/hooks/useTaskAttachments";

type TaskStatusFieldProps = {
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

type TaskTagsFieldProps = {
	contextTag: string;
	priorityName: string;
};

type TaskDescriptionFieldProps = {
	description?: string | null;
};

type TaskAttachmentsFieldProps = {
	attachmentsHook: ReturnType<typeof useTaskAttachments>;
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

function AttachmentCard({
	attachment,
	onDownload,
	onDelete,
}: {
	attachment: AttachmentItem;
	onDownload: (id: string, name: string) => void;
	onDelete: (id: string) => void;
}) {
	const previewUrl = getAttachmentPreviewUrl(attachment);
	const extension = getFileExtension(attachment.fileName);

	return (
		<div className='group relative flex h-16 min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-3 shadow-xs transition-colors hover:bg-accent/40'>
			<div className='flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground'>
				{previewUrl ? (
					<img src={previewUrl} alt={attachment.fileName} className='size-full object-cover' />
				) : (
					<FileText className='size-4' />
				)}
			</div>

			<div className='min-w-0 flex-1 pr-14'>
				<div className='truncate text-sm font-medium text-foreground' title={attachment.fileName}>
					{attachment.fileName}
				</div>

				<div className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
					<span className='uppercase'>{extension || "FILE"}</span>
					<span>•</span>
					<span>{formatBytes(attachment.size)}</span>
				</div>
			</div>

			<div className='absolute right-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
				<Button
					type='button'
					variant='ghost'
					size='icon-xs'
					onClick={() => onDownload(attachment.id, attachment.fileName)}
					className='text-muted-foreground hover:bg-background hover:text-foreground'
				>
					<Download className='size-3.5' />
				</Button>
				<Button
					type='button'
					variant='ghost'
					size='icon-xs'
					onClick={() => onDelete(attachment.id)}
					className='text-destructive hover:bg-destructive/10 hover:text-destructive'
				>
					<Trash2 className='size-3.5' />
				</Button>
			</div>
		</div>
	);
}

export function TaskStatusField({
	currentStatusName,
	isUpdatingTask,
	open,
	onOpenChange,
	statuses,
	selectedStatusId,
	onSelect,
}: TaskStatusFieldProps) {
	const currentStatus = statuses.find(
		(status) =>
			status.id === selectedStatusId ||
			normalizeText(status.name) === normalizeText(currentStatusName),
	);
	const currentStatusStyle = getTaskStatusStyle(
		currentStatus?.name ?? currentStatusName,
		currentStatus?.isDone,
	);

	return (
		<DetailRow icon={Circle} label='Status'>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<button
						type='button'
						disabled={isUpdatingTask}
						className='inline-flex items-center gap-2 rounded-full border border-transparent px-0 py-1 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-foreground/80 disabled:opacity-60 cursor-pointer'
					>
						<span
							className={cn(
								"size-2.5 rounded-full",
								currentStatusStyle.dot,
							)}
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
							const statusStyle = getTaskStatusStyle(
								status.name,
								status.isDone,
							);
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
									<span
										className={cn(
											"size-2.5 shrink-0 rounded-full",
											statusStyle.dot,
										)}
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

	const handleSelect = (range?: DateRange) => {
		if (!range) {
			void onSelect(undefined);
			return;
		}
		const newRange = { ...range };
		if (newRange.from && startDate) {
			newRange.from.setHours(startDate.getHours(), startDate.getMinutes());
		}
		if (newRange.to && dueDate) {
			newRange.to.setHours(dueDate.getHours(), dueDate.getMinutes());
		}
		void onSelect(newRange);
	};

	const handleTimeChange = (type: 'from' | 'to', timeString: string) => {
		const [hours, minutes] = timeString.split(':').map(Number);
		const newRange = { from: startDate, to: dueDate };
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
		void onSelect(newRange);
	};

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
								!startDate &&
									!dueDate &&
									"text-muted-foreground",
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
						onSelect={handleSelect}
						className='bg-popover p-4'
					/>
					<div className="flex items-center gap-2 px-3 pb-3 pt-2 border-t">
						<div className="flex flex-col gap-1 flex-1">
							<label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Start Time</label>
							<input 
								type="time" 
								value={startDate ? format(startDate, "HH:mm") : ""}
								onChange={(e) => handleTimeChange('from', e.target.value)}
								className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!startDate}
							/>
						</div>
						<div className="flex flex-col gap-1 flex-1">
							<label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">End Time</label>
							<input 
								type="time" 
								value={dueDate ? format(dueDate, "HH:mm") : ""}
								onChange={(e) => handleTimeChange('to', e.target.value)}
								className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dueDate}
							/>
						</div>
					</div>
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

	const handleSelect = (date?: Date) => {
		if (!date) {
			void onSelect(undefined);
			return;
		}
		const newDate = new Date(date);
		if (dueDate) {
			newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
		}
		void onSelect(newDate);
	};

	const handleTimeChange = (timeString: string) => {
		if (!dueDate) return;
		const [hours, minutes] = timeString.split(':').map(Number);
		const newDate = new Date(dueDate);
		newDate.setHours(hours || 0, minutes || 0);
		void onSelect(newDate);
	};

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
						onSelect={handleSelect}
						className='bg-popover p-4'
					/>
					<div className="flex items-center gap-2 px-3 pb-3 pt-2 border-t">
						<div className="flex flex-col gap-1 flex-1">
							<label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due Time</label>
							<input 
								type="time" 
								value={dueDate ? format(dueDate, "HH:mm") : ""}
								onChange={(e) => handleTimeChange(e.target.value)}
								className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!dueDate}
							/>
						</div>
					</div>
				</PopoverContent>
			</Popover>
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
	attachmentsHook,
}: TaskAttachmentsFieldProps) {
	const { attachments, isLoadingAttachments, isUploading, handleUpload, handleDownload, deleteAttachment } = attachmentsHook;
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		if (files.length > 0) {
			void handleUpload(files);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDownloadAll = () => {
		attachments.forEach((attachment) => {
			void handleDownload(attachment.id, attachment.fileName);
		});
	};

	return (
		<DetailRow
			icon={Paperclip}
			label={`Attachment (${attachments.length})`}
		>
			<div className='space-y-2.5'>
				<div className='flex items-center justify-end gap-2'>
					{attachments.length > 0 && (
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={handleDownloadAll}
							className='h-8 rounded-lg px-3 text-xs'
						>
							<Download className='size-3.5' />
							Download All
						</Button>
					)}

					<Button
						type='button'
						size='sm'
						disabled={isUploading}
						onClick={() => fileInputRef.current?.click()}
						className='h-8 rounded-lg px-3 text-xs'
					>
						{isUploading ? <Loader2 className='size-3.5 animate-spin mr-1' /> : <Plus className='size-3.5 mr-1' />}
						Add File
					</Button>
					<input
						type='file'
						multiple
						className='hidden'
						ref={fileInputRef}
						onChange={handleFileChange}
					/>
				</div>

				{isLoadingAttachments ? (
					<div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-border bg-card/60 text-sm text-muted-foreground">
						<Loader2 className="mr-2 size-4 animate-spin" /> Loading attachments...
					</div>
				) : (
					<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
						{attachments.map((attachment) => (
							<AttachmentCard
								key={attachment.id}
								attachment={attachment}
								onDownload={handleDownload}
								onDelete={deleteAttachment}
							/>
						))}

						<button
							type='button'
							disabled={isUploading}
							onClick={() => fileInputRef.current?.click()}
							className='flex h-16 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60'
						>
							{isUploading ? (
								<Loader2 className='size-4 animate-spin' />
							) : (
								<Plus className='size-4' />
							)}
							<span>{isUploading ? "Uploading..." : "Add attachment"}</span>
						</button>
					</div>
				)}
			</div>
		</DetailRow>
	);
}
