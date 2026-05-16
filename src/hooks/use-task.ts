import { SPRINT_KEY } from "@/services/sprint/type";
import { findAllTaskStatusApi } from "@/services/task-status/task-status.service";
import { TaskStatusResponse } from "@/services/task-status/type";
import {
	createTaskApi,
	findAllBacklogTaskApi,
	findAllTaskApi,
	moveTaskSprintToSprintApi,
	moveTaskToSprintApi,
	removeTaskFormSprintApi,
	updateTaskApi,
} from "@/services/task/task.service";
import { TASK_KEY } from "@/services/task/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
type UpdateTaskInput = {
	id: string;
	statusId?: string;
	position?: number;
};

export const useTask = (workspaceId: string, projectId: string) => {
	const queryClient = useQueryClient();
	const taskQuery = useQuery({
		queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
		queryFn: () => findAllTaskApi(workspaceId, projectId),
		enabled: !!workspaceId && !!projectId,
	});

	const { mutateAsync: createTask } = useMutation({
		mutationFn: createTaskApi,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [
					TASK_KEY.TASKS,
					variables.workspaceId,
					variables.projectId,
				],
			});
		},
		onError: (err) => {
			console.error("createTaskApi failed", err);
		},
	});

	const updateTask = useMutation({
		mutationFn: ({ id, ...body }: any) => updateTaskApi(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
			});
		},
	});

	const findTaskBacklog = useQuery({
		queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
		queryFn: () => findAllBacklogTaskApi(workspaceId, projectId),
		enabled: !!workspaceId && !!projectId,
	});

	return {
		taskQuery,
		createTask,
		updateTask,
		findTaskBacklog,
	};
};

export const useTaskStatus = (workspaceId?: string, projectId?: string) => {
	return useQuery<TaskStatusResponse>({
		queryKey: ["task-status", workspaceId, projectId],
		queryFn: () => findAllTaskStatusApi(workspaceId!, projectId!),
		enabled: !!workspaceId && !!projectId,
	});
};

export const useTaskPriority = (workspaceId?: string, projectId?: string) => {
	return useQuery<TaskStatusResponse>({
		queryKey: ["task-priority", workspaceId, projectId],
		queryFn: () => findAllTaskStatusApi(workspaceId!, projectId!),
		enabled: !!workspaceId && !!projectId,
	});
};

export const useTaskMoveSprint = ({
	workspaceId,
	projectId,
}: {
	workspaceId: string;
	projectId: string;
}) => {
	const queryClient = useQueryClient();

	const taskKey = [TASK_KEY.TASKS, workspaceId, projectId];
	const backlogKey = [TASK_KEY.TASK_BACKLOG, workspaceId, projectId];

	const refreshBacklogAndSprints = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
				refetchType: "active",
			}),
			queryClient.invalidateQueries({
				queryKey: taskKey,
				refetchType: "active",
			}),
			queryClient.invalidateQueries({
				queryKey: backlogKey,
				refetchType: "active",
			}),
		]);
	};

	// Helper: cancel inflight queries + lấy snapshot
	const cancelAndSnapshot = async () => {
		await Promise.all([
			queryClient.cancelQueries({ queryKey: taskKey }),
			queryClient.cancelQueries({ queryKey: backlogKey }),
		]);
		return {
			previousTasks: queryClient.getQueryData(taskKey),
			previousBacklog: queryClient.getQueryData(backlogKey),
		};
	};

	// Helper: rollback khi lỗi
	const rollback = (ctx: any) => {
		if (ctx?.previousTasks)
			queryClient.setQueryData(taskKey, ctx.previousTasks);
		if (ctx?.previousBacklog)
			queryClient.setQueryData(backlogKey, ctx.previousBacklog);
	};

	const taskMoveSprint = useMutation({
		mutationFn: ({
			taskId,
			sprintId,
		}: {
			taskId: string;
			sprintId: string | null;
		}) => moveTaskToSprintApi({ taskId, sprintId }),

		onMutate: async ({ taskId, sprintId }) => {
			const ctx = await cancelAndSnapshot();

			// Cập nhật cache ngay → initialItems không bị stale → không snap back
			queryClient.setQueryData(taskKey, (old: any) => ({
				...old,
				data: old?.data?.map((task: any) =>
					task.id === taskId ? { ...task, sprintId } : task,
				),
			}));

			return ctx;
		},
		onError: (_, __, ctx) => rollback(ctx),
		onSettled: refreshBacklogAndSprints,
	});

	const removeTaskSprint = useMutation({
		mutationFn: ({ taskId }: { taskId: string }) =>
			removeTaskFormSprintApi({ taskId }),

		onMutate: async ({ taskId }) => {
			const ctx = await cancelAndSnapshot();

			queryClient.setQueryData(taskKey, (old: any) => ({
				...old,
				data: old?.data?.map((task: any) =>
					task.id === taskId ? { ...task, sprintId: null } : task,
				),
			}));

			return ctx;
		},
		onError: (_, __, ctx) => rollback(ctx),
		onSettled: refreshBacklogAndSprints,
	});

	const taskSprintToSprint = useMutation({
		mutationFn: ({
			taskId,
			sourceSprintId,
			targetSprintId,
		}: {
			taskId: string;
			sourceSprintId: string;
			targetSprintId: string;
		}) =>
			moveTaskSprintToSprintApi({
				taskId,
				projectId,
				workspaceId,
				sourceSprintId,
				targetSprintId,
			}),

		onMutate: async ({ taskId, targetSprintId }) => {
			const ctx = await cancelAndSnapshot();

			queryClient.setQueryData(taskKey, (old: any) => ({
				...old,
				data: old?.data?.map((task: any) =>
					task.id === taskId
						? { ...task, sprintId: targetSprintId }
						: task,
				),
			}));

			return ctx;
		},
		onError: (_, __, ctx) => rollback(ctx),
		onSettled: refreshBacklogAndSprints,
	});

	return { taskMoveSprint, removeTaskSprint, taskSprintToSprint };
};
