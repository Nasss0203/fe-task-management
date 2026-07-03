"use client";

import { TaskAssigneeField } from "@/features/assign/components/TaskAssigneeField";
import { useTaskDetail } from "@/features/task/hooks/useTaskDetail";
import type { TaskItem } from "@/services/task/type";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "../ui/drawer";
import {
	TaskAttachmentsField,
	TaskDescriptionField,
	TaskPriorityField,
	TaskScheduleField,
	TaskStatusField,
	TaskTagsField,
} from "./task-detail/task-detail-fields";
import { TaskDetailHeader } from "./task-detail/task-detail-header";
import { TaskDetailTabs } from "./task-detail/task-detail-tabs";
export type { MemberOption } from "./task-detail/task-detail-types";

type DrawerItemViewProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task: TaskItem;
};

export function DrawerItemView({
	open,
	onOpenChange,
	task,
}: DrawerItemViewProps) {
	const detail = useTaskDetail(task);

	return (
		<>
			<Drawer direction='right' open={open} onOpenChange={onOpenChange}>
				<DrawerContent className='data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-190 overflow-hidden border-l border-border bg-background p-0 text-foreground'>
					<DrawerHeader className='sr-only'>
						<DrawerTitle>{task.title ?? 'Untitled'}</DrawerTitle>
						<DrawerDescription>
							Task detail drawer
						</DrawerDescription>
					</DrawerHeader>

					<div className='flex h-full min-h-0 flex-col'>
						<TaskDetailHeader
							taskLabel={`Task #${task.projectSeq ?? task.id.slice(0, 6)}`}
							title={task.title}
							isUpdating={detail.isUpdatingTask}
							onTitleSave={detail.updateTitle}
						/>

						<div className='min-h-0 flex-1 overflow-y-auto bg-background px-5 py-6 sm:px-6'>
							<div className='space-y-6'>
								<div className='space-y-5'>
									<TaskStatusField
										currentStatusName={
											detail.display.currentStatusName
										}
										isUpdatingTask={detail.isUpdatingTask}
										open={detail.status.open}
										onOpenChange={
											detail.status.onOpenChange
										}
										statuses={detail.status.options}
										selectedStatusId={
											detail.status.selectedId
										}
										onSelect={detail.status.onSelect}
									/>

									<TaskPriorityField
										currentPriorityColor={
											detail.display.currentPriorityColor
										}
										currentPriorityName={
											detail.display.priorityName
										}
										isUpdatingTask={detail.isUpdatingTask}
										open={detail.priority.open}
										onOpenChange={
											detail.priority.onOpenChange
										}
										priorities={detail.priority.options}
										selectedPriorityId={
											detail.priority.selectedId
										}
										onSelect={detail.priority.onSelect}
									/>

									<TaskScheduleField
										startDate={detail.schedule.startDate}
										dueDate={detail.schedule.dueDate}
										isUpdatingTask={detail.isUpdatingTask}
										open={detail.schedule.open}
										onOpenChange={
											detail.schedule.onOpenChange
										}
										onSelect={detail.schedule.onSelect}
									/>

									<TaskAssigneeField
										open={detail.assignee.open}
										onOpenChange={
											detail.assignee.onOpenChange
										}
										isUpdatingTask={
											detail.isUpdatingTask ||
											detail.assignee.isPending
										}
										selectedMembers={
											detail.assignee.selectedMembers
										}
										members={detail.assignee.members}
										selectedAssigneeIds={
											detail.assignee.selectedIds
										}
										onToggleAssignee={
											detail.assignee.onToggle
										}
										onUnassignAssignee={
											detail.assignee.onUnassign
										}
									/>

									<TaskTagsField
										contextTag={detail.contextTag}
										priorityName={
											detail.display.priorityName
										}
									/>

									<TaskDescriptionField
										description={task.description}
										onSave={detail.updateDescription}
										isUpdating={detail.isUpdatingTask}
									/>

									<TaskAttachmentsField
										attachmentsHook={detail.attachmentsHook}
									/>
								</div>

								<TaskDetailTabs
									comments={detail.comments.items}
									currentUsername={
										detail.comments.currentUsername
									}
									currentUserAvatar={
										detail.comments.currentUserAvatar
									}
									commentDraft={detail.comments.draft}
									composerOpen={detail.comments.composerOpen}
									onComposerFocus={
										detail.comments.onComposerFocus
									}
									onCommentDraftChange={
										detail.comments.onDraftChange
									}
									onCancelComment={detail.comments.onCancel}
									onSaveComment={detail.comments.onSave}
									isSavingComment={detail.comments.isSaving}
									currentUserId={detail.comments.currentUserId}
									editingCommentId={detail.comments.editingCommentId}
									onEditComment={detail.comments.onEdit}
									onDeleteComment={detail.comments.onDelete}
									isUpdatingComment={detail.comments.isUpdating}
									isDeletingComment={detail.comments.isDeleting}
									activities={detail.activities.activities}
									isLoadingActivities={detail.activities.isLoading}
								/>

								<div className='rounded-2xl border border-dashed border-border bg-card/60 px-4 py-3 text-xs leading-6 text-muted-foreground'>
									Current priority:{" "}
									<span className='font-semibold'>
										{detail.display.priorityName}
									</span>
									{task.estimateMinutes ? (
										<span>
											{" "}
											| Estimate: {
												task.estimateMinutes
											}{" "}
											minutes
										</span>
									) : null}
								</div>
							</div>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
