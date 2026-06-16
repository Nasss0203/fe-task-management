"use client";

import { normalizeText, parseDate } from "@/components/drawer/task-detail/task-detail-utils";
import { useTask, useTaskPriority, useTaskStatus } from "@/features/task/hooks/useTask";
import type { TaskStatusItem } from "@/services/task-status/type";
import type { TaskItem } from "@/services/task/type";
import * as React from "react";

type TaskDateRange = {
	from?: Date;
	to?: Date;
};

export function useTaskDetailFields(task: TaskItem) {
	const taskStatusQuery = useTaskStatus(task.workspaceId, task.projectId);
	const taskPriorityQuery = useTaskPriority(task.workspaceId, task.projectId);
	const {
		updateTask: {
			mutateAsync: updateTaskMutate,
			isPending: isUpdatingTask,
		},
	} = useTask(task.workspaceId, task.projectId);
	const [scheduleOpen, setScheduleOpen] = React.useState(false);
	const [statusOpen, setStatusOpen] = React.useState(false);
	const [priorityOpen, setPriorityOpen] = React.useState(false);
	const [startDate, setStartDate] = React.useState<Date | undefined>(() =>
		parseDate(task.startAt),
	);
	const [dueDate, setDueDate] = React.useState<Date | undefined>(() =>
		parseDate(task.dueAt),
	);
	const [selectedStatusId, setSelectedStatusId] = React.useState(task.statusId);
	const [selectedPriorityId, setSelectedPriorityId] = React.useState<
		string | null
	>(task.priorityId);

	React.useEffect(() => {
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

	const currentStatus = React.useMemo(() => {
		return (
			statuses.find((status) => status.id === selectedStatusId) ??
			statuses.find(
				(status) =>
					normalizeText(status.name) === normalizeText(task.statusName),
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

	const handleScheduleSelect = async (selectedRange?: TaskDateRange) => {
		const previousStartDate = startDate;
		const previousDueDate = dueDate;
		const nextStartDate = selectedRange?.from;
		const nextDueDate = selectedRange?.to;

		setStartDate(nextStartDate);
		setDueDate(nextDueDate);

		try {
			await updateTaskMutate({
				id: task.id,
				startAt: nextStartDate ? nextStartDate.toISOString() : null,
				dueAt: nextDueDate ? nextDueDate.toISOString() : null,
			});
		} catch {
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
		} catch {
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
		} catch {
			setSelectedPriorityId(previousPriorityId);
		}
	};

	const handleDescriptionChange = async (description: string) => {
		try {
			await updateTaskMutate({
				id: task.id,
				description,
			});
		} catch (error) {
			console.error("Failed to update task description", error);
		}
	};

	return {
		isUpdatingTask,
		updateDescription: handleDescriptionChange,
		status: {
			open: statusOpen,
			onOpenChange: setStatusOpen,
			options: statuses,
			selectedId: selectedStatusId,
			current: currentStatus,
			onSelect: handleStatusSelect,
		},
		priority: {
			open: priorityOpen,
			onOpenChange: setPriorityOpen,
			options: priorities,
			selectedId: selectedPriorityId,
			current: currentPriority,
			onSelect: handlePrioritySelect,
		},
		schedule: {
			open: scheduleOpen,
			onOpenChange: setScheduleOpen,
			startDate,
			dueDate,
			onSelect: handleScheduleSelect,
		},
	};
}
