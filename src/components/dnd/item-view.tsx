"use client";

import { getTaskStatusBackgroundClass } from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/services/task/type";
import {
	CalendarDays,
	Ellipsis,
	ExternalLink,
	Pencil,
	Trash,
} from "lucide-react";
import * as React from "react";
import TaskAssignees from "../task/TaskAssignees";
import TaskTrashDialog from "../task/TaskTrashDialog";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

function getPriorityBadgeClass(priority?: string) {
	const normalizedPriority = priority
		?.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[\s_-]+/g, "");

	switch (normalizedPriority) {
		case "high":
		case "cao":
			return "bg-red-500 text-white";
		case "medium":
		case "trungbinh":
			return "bg-amber-500 text-white";
		case "low":
		case "thap":
			return "bg-emerald-500 text-white";
		default:
			return "bg-slate-500 text-white";
	}
}

function formatShortDateLabel(value?: string | null) {
	if (!value) return null;

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return null;

	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
	}).format(date);
}

function formatScheduleLabel(startAt?: string | null, dueAt?: string | null) {
	const startLabel = formatShortDateLabel(startAt);
	const dueLabel = formatShortDateLabel(dueAt);

	if (startLabel && dueLabel && startLabel === dueLabel) {
		return startLabel;
	}

	if (startLabel && dueLabel) {
		return `${startLabel} -> ${dueLabel}`;
	}

	if (startLabel) {
		return `Bắt đầu ${startLabel}`;
	}

	if (dueLabel) {
		return `Hạn ${dueLabel}`;
	}

	return null;
}

type ItemViewProps = React.HTMLAttributes<HTMLDivElement> & {
	id: string;
	task?: TaskItem;
	isOverlay?: boolean;
	status: string;
	name: string;
	priority?: string;
	assignees?: TaskItem["assignees"];
	startAt?: string | null;
	dueAt?: string | null;
	description?: string;
	onUpdateName?: (id: string, newName: string) => void;
	onOpenDetail?: (taskId: string) => void;
};

export const ItemView = React.forwardRef<HTMLDivElement, ItemViewProps>(
	(
		{
			id,
			task,
			isOverlay,
			status,
			name,
			className,
			description,
			priority,
			assignees,
			startAt,
			dueAt,
			onUpdateName,
			onOpenDetail,
			...props
		},
		ref,
	) => {
		const scheduleLabel = formatScheduleLabel(startAt, dueAt);
		const hasFooterMeta =
			Boolean(scheduleLabel) || Boolean(assignees?.length);

		const [localName, setLocalName] = React.useState(name);
		const [isEditingName, setIsEditingName] = React.useState(false);
		const [isActionOpen, setIsActionOpen] = React.useState(false);
		const [taskTrashOpen, setTaskTrashOpen] = React.useState(false);
		const inputRef = React.useRef<HTMLInputElement>(null);
		const skipBlurCommitRef = React.useRef(false);

		React.useEffect(() => {
			setLocalName(name);
		}, [name]);

		React.useEffect(() => {
			if (!isEditingName) return;

			const frame = window.requestAnimationFrame(() => {
				inputRef.current?.focus();
				inputRef.current?.select();
			});

			return () => window.cancelAnimationFrame(frame);
		}, [isEditingName]);

		const startEditingName = React.useCallback(() => {
			skipBlurCommitRef.current = false;
			setIsActionOpen(false);
			setIsEditingName(true);
		}, []);

		const cancelEditingName = React.useCallback(() => {
			skipBlurCommitRef.current = true;
			setLocalName(name);
			setIsEditingName(false);
		}, [name]);

		const commitName = React.useCallback(() => {
			const trimmed = localName.trim();
			const original = name.trim();

			if (!trimmed) {
				setLocalName(name);
				setIsEditingName(false);
				return;
			}

			setLocalName(trimmed);

			if (trimmed !== original) {
				onUpdateName?.(id, trimmed);
			}

			setIsEditingName(false);
		}, [id, localName, name, onUpdateName]);

		return (
			<div
				ref={ref}
				{...props}
				className={cn(
					"w-full border border-border px-4 py-2 rounded-lg dark:border-white/5 cursor-pointer hover:opacity-70 transition-opacity shadow-sm",
					"select-none touch-none",
					getTaskStatusBackgroundClass(status),
					isOverlay && "shadow-lg",
					className,
				)}
			>
				<div className='flex flex-col gap-1'>
					<div className='flex items-start gap-1'>
						<div className='min-w-0 flex-1'>
							{isEditingName ? (
								<input
									ref={inputRef}
									type='text'
									data-prevent-open-detail='true'
									value={localName}
									onChange={(e) =>
										setLocalName(e.target.value)
									}
									onBlur={() => {
										if (skipBlurCommitRef.current) {
											skipBlurCommitRef.current = false;
											return;
										}

										commitName();
									}}
									onClick={(e) => e.stopPropagation()}
									onPointerDown={(e) => e.stopPropagation()}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											e.currentTarget.blur();
										}

										if (e.key === "Escape") {
											e.preventDefault();
											cancelEditingName();
										}
									}}
									className='w-full resize-none overflow-hidden border-none bg-transparent text-sm font-extrabold outline-none ring-0 placeholder:font-bold focus:outline-none focus:ring-0'
								/>
							) : (
								<div className='truncate text-sm font-extrabold'>
									{localName}
								</div>
							)}
						</div>

						<div className='flex items-center gap-1'>
							<button
								type='button'
								data-prevent-open-detail='true'
								aria-label='Rename task'
								onClick={(e) => {
									e.stopPropagation();
									startEditingName();
								}}
								onPointerDown={(e) => e.stopPropagation()}
								className={cn(
									"rounded-sm p-1 hover:bg-neutral-500 dark:hover:bg-neutral-400",
									isEditingName && "bg-neutral-500/20",
								)}
							>
								<Pencil size={16} />
							</button>

							<Popover
								open={isActionOpen}
								onOpenChange={setIsActionOpen}
							>
								<PopoverTrigger asChild>
									<button
										type='button'
										data-prevent-open-detail='true'
										aria-label='Open task actions'
										onClick={(e) => e.stopPropagation()}
										onPointerDown={(e) =>
											e.stopPropagation()
										}
										className='rounded-sm p-1 hover:bg-neutral-500 dark:hover:bg-neutral-400'
									>
										<Ellipsis size={16} />
									</button>
								</PopoverTrigger>

								<PopoverContent
									data-prevent-open-detail='true'
									align='end'
									side='bottom'
									sideOffset={8}
									onClick={(e) => e.stopPropagation()}
									onPointerDown={(e) => e.stopPropagation()}
									className='w-72 rounded-xl border border-border bg-popover p-0 shadow-xl'
								>
									<Command className='bg-transparent'>
										<CommandInput
											autoFocus
											placeholder='Tìm kiếm hành động...'
											className='h-11'
										/>

										<CommandList>
											<CommandEmpty>
												Không tìm thấy hành động.
											</CommandEmpty>

											<CommandGroup
												heading='Công việc'
												className='px-2 pb-2'
											>
												<CommandItem
													value='doi ten task'
													onSelect={startEditingName}
													className='cursor-pointer rounded-lg px-2 py-2'
												>
													<Pencil size={16} />
													<span>Đổi tên task</span>
												</CommandItem>

												<CommandItem
													value='mo chi tiet'
													onSelect={() => {
														setIsActionOpen(false);
														onOpenDetail?.(id);
													}}
													className='cursor-pointer rounded-lg px-2 py-2'
												>
													<ExternalLink size={16} />
													<span>Mở chi tiết</span>
												</CommandItem>

												<CommandItem
													value='delete_task'
													onSelect={() => {
														setIsActionOpen(false);
														setTaskTrashOpen(true);
													}}
													className='cursor-pointer rounded-lg px-2 py-2 text-red-500'
												>
													<Trash
														size={16}
														className='text-red-500'
													/>
													<span>Xóa task</span>
												</CommandItem>
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className='text-sm font-medium line-clamp-2 mb-2'>
						{description}
					</div>

					{priority ? (
						<div className='flex items-center gap-1 flex-wrap'>
							<div
								className={cn(
									"inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold leading-none",
									getPriorityBadgeClass(priority),
								)}
							>
								{priority}
							</div>
						</div>
					) : null}
					{hasFooterMeta ? <Separator className='my-1.5' /> : null}

					{hasFooterMeta ? (
						<div className='flex items-center justify-between gap-3'>
							<TaskAssignees assignees={assignees} />
							{scheduleLabel ? (
								<div className='inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground justify-end'>
									<CalendarDays className='size-3.5' />
									<span>{scheduleLabel}</span>
								</div>
							) : null}
						</div>
					) : null}
				</div>
				{task ? (
					<TaskTrashDialog
						tasks={[task]}
						workspaceId={task.workspaceId}
						projectId={task.projectId}
						open={taskTrashOpen}
						onOpenChange={setTaskTrashOpen}
					/>
				) : null}
			</div>
		);
	},
);

ItemView.displayName = "ItemView";
