"use client";

import {
	ArrowUp,
	AtSign,
	CalendarDays,
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
import { Separator } from "../ui/separator";

type DialogAddTaskProps = {
	trigger?: React.ReactNode;
	workspaceId?: string;
	projectId?: string;
};

const DialogAddTask = ({ trigger, workspaceId: propWorkspaceId, projectId: propProjectId }: DialogAddTaskProps = {}) => {
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();

	const projectId = propProjectId || (currentProjectId as string);
	const workspaceId = propWorkspaceId || (currentWorkspaceId as string);

	const { can } = usePermission(workspaceId);

	const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
	const [statusId, setStatusId] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [title, setTitle] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [open, setOpen] = useState(false);

	const titleRef = useRef<HTMLTextAreaElement>(null);
	const creatingRef = useRef(false);

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
				initialComment: null,
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
				{trigger || (
					<button
						type='button'
						disabled={!can(PERMISSIONS.TASK_CREATE)}
						className='flex size-6 items-center justify-center rounded-md text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-30'
					>
						<Plus size={16} />
					</button>
				)}
			</DialogTriggerV2>

			<DialogContentV2
				showCloseButton={false}
				className='flex overflow-hidden flex-col sm:max-w-3xl! lg:max-w-3xl! min-h-0! h-fit rounded-xl border-border/50 bg-background shadow-2xl p-0'
			>
				<DialogHeaderV2 className='shrink-0 px-5 py-3 bg-muted/30 border-b border-border/50'>
					<DialogTitleV2 className='text-sm font-semibold text-foreground'>
						Tạo công việc mới
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 overflow-auto px-8 py-8'>
					<div className='flex flex-col mx-auto w-full'>
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
								className='w-full resize-none overflow-hidden border-none bg-transparent text-xl font-bold tracking-tight text-foreground outline-none ring-0 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-0 transition-colors'
							/>
						</div>

						<div className='mt-6 flex flex-wrap gap-8 items-start'>
							<div className='flex flex-col gap-2.5'>
								<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
									<Users size={13} className="text-muted-foreground/70" />
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

							<div className='flex flex-col gap-2.5'>
								<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
									<LoaderCircle size={13} className="text-muted-foreground/70" />
									<span>Status</span>
								</div>

								<TaskStatusSelect
									statuses={taskStatuses}
									value={statusId}
									onChange={setStatusId}
								/>
							</div>

							<div className='flex flex-col gap-2.5'>
								<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
									<CalendarDays size={13} className="text-muted-foreground/70" />
									<span>Deadline</span>
								</div>

								<TaskDateSelect
									value={dateRange}
									onChange={setDateRange}
								/>
							</div>

							<div className='flex items-end pb-0.5 mt-auto ml-auto'>
								<button
									type='button'
									className='rounded-md p-2 text-muted-foreground bg-transparent hover:bg-accent hover:text-foreground transition-all duration-200'
								>
									<MoreHorizontal size={16} />
								</button>
							</div>
						</div>
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


