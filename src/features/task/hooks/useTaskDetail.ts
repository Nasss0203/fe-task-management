"use client";

import { buildAttachmentFallback } from "@/components/drawer/task-detail/task-detail-utils";
import { useUser } from "@/hooks/use-user";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";
import { useTaskDetailAssignees } from "./useTaskDetailAssignees";
import { useTaskDetailComments } from "./useTaskDetailComments";
import { useTaskDetailFields } from "./useTaskDetailFields";

export function useTaskDetail(task: TaskItem) {
	const { user } = useUser();
	const fields = useTaskDetailFields(task);
	const assignee = useTaskDetailAssignees(task, user);
	const comments = useTaskDetailComments(task, user);

	const currentStatusName =
		fields.status.current?.name ?? task.statusName ?? "No status";
	const currentStatusColor = fields.status.current?.color ?? "#6366F1";
	const priorityName =
		fields.priority.current?.name ?? task.priorityName ?? "No priority";
	const currentPriorityColor = fields.priority.current?.color ?? "#71717A";
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

	return {
		assignee,
		status: fields.status,
		priority: fields.priority,
		schedule: fields.schedule,
		comments,
		isUpdatingTask: fields.isUpdatingTask,
		display: {
			currentStatusName,
			currentStatusColor,
			priorityName,
			currentPriorityColor,
		},
		attachments,
		contextTag,
	};
}
