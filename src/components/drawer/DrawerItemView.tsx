"use client";

import { useMember } from "@/hooks/use-member";
import { useTask, useTaskPriority, useTaskStatus } from "@/hooks/use-task";
import { useUser } from "@/hooks/use-user";
import type { TaskStatusItem } from "@/services/task-status/type";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "../ui/drawer";
import {
	TaskAssigneeField,
	TaskAttachmentsField,
	TaskDescriptionField,
	TaskPriorityField,
	TaskScheduleField,
	TaskStatusField,
	TaskTagsField,
} from "./task-detail/task-detail-fields";
import { TaskDetailHeader } from "./task-detail/task-detail-header";
import { TaskDetailTabs } from "./task-detail/task-detail-tabs";
import type {
	ActivityEntry,
	LocalComment,
	LocalSubtask,
	MemberOption,
} from "./task-detail/task-detail-types";
import {
	buildAttachmentFallback,
	formatCommentTime,
	formatDateLabel,
	formatDateTime,
	getAssigneeName,
	normalizeText,
	parseDate,
} from "./task-detail/task-detail-utils";

export type { MemberOption } from "./task-detail/task-detail-types";

type DrawerItemViewProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task: TaskItem;
};

type WorkspaceMemberItem = {
	user_id: string;
	full_name: string;
	email?: string;
	avatar_url?: string | null;
};

export function DrawerItemView({
	open,
	onOpenChange,
	task,
}: DrawerItemViewProps) {
	const { findAllMember } = useMember({ workspaceId: task.workspaceId });
	const taskStatusQuery = useTaskStatus(task.workspaceId, task.projectId);
	const taskPriorityQuery = useTaskPriority(task.workspaceId, task.projectId);
	const {
		updateTask: {
			mutateAsync: updateTaskMutate,
			isPending: isUpdatingTask,
		},
	} = useTask(task.workspaceId, task.projectId);
	const { user } = useUser();

	const [assigneeOpen, setAssigneeOpen] = React.useState(false);
	const [scheduleOpen, setScheduleOpen] = React.useState(false);
	const [statusOpen, setStatusOpen] = React.useState(false);
	const [priorityOpen, setPriorityOpen] = React.useState(false);
	const [startDate, setStartDate] = React.useState<Date | undefined>(() =>
		parseDate(task.startAt),
	);
	const [dueDate, setDueDate] = React.useState<Date | undefined>(() =>
		parseDate(task.dueAt),
	);
	const [selectedStatusId, setSelectedStatusId] = React.useState(
		task.statusId,
	);
	const [selectedPriorityId, setSelectedPriorityId] = React.useState<
		string | null
	>(task.priorityId);
	const [selectedAssigneeIds, setSelectedAssigneeIds] = React.useState<
		string[]
	>(() => task.assignees.map((assignee) => assignee.userId));
	const [commentDraft, setCommentDraft] = React.useState("");
	const [composerOpen, setComposerOpen] = React.useState(false);
	const [comments, setComments] = React.useState<LocalComment[]>([]);

	const members = React.useMemo<MemberOption[]>(() => {
		const rawMembers = (findAllMember.data?.data ??
			[]) as WorkspaceMemberItem[];

		return rawMembers.map((member) => ({
			id: member.user_id,
			name: member.full_name,
			email: member.email,
			avatarUrl: member.avatar_url,
			isMe: member.user_id === user?.id,
		}));
	}, [findAllMember.data?.data, user?.id]);

	const statuses = React.useMemo<TaskStatusItem[]>(() => {
		return [...(taskStatusQuery.data?.data ?? [])].sort(
			(a, b) => a.position - b.position,
		);
	}, [taskStatusQuery.data?.data]);

	const priorities = React.useMemo<TaskStatusItem[]>(() => {
		return [...(taskPriorityQuery.data?.data ?? [])].sort(
			(a, b) => a.position - b.position,
		);
	}, [taskPriorityQuery.data?.data]);

	const fallbackSelectedMembers = React.useMemo<MemberOption[]>(() => {
		return task.assignees.map((assignee) => ({
			id: assignee.userId,
			name: getAssigneeName(assignee),
			avatarUrl: assignee.avatarUrl,
			isMe: assignee.userId === user?.id,
		}));
	}, [task.assignees, user?.id]);

	const selectedMembers = React.useMemo<MemberOption[]>(() => {
		const memberMap = new Map(
			members.map((member) => [member.id, member] as const),
		);
		const fallbackMap = new Map(
			fallbackSelectedMembers.map(
				(member) => [member.id, member] as const,
			),
		);

		return selectedAssigneeIds
			.map((id) => memberMap.get(id) ?? fallbackMap.get(id))
			.filter((member): member is MemberOption => !!member);
	}, [members, fallbackSelectedMembers, selectedAssigneeIds]);

	const currentStatus = React.useMemo(() => {
		return (
			statuses.find((status) => status.id === selectedStatusId) ??
			statuses.find(
				(status) =>
					normalizeText(status.name) ===
					normalizeText(task.statusName),
			) ??
			null
		);
	}, [selectedStatusId, statuses, task.statusName]);

	const currentPriority = React.useMemo(() => {
		return (
			priorities.find((priority) => priority.id === selectedPriorityId) ??
			priorities.find(
				(priority) =>
					normalizeText(priority.name) ===
					normalizeText(task.priorityName),
			) ??
			null
		);
	}, [priorities, selectedPriorityId, task.priorityName]);

	React.useEffect(() => {
		setCommentDraft("");
		setComposerOpen(false);
		setComments([]);
		setAssigneeOpen(false);
		setScheduleOpen(false);
		setStatusOpen(false);
		setPriorityOpen(false);
	}, [task.id]);

	React.useEffect(() => {
		setStartDate(parseDate(task.startAt));
	}, [task.id, task.startAt]);

	React.useEffect(() => {
		setDueDate(parseDate(task.dueAt));
	}, [task.id, task.dueAt]);

	React.useEffect(() => {
		setSelectedStatusId(task.statusId);
	}, [task.id, task.statusId]);

	React.useEffect(() => {
		setSelectedPriorityId(task.priorityId);
	}, [task.id, task.priorityId]);

	React.useEffect(() => {
		setSelectedAssigneeIds(
			task.assignees.map((assignee) => assignee.userId),
		);
	}, [task.id, task.assignees]);

	const handleScheduleSelect = async (
		selectedRange?: { from?: Date; to?: Date },
	) => {
		const previousStartDate = startDate;
		const previousDueDate = dueDate;
		const nextStartDate = selectedRange?.from;
		const nextDueDate = selectedRange?.to;

		setStartDate(nextStartDate);
		setDueDate(nextDueDate);

		if (nextStartDate && nextDueDate) {
			setScheduleOpen(false);
		}

		try {
			await updateTaskMutate({
				id: task.id,
				startAt: nextStartDate ? nextStartDate.toISOString() : null,
				dueAt: nextDueDate ? nextDueDate.toISOString() : null,
			});
		} catch (error) {
			console.error("Update task schedule failed:", error);
			setStartDate(previousStartDate);
			setDueDate(previousDueDate);
		}
	};

	const handleStatusSelect = async (statusId: string) => {
		const previousStatusId = selectedStatusId;

		setSelectedStatusId(statusId);
		setStatusOpen(false);

		try {
			await updateTaskMutate({
				id: task.id,
				statusId,
			});
		} catch (error) {
			console.error("Update status failed:", error);
			setSelectedStatusId(previousStatusId);
		}
	};

	const handlePrioritySelect = async (priorityId: string | null) => {
		const previousPriorityId = selectedPriorityId;

		setSelectedPriorityId(priorityId);
		setPriorityOpen(false);

		try {
			await updateTaskMutate({
				id: task.id,
				priorityId,
			});
		} catch (error) {
			console.error("Update priority failed:", error);
			setSelectedPriorityId(previousPriorityId);
		}
	};

	const handleToggleAssignee = async (memberId: string) => {
		const previousIds = selectedAssigneeIds;
		const nextIds = selectedAssigneeIds.includes(memberId)
			? selectedAssigneeIds.filter((id) => id !== memberId)
			: [...selectedAssigneeIds, memberId];

		setSelectedAssigneeIds(nextIds);

		try {
			await updateTaskMutate({
				id: task.id,
				assigneeIds: nextIds,
			});
		} catch (error) {
			console.error("Update assignees failed:", error);
			setSelectedAssigneeIds(previousIds);
		}
	};

	const handleSaveComment = () => {
		const trimmed = commentDraft.trim();

		if (!trimmed) return;

		const authorName = user?.username || "You";
		const now = new Date();

		setComments((current) => [
			{
				id: `${task.id}-${now.getTime()}`,
				authorName,
				authorAvatar: user?.avatarUrl,
				body: trimmed,
				createdAt: formatCommentTime(now),
			},
			...current,
		]);
		setCommentDraft("");
		setComposerOpen(false);
	};

	const handleCancelComment = () => {
		setCommentDraft("");
		setComposerOpen(false);
	};

	const currentStatusName =
		currentStatus?.name ?? task.statusName ?? "No status";
	const currentStatusColor = currentStatus?.color ?? "#6366F1";
	const priorityName =
		currentPriority?.name ?? task.priorityName ?? "No priority";
	const currentPriorityColor = currentPriority?.color ?? "#71717A";
	const currentUsername = user?.username || "You";
	const attachments = React.useMemo(
		() => buildAttachmentFallback(task),
		[task],
	);
	const contextTag = React.useMemo(
		() =>
			task.sprintName ??
			`Task #${task.projectSeq ?? task.id.slice(0, 6)}`,
		[task.id, task.projectSeq, task.sprintName],
	);

	const subtasks = React.useMemo<LocalSubtask[]>(() => {
		const descriptionSummary = task.description?.trim()
			? task.description.trim()
			: "Align the goal and outline the expected result before execution.";
		const completedStatus = currentStatus?.isDone ?? false;

		return [
			{
				id: `${task.id}-subtask-1`,
				title: "Review the task brief",
				note: descriptionSummary,
				done: Boolean(task.description),
			},
			{
				id: `${task.id}-subtask-2`,
				title: "Confirm ownership and due date",
				note: dueDate
					? `This task is planned for ${formatDateLabel(dueDate)}.`
					: "Pick an owner and schedule a due date for this task.",
				done: selectedMembers.length > 0 && Boolean(dueDate),
			},
			{
				id: `${task.id}-subtask-3`,
				title: "Track progress updates",
				note: comments.length
					? `${comments.length} local comment(s) recorded in this drawer.`
					: "Use the comments tab to capture blockers and quick updates.",
				done: comments.length > 0,
			},
			{
				id: `${task.id}-subtask-4`,
				title: "Close the checklist",
				note: completedStatus
					? "The selected status is already marked as done."
					: "Move the status into a done state after the work is complete.",
				done: completedStatus,
			},
		];
	}, [
		comments.length,
		currentStatus?.isDone,
		dueDate,
		selectedMembers.length,
		task.description,
		task.id,
	]);

	const completedSubtasks = subtasks.filter((item) => item.done).length;

	const activityItems = React.useMemo<ActivityEntry[]>(() => {
		const items: ActivityEntry[] = [];

		if (task.createdAt) {
			items.push({
				id: `${task.id}-created`,
				label: "Created",
				time: formatDateTime(task.createdAt),
				description: "Task detail was created in the workspace.",
			});
		}

		if (task.updatedAt) {
			items.push({
				id: `${task.id}-updated`,
				label: "Last updated",
				time: formatDateTime(task.updatedAt),
				description: `Current status: ${currentStatusName}.`,
			});
		}

		items.push({
			id: `${task.id}-assignees`,
			label: "Assignees",
			time: selectedMembers.length
				? `${selectedMembers.length} member(s)`
				: "Unassigned",
			description: selectedMembers.length
				? selectedMembers.map((member) => member.name).join(", ")
				: "No team member has been assigned yet.",
		});

		items.push({
			id: `${task.id}-start-date`,
			label: "Start date",
			time: formatDateLabel(startDate),
			description: startDate
				? "Planned start date for this task."
				: "No start date has been scheduled yet.",
		});

		items.push({
			id: `${task.id}-due-date`,
			label: "Due date",
			time: formatDateLabel(dueDate),
			description: dueDate
				? "Current target date for this task."
				: "Set a due date to help the team stay aligned.",
		});

		if (comments.length) {
			items.push({
				id: `${task.id}-comments`,
				label: "Comments",
				time: `${comments.length} note(s)`,
				description:
					"These notes are currently stored only in the local UI.",
			});
		}

		return items;
	}, [
		comments.length,
		currentStatusName,
		startDate,
		dueDate,
		selectedMembers,
		task.createdAt,
		task.id,
		task.updatedAt,
	]);

	return (
		<Drawer direction='right' open={open} onOpenChange={onOpenChange}>
			<DrawerContent className='data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-190 overflow-hidden border-l border-border bg-background p-0 text-foreground'>
				<DrawerHeader className='sr-only'>
					<DrawerTitle>{task.title}</DrawerTitle>
					<DrawerDescription>Task detail drawer</DrawerDescription>
				</DrawerHeader>

				<div className='flex h-full min-h-0 flex-col'>
					<TaskDetailHeader
						taskLabel={`Task #${task.projectSeq ?? task.id.slice(0, 6)}`}
						title={task.title}
					/>

					<div className='min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6 sm:px-6'>
						<div className='space-y-6'>
							<div className='space-y-5'>
								<TaskStatusField
									currentStatusColor={currentStatusColor}
									currentStatusName={currentStatusName}
									isUpdatingTask={isUpdatingTask}
									open={statusOpen}
									onOpenChange={setStatusOpen}
									statuses={statuses}
									selectedStatusId={selectedStatusId}
									onSelect={handleStatusSelect}
								/>

								<TaskPriorityField
									currentPriorityColor={currentPriorityColor}
									currentPriorityName={priorityName}
									isUpdatingTask={isUpdatingTask}
									open={priorityOpen}
									onOpenChange={setPriorityOpen}
									priorities={priorities}
									selectedPriorityId={selectedPriorityId}
									onSelect={handlePrioritySelect}
								/>

								<TaskScheduleField
									startDate={startDate}
									dueDate={dueDate}
									isUpdatingTask={isUpdatingTask}
									open={scheduleOpen}
									onOpenChange={setScheduleOpen}
									onSelect={handleScheduleSelect}
								/>

								<TaskAssigneeField
									open={assigneeOpen}
									onOpenChange={setAssigneeOpen}
									isUpdatingTask={isUpdatingTask}
									selectedMembers={selectedMembers}
									members={members}
									selectedAssigneeIds={selectedAssigneeIds}
									onToggleAssignee={handleToggleAssignee}
								/>

								<TaskTagsField
									contextTag={contextTag}
									priorityName={priorityName}
								/>

								<TaskDescriptionField
									description={task.description}
								/>

								<TaskAttachmentsField
									attachments={attachments}
								/>
							</div>

							<TaskDetailTabs
								subtasks={subtasks}
								completedSubtasks={completedSubtasks}
								comments={comments}
								currentUsername={currentUsername}
								currentUserAvatar={user?.avatarUrl}
								commentDraft={commentDraft}
								composerOpen={composerOpen}
								onComposerFocus={() => setComposerOpen(true)}
								onCommentDraftChange={setCommentDraft}
								onCancelComment={handleCancelComment}
								onSaveComment={handleSaveComment}
								activityItems={activityItems}
								currentStatusColor={currentStatusColor}
							/>

							<div className='rounded-2xl border border-dashed border-border bg-card/60 px-4 py-3 text-xs leading-6 text-muted-foreground'>
								Current priority:{" "}
								<span className='font-semibold'>
									{priorityName}
								</span>
								{task.estimateMinutes ? (
									<span>
										{" "}
										| Estimate: {task.estimateMinutes}{" "}
										minutes
									</span>
								) : null}
							</div>
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
