import { findAllTaskApiStatusApi } from "@/services/task-status/task-status.service";
import { TaskStatusResponse } from "@/services/task-status/type";
import {
	createTaskApi,
	findAllTaskApi,
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

	const createTask = useMutation({
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
		mutationFn: ({ id, ...body }: UpdateTaskInput) =>
			updateTaskApi(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["tasks", workspaceId, projectId],
			});
		},
	});

	return {
		taskQuery,
		createTask,
		updateTask,
	};
};

export const useTaskStatus = (workspaceId?: string, projectId?: string) => {
	return useQuery<TaskStatusResponse>({
		queryKey: ["task-status", workspaceId, projectId],
		queryFn: () => findAllTaskApiStatusApi(workspaceId!, projectId!),
		enabled: !!workspaceId && !!projectId,
	});
};
