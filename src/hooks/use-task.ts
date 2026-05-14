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

	const refreshBacklogAndSprints = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
				refetchType: "active",
			}),

			queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
				refetchType: "active",
			}),

			queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
				refetchType: "active",
			}),
		]);
	};

	const taskMoveSprint = useMutation({
		mutationFn: ({
			taskId,
			sprintId,
		}: {
			taskId: string;
			sprintId: string | null;
		}) => moveTaskToSprintApi({ taskId, sprintId }),

		onSuccess: refreshBacklogAndSprints,
	});

	const removeTaskSprint = useMutation({
		mutationFn: ({ taskId }: { taskId: string }) =>
			removeTaskFormSprintApi({ taskId }),

		onSuccess: refreshBacklogAndSprints,
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

		onSuccess: refreshBacklogAndSprints,
	});

	return {
		taskMoveSprint,
		removeTaskSprint,
		taskSprintToSprint,
	};
};
