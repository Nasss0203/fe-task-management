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

import { PERMISSIONS } from "@/constants/permissions";
import { usePermission } from "@/features/permission/hooks/usePermission";
import { useMember } from "@/features/member/hooks/useMember";
import { useTask, useTaskStatus } from "@/features/task/hooks/useTask";
import { useUser } from "@/features/auth/hooks/useUser";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { TaskAssigneeSelect } from "@/features/task/components/task/TaskAssignSelect";
import { TaskDateSelect } from "@/features/task/components/task/TaskDateSelect";
import TaskStatusSelect from "@/features/task/components/task/TaskStatusSelect";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "../ui/separator";

const DialogAddTask = () => {
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();

	const { can } = usePermission(currentWorkspaceId ?? undefined);

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
					disabled={!can(PERMISSIONS.TASK_CREATE)}
					className='flex size-6 items-center justify-center rounded-md text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-30'
				>
					<Plus size={16} />
				</button>
			</DialogTriggerV2>

			<DialogContentV2
				showCloseButton={false}
				className='flex! overflow-hidden! flex-col! lg:max-w-[calc(100%-30%)]! 2xl:max-w-[calc(100%-40%)]! rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl p-0'
			>
				<DialogHeaderV2 className='shrink-0 px-6 py-4 bg-muted/20 border-b border-border/50'>
					<DialogTitleV2 className=''>
						<div className='flex items-center justify-between'>
							<DropdownMenu>
								<DropdownMenuTrigger
									asChild
									className='cursor-pointer px-3 py-1.5 rounded-lg hover:hover:bg-accent transition-colors'
								>
									<div className='flex items-center gap-2.5 text-[13px] font-medium'>
										<div className='text-muted-foreground'>
											Add to
										</div>
										<div className='flex items-center gap-1.5 text-foreground'>
											<div>
												Auth
											</div>
											<ChevronDown size={12} className="text-muted-foreground" />
										</div>
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="rounded-xl border-border bg-popover min-w-[160px]">
									<DropdownMenuGroup>
										<DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
											My Account
										</DropdownMenuLabel>
										<DropdownMenuItem className="text-xs focus:focus:bg-accent focus:text-foreground cursor-pointer text-foreground">
											Profile
										</DropdownMenuItem>
										<DropdownMenuItem className="text-xs focus:focus:bg-accent focus:text-foreground cursor-pointer text-foreground">
											Billing
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator className="border-border my-1" />
									<DropdownMenuGroup>
										<DropdownMenuItem className="text-xs focus:focus:bg-accent focus:text-foreground cursor-pointer text-foreground">
											Team
										</DropdownMenuItem>
										<DropdownMenuItem className="text-xs focus:focus:bg-accent focus:text-foreground cursor-pointer text-foreground">
											Subscription
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 overflow-auto px-8 py-8'>
					<div className='flex flex-col mx-auto max-w-4xl'>
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
								className='w-full resize-none overflow-hidden border-none bg-transparent text-2xl font-extrabold tracking-tight text-foreground outline-none ring-0 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 transition-colors'
							/>
						</div>

						<div className='mt-8 rounded-2xl border border-border/50 bg-muted/10 p-6'>
							<div className='grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-x-8 gap-y-4 text-sm items-start'>
								<div className='flex flex-col gap-3'>
									<div className='flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
										<Users size={14} className="text-muted-foreground/70" />
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
									<div className='flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
										<LoaderCircle size={14} className="text-muted-foreground/70" />
										<span>Status</span>
									</div>

									<TaskStatusSelect
										statuses={taskStatuses}
										value={statusId}
										onChange={setStatusId}
									/>
								</div>

								<div className='flex flex-col gap-3'>
									<div className='flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
										<CalendarDays size={14} className="text-muted-foreground/70" />
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
										className='rounded-xl p-2.5 text-muted-foreground bg-background border border-border/50 shadow-sm hover:bg-muted hover:text-foreground transition-all duration-200 mt-auto'
									>
										<MoreHorizontal size={18} />
									</button>
								</div>
							</div>
						</div>

						<TaskComment commentRef={commentRef} />
					</div>
				</div>

				<DialogFooterV2 className='flex justify-end border-t border-border/50 bg-muted/20 px-8 py-5'>
					<Button
						type='button'
						disabled={isSubmitting || !title.trim() || !statusId}
						onClick={handleCreateTask}
						className="h-10 rounded-xl bg-blue-600 px-6 text-[14px] font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
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
		<div className='mt-8 w-full'>
			<div className='mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
				Comments
			</div>

			<div className='flex gap-4 items-start'>
				<div className='flex h-full flex-col mt-1'>
					<Avatar className='size-9 border border-border/50 bg-background shadow-sm'>
						<AvatarFallback className='bg-muted/30 text-[12px] font-semibold text-muted-foreground'>
							N
						</AvatarFallback>
					</Avatar>
				</div>

				<div className="flex-1 flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/10 p-4 transition-all duration-300 focus-within:border-blue-500/50 focus-within:bg-background focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-sm">
					<textarea
						ref={commentRef}
						placeholder='Add a comment...'
						rows={1}
						onInput={(e) => {
							const target = e.currentTarget;
							target.style.height = "auto";
							target.style.height = `${target.scrollHeight}px`;
						}}
						className='w-full resize-none overflow-hidden border-none bg-transparent text-[14px] font-medium leading-relaxed text-foreground outline-none ring-0 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 min-h-[44px]'
					/>

					<div className='flex items-center justify-end gap-2'>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors'
						>
							<Paperclip size={16} />
						</Button>

						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors'
						>
							<AtSign size={16} />
						</Button>

						<Button
							type='button'
							size='icon'
							className='size-8 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 ml-1'
						>
							<ArrowUp size={16} />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
