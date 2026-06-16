"use client";

import { useUser } from "@/features/auth/hooks/useUser";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";
import { useTaskDetailAssignees } from "./useTaskDetailAssignees";
import { useTaskDetailComments } from "./useTaskDetailComments";
import { useTaskDetailFields } from "./useTaskDetailFields";
import { useTaskAttachments } from "./useTaskAttachments";
import { useTaskDetailActivities } from "./useTaskDetailActivities";

export function useTaskDetail(task: TaskItem) {
	const { user } = useUser();
	const fields = useTaskDetailFields(task);
	const assignee = useTaskDetailAssignees(task, user);
	const comments = useTaskDetailComments(task, user);
	const activities = useTaskDetailActivities(task.workspaceId, task.id);

	const currentStatusName =
		fields.status.current?.name ?? task.statusName ?? "No status";
	const priorityName =
		fields.priority.current?.name ?? task.priorityName ?? "No priority";
	const currentPriorityColor = fields.priority.current?.color ?? "#71717A";
	const attachmentsHook = useTaskAttachments(task);
	const contextTag = React.useMemo(
		() =>
			task.sprintName ??
			`Task #${task.projectSeq ?? task.id.slice(0, 6)}`,
		[task.id, task.projectSeq, task.sprintName],
	);

	return {
		assignee,
		status: fields.status,
		priority: fields.priority,
		schedule: fields.schedule,
		comments,
		activities,
		isUpdatingTask: fields.isUpdatingTask,
		display: {
			currentStatusName,
			priorityName,
			currentPriorityColor,
		},
		attachmentsHook,
		contextTag,
		updateDescription: fields.updateDescription,
	};
}
