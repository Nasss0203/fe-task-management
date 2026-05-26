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

import { useMember } from "@/hooks/use-member";
import { useTask, useTaskStatus } from "@/hooks/use-task";
import { useUser } from "@/hooks/use-user";
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
					className='flex size-5 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'
				>
					<Plus size={14} />
				</button>
			</DialogTriggerV2>

			<DialogContentV2
				showCloseButton={false}
				className='flex! overflow-visible! flex-col! lg:max-w-[calc(100%-30%)]! 2xl:max-w-[calc(100%-40%)]!'
			>
				<DialogHeaderV2 className='shrink-0'>
					<DialogTitleV2 className=''>
						<div className='flex items-center justify-between'>
							<DropdownMenu>
								<DropdownMenuTrigger
									asChild
									className='cursor-pointer px-2 py-1 rounded-md hover:bg-neutral-800'
								>
									<div className='flex items-center gap-2 text-sm font-normal'>
										<div className='text-neutral-400'>
											Thêm vào
										</div>
										<div className='flex items-center gap-1'>
											<div className='font-medium'>
												Auth
											</div>
											<ChevronDown size={10} />
										</div>
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuGroup>
										<DropdownMenuLabel>
											My Account
										</DropdownMenuLabel>
										<DropdownMenuItem>
											Profile
										</DropdownMenuItem>
										<DropdownMenuItem>
											Billing
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem>
											Team
										</DropdownMenuItem>
										<DropdownMenuItem>
											Subscription
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 overflow-auto mt-2'>
					<div className='flex flex-col px-20'>
						<div className='w-full'>
							<textarea
								ref={titleRef}
								value={title}
								placeholder='Thêm công việc'
								rows={1}
								onChange={(e) => setTitle(e.target.value)}
								onInput={(e) => {
									const target = e.currentTarget;
									target.style.height = "auto";
									target.style.height = `${target.scrollHeight}px`;
								}}
								onPointerDown={(e) => e.stopPropagation()}
								onClick={(e) => e.stopPropagation()}
								className='w-full resize-none overflow-hidden border-none bg-transparent text-xl font-extrabold outline-none ring-0 placeholder:text-neutral-500 focus:outline-none focus:ring-0'
							/>
						</div>

						<div className='mt-4 grid w-full  grid-cols-[1fr_1fr_1fr_auto] gap-y-2 text-sm'>
							<div className='flex flex-col gap-2'>
								<div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
									<Users size={16} />
									<span>Người được giao</span>
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

							<div className='flex flex-col gap-2'>
								<div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
									<LoaderCircle size={16} />
									<span>Trạng thái</span>
								</div>

								<TaskStatusSelect
									statuses={taskStatuses}
									value={statusId}
									onChange={setStatusId}
								/>
							</div>

							<div className='flex flex-col gap-2'>
								<div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
									<CalendarDays size={16} />
									<span>Hạn chót</span>
								</div>

								<TaskDateSelect
									value={dateRange}
									onChange={setDateRange}
								/>
							</div>

							<div className='flex items-end pb-1'>
								<button
									type='button'
									className='rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground'
								>
									<MoreHorizontal size={18} />
								</button>
							</div>
						</div>

						<TaskComment commentRef={commentRef} />
					</div>
				</div>

				<DialogFooterV2 className='flex justify-end'>
					<Button
						type='button'
						disabled={isSubmitting || !title.trim() || !statusId}
						onClick={handleCreateTask}
					>
						{isSubmitting ? "Đang tạo..." : "Thêm công việc"}
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
		<div className='mt-5 w-full max-w-4xl'>
			<div className='mb-4 text-sm font-semibold text-foreground'>
				Bình luận
			</div>

			<div className='flex gap-3'>
				<div className='flex h-full flex-col'>
					<Avatar className='size-8 border border-border '>
						<AvatarFallback className='bg-transparent text-sm text-muted-foreground'>
							N
						</AvatarFallback>
					</Avatar>
				</div>

				<textarea
					ref={commentRef}
					placeholder='Thêm công việc'
					rows={1}
					onInput={(e) => {
						const target = e.currentTarget;
						target.style.height = "auto";
						target.style.height = `${target.scrollHeight}px`;
					}}
					className='w-full resize-none overflow-hidden border-none bg-transparent text-sm font-normal outline-none ring-0 focus:outline-none focus:ring-0'
				/>

				<div className='ml-auto '>
					<div className='flex items-center gap-1'>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 rounded-full text-muted-foreground hover:text-foreground'
						>
							<Paperclip size={17} />
						</Button>

						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-8 rounded-full text-muted-foreground hover:text-foreground'
						>
							<AtSign size={17} />
						</Button>

						<Button
							type='button'
							size='icon'
							className='size-8 rounded-full'
						>
							<ArrowUp size={16} />
						</Button>
					</div>
				</div>
			</div>

			<Separator className='mt-4' />
		</div>
	);
};
