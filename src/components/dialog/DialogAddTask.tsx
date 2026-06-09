"use client";

import {
	ArrowUp,
	AtSign,
	CalendarDays,
	ChevronDown,
	LoaderCircle,
	MoreHorizontal,
	Paperclip,
	Plus,
	Users,
} from "lucide-react";

import {
	DialogContentV2,
	DialogFooterV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
	DialogV2,
} from "./dialog-custom";

import { useMember } from "@/features/member/hooks/useMember";
import { useTask, useTaskStatus } from "@/features/task/hooks/useTask";
import { useUser } from "@/features/auth/hooks/useUser";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { TaskAssigneeSelect } from "../task/TaskAssignSelect";
import { TaskDateSelect } from "../task/TaskDateSelect";
import TaskStatusSelect from "../task/TaskStatusSelect";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";

const DialogAddTask = () => {
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();

	const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
	const [statusId, setStatusId] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [open, setOpen] = useState(false);

	const titleRef = useRef<HTMLTextAreaElement>(null);
	const commentRef = useRef<HTMLTextAreaElement>(null);
	const creatingRef = useRef(false);

	const projectId = currentProjectId as string;
	const workspaceId = currentWorkspaceId as string;

	const { createTask } = useTask(workspaceId, projectId);
	const { findAllMember } = useMember({ workspaceId });
	const { data: taskStatusResponse } = useTaskStatus(workspaceId, projectId);
	const { user } = useUser();

	const taskStatuses = taskStatusResponse?.data ?? [];
	const members = findAllMember.data?.data ?? [];

	useEffect(() => {
		if (!statusId && taskStatuses.length > 0) {
			setStatusId(taskStatuses[0].id);
		}
	}, [taskStatuses, statusId]);

	const resetForm = () => {
		setTitle("");
		setAssigneeIds([]);
		setDateRange(undefined);
		setStatusId(taskStatuses[0]?.id ?? "");

		if (titleRef.current) {
			titleRef.current.value = "";
			titleRef.current.style.height = "auto";
		}

		if (commentRef.current) {
			commentRef.current.value = "";
			commentRef.current.style.height = "auto";
		}
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (isSubmitting) return;

		setOpen(nextOpen);

		if (!nextOpen) {
			resetForm();
		}
	};

	const handleCreateTask = async () => {
		if (creatingRef.current) return;

		const finalTitle = title.trim();

		if (!finalTitle) {
			titleRef.current?.focus();
			return;
		}

		if (!workspaceId || !projectId || !statusId || !user?.id) {
			return;
		}

		const comment = commentRef.current?.value.trim();

		try {
			creatingRef.current = true;
			setIsSubmitting(true);

			await createTask({
				workspaceId,
				projectId,
				title: finalTitle,
				statusId,
				assigneeIds,
				startAt: dateRange?.from ? dateRange.from.toISOString() : null,
				dueAt: dateRange?.to
					? dateRange.to.toISOString()
					: dateRange?.from
						? dateRange.from.toISOString()
						: null,
				initialComment: comment || null,
				createdBy: user.id,
			});

			resetForm();
			setOpen(false);
		} catch (error) {
			console.error("Failed to create task:", error);
		} finally {
			creatingRef.current = false;
			setIsSubmitting(false);
		}
	};

	return (
		<DialogV2 open={open} onOpenChange={handleOpenChange}>
			<DialogTriggerV2 asChild>
				<button
					type='button'
					className='flex size-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors'
				>
					<Plus size={16} />
				</button>
			</DialogTriggerV2>

			<DialogContentV2
				showCloseButton={false}
				className='flex! overflow-visible! flex-col! lg:max-w-[calc(100%-30%)]! 2xl:max-w-[calc(100%-40%)]! rounded-2xl border-neutral-800 bg-neutral-950 shadow-2xl p-0'
			>
				<DialogHeaderV2 className='shrink-0 px-6 py-4 border-b border-neutral-800/50'>
					<DialogTitleV2 className=''>
						<div className='flex items-center justify-between'>
							<DropdownMenu>
								<DropdownMenuTrigger
									asChild
									className='cursor-pointer px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors'
								>
									<div className='flex items-center gap-2.5 text-[13px] font-medium'>
										<div className='text-neutral-500'>
											Add to
										</div>
										<div className='flex items-center gap-1.5 text-neutral-200'>
											<div>
												Auth
											</div>
											<ChevronDown size={12} className="text-neutral-400" />
										</div>
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="rounded-xl border-neutral-800 bg-neutral-950 min-w-[160px]">
									<DropdownMenuGroup>
										<DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
											My Account
										</DropdownMenuLabel>
										<DropdownMenuItem className="text-xs focus:bg-neutral-900 focus:text-neutral-100 cursor-pointer text-neutral-300">
											Profile
										</DropdownMenuItem>
										<DropdownMenuItem className="text-xs focus:bg-neutral-900 focus:text-neutral-100 cursor-pointer text-neutral-300">
											Billing
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator className="border-neutral-800 my-1" />
									<DropdownMenuGroup>
										<DropdownMenuItem className="text-xs focus:bg-neutral-900 focus:text-neutral-100 cursor-pointer text-neutral-300">
											Team
										</DropdownMenuItem>
										<DropdownMenuItem className="text-xs focus:bg-neutral-900 focus:text-neutral-100 cursor-pointer text-neutral-300">
											Subscription
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 overflow-auto px-6 py-6'>
					<div className='flex flex-col mx-auto max-w-3xl'>
						<div className='w-full'>
							<textarea
								ref={titleRef}
								value={title}
								placeholder='Task title'
								rows={1}
								onChange={(e) => setTitle(e.target.value)}
								onInput={(e) => {
									const target = e.currentTarget;
									target.style.height = "auto";
									target.style.height = `${target.scrollHeight}px`;
								}}
								onPointerDown={(e) => e.stopPropagation()}
								onClick={(e) => e.stopPropagation()}
								className='w-full resize-none overflow-hidden border-none bg-transparent text-xl font-bold tracking-tight text-neutral-100 outline-none ring-0 placeholder:text-neutral-600 focus:outline-none focus:ring-0'
							/>
						</div>

						<div className='mt-8 grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-y-4 text-sm items-start'>
							<div className='flex flex-col gap-3'>
								<div className='flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-neutral-500'>
									<Users size={14} />
									<span>Assignees</span>
								</div>

								<TaskAssigneeSelect
									members={
										members?.map((member: any) => ({
											id: member.user_id,
											name: member.full_name,
											email: member.email,
											avatarUrl: member.avatar_url,
											isMe: member.user_id === user?.id,
										})) ?? []
									}
									value={assigneeIds}
									onChange={setAssigneeIds}
								/>
							</div>

							<div className='flex flex-col gap-3'>
								<div className='flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-neutral-500'>
									<LoaderCircle size={14} />
									<span>Status</span>
								</div>

								<TaskStatusSelect
									statuses={taskStatuses}
									value={statusId}
									onChange={setStatusId}
								/>
							</div>

							<div className='flex flex-col gap-3'>
								<div className='flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-neutral-500'>
									<CalendarDays size={14} />
									<span>Deadline</span>
								</div>

								<TaskDateSelect
									value={dateRange}
									onChange={setDateRange}
								/>
							</div>

							<div className='flex items-end pb-1 h-full'>
								<button
									type='button'
									className='rounded-lg p-2 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100 transition-colors mt-auto'
								>
									<MoreHorizontal size={18} />
								</button>
							</div>
						</div>

						<TaskComment commentRef={commentRef} />
					</div>
				</div>

				<DialogFooterV2 className='flex justify-end border-t border-neutral-800/50 bg-neutral-900/20 px-6 py-4 rounded-b-2xl'>
					<Button
						type='button'
						disabled={isSubmitting || !title.trim() || !statusId}
						onClick={handleCreateTask}
						className="rounded-xl border border-neutral-700 bg-neutral-100 text-neutral-950 font-semibold hover:bg-neutral-300 transition-colors disabled:opacity-50"
					>
						{isSubmitting ? "Creating..." : "Create Task"}
					</Button>
				</DialogFooterV2>
			</DialogContentV2>
		</DialogV2>
	);
};

export default DialogAddTask;

type TaskCommentProps = {
	commentRef: React.RefObject<HTMLTextAreaElement | null>;
};

const TaskComment = ({ commentRef }: TaskCommentProps) => {
	return (
		<div className='mt-10 w-full'>
			<div className='mb-4 text-[12px] font-semibold uppercase tracking-wider text-neutral-500'>
				Comments
			</div>

			<div className='flex gap-4 items-start'>
				<div className='flex h-full flex-col'>
					<Avatar className='size-8 border border-neutral-800 bg-neutral-900 shadow-sm'>
						<AvatarFallback className='bg-transparent text-[11px] font-semibold text-neutral-400'>
							N
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="flex-1 flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition-colors focus-within:border-neutral-700 focus-within:bg-neutral-900/60">
					<textarea
						ref={commentRef}
						placeholder='Add a comment...'
						rows={1}
						onInput={(e) => {
							const target = e.currentTarget;
							target.style.height = "auto";
							target.style.height = `${target.scrollHeight}px`;
						}}
						className='w-full resize-none overflow-hidden border-none bg-transparent text-[14px] font-medium leading-relaxed text-neutral-200 outline-none ring-0 placeholder:text-neutral-600 focus:outline-none focus:ring-0 min-h-[40px]'
					/>

					<div className='flex items-center justify-end gap-1.5'>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 transition-colors'
						>
							<Paperclip size={16} />
						</Button>

						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200 transition-colors'
						>
							<AtSign size={16} />
						</Button>

						<Button
							type='button'
							size='icon'
							className='size-8 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors'
						>
							<ArrowUp size={16} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
