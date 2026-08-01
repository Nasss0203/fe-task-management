"use client";

import { useUser } from "@/features/auth/hooks/useUser";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";
import { useTaskDetailAssignees } from "./useTaskDetailAssignees";
import { useTaskDetailComments } from "./useTaskDetailComments";
import { useTaskDetailFields } from "./useTaskDetailFields";
import { useTaskAttachments } from "./useTaskAttachments";
import { useTaskDetailActivities } from "./useTaskDetailActivities";
import { useCreateSubtask, useTaskDetailQuery } from "./useTask";

export function useTaskDetail(task: TaskItem) {
	const { user } = useUser();
	const taskDetailQuery = useTaskDetailQuery(task.id);
	const currentTask = taskDetailQuery.data?.data ?? task;
	const fields = useTaskDetailFields(currentTask);
	const assignee = useTaskDetailAssignees(currentTask, user);
	const comments = useTaskDetailComments(currentTask, user);
	const activities = useTaskDetailActivities(currentTask.workspaceId, currentTask.id);
	const createSubtask = useCreateSubtask({
		workspaceId: currentTask.workspaceId,
		projectId: currentTask.projectId,
	});
	const [subtaskDraft, setSubtaskDraft] = React.useState("");

	const currentStatusName =
		fields.status.current?.name ?? currentTask.statusName ?? "No status";
	const priorityName =
		fields.priority.current?.name ?? currentTask.priorityName ?? "No priority";
	const attachmentsHook = useTaskAttachments(currentTask);
	const contextTag = React.useMemo(
		() =>
			currentTask.sprintName ??
			`Task #${currentTask.projectSeq ?? currentTask.id.slice(0, 6)}`,
		[currentTask.id, currentTask.projectSeq, currentTask.sprintName],
	);

	React.useEffect(() => {
		setSubtaskDraft("");
	}, [currentTask.id]);

	const handleCreateSubtask = async () => {
		const title = subtaskDraft.trim();

		if (!title || !currentTask.statusId) {
			return;
		}

		await createSubtask.mutateAsync({
			parentTaskId: currentTask.id,
			workspaceId: currentTask.workspaceId,
			projectId: currentTask.projectId,
			title,
			statusId: currentTask.statusId,
			priorityId: currentTask.priorityId,
		});

		setSubtaskDraft("");
	};

	return {
		task: currentTask,
		assignee,
		status: fields.status,
		priority: fields.priority,
		schedule: fields.schedule,
		comments,
		activities,
		subtasks: {
			items: currentTask.subtasks ?? [],
			draft: subtaskDraft,
			onDraftChange: setSubtaskDraft,
			onCreate: handleCreateSubtask,
			isCreating: createSubtask.isPending,
			isLoading: taskDetailQuery.isLoading,
		},
		isUpdatingTask: fields.isUpdatingTask,
		display: {
			currentStatusName,
			priorityName,
		},
		attachmentsHook,
		contextTag,
		updateTitle: fields.updateTitle,
		updateDescription: fields.updateDescription,
	};
}
