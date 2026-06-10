import { SPRINT_KEY } from "@/services/sprint/type";
import { findAllTaskPriorityApi } from "@/services/task-priority/task-priority.serivce";
import { findAllTaskStatusApi } from "@/services/task-status/task-status.service";
import { TaskStatusResponse } from "@/services/task-status/type";
import {
	bulkUpdateTasksApi,
	createTaskApi,
	deleteTaskApi,
	findAllBacklogTaskApi,
	findDeletedTasksApi,
	findAllTaskApi,
	moveTaskSprintToSprintApi,
	moveTaskToSprintApi,
	removeTaskFormSprintApi,
	restoreTaskApi,
	updateTaskApi,
} from "@/services/task/task.service";
import {
	BulkUpdateTasksDto,
	FindAllTaskBacklogResponse,
	FindAllTaskResponse,
	FindBacklogTasksFilters,
	TASK_KEY,
	UpdateTaskDto,
} from "@/services/task/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UpdateTaskInput = Omit<UpdateTaskDto, "id"> & {
	id: string;
	workspaceId?: string;
	projectId?: string;
};

type TaskCacheSnapshot = {
	previousTasks: FindAllTaskResponse | undefined;
	previousBacklog: FindAllTaskBacklogResponse | undefined;
};

export const useUpdateTask = (workspaceId: string, projectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			workspaceId: inputWorkspaceId,
			projectId: inputProjectId,
			...body
		}: UpdateTaskInput) => {
			void inputWorkspaceId;
			void inputProjectId;

			return updateTaskApi(id, body);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
			});
			await queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
			});

			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
			});
		},
	});
};

export const useTask = (
	workspaceId: string,
	projectId: string,
	backlogFilters?: FindBacklogTasksFilters,
	options?: {
		includeTrash?: boolean;
	},
) => {
	const queryClient = useQueryClient();
	const includeTrash = options?.includeTrash === true;
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

	const updateTask = useUpdateTask(workspaceId, projectId);

	const findTaskBacklog = useQuery({
		queryKey: [
			TASK_KEY.TASK_BACKLOG,
			workspaceId,
			projectId,
			backlogFilters,
		],
		queryFn: () =>
			findAllBacklogTaskApi(workspaceId, projectId, backlogFilters),
		enabled: !!workspaceId && !!projectId,
	});

	const deletedTasks = useQuery({
		queryKey: [TASK_KEY.TASK_TRASH, workspaceId, projectId],
		queryFn: () => findDeletedTasksApi({ workspaceId, projectId }),
		enabled: !!workspaceId && includeTrash,
	});

	const deleteTask = useMutation({
		mutationFn: ({ taskId }: { taskId: string }) =>
			deleteTaskApi({
				taskId,
				workspaceId,
			}),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK_TRASH, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
				}),
			]);
		},
	});

	const restoreTask = useMutation({
		mutationFn: ({ taskId }: { taskId: string }) =>
			restoreTaskApi({
				taskId,
				workspaceId,
			}),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK_TRASH, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
				}),
			]);
		},
	});

	const bulkUpdateTasks = useMutation({
		mutationFn: (body: BulkUpdateTasksDto) => {
			if (!workspaceId || !projectId) {
				throw new Error("Missing workspaceId or projectId");
			}

			return bulkUpdateTasksApi({
				workspaceId,
				projectId,
				body,
			});
		},

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId], // ← đổi thành TASK_BACKLOG
			});

			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId], // giữ nguyên cho sprint tasks
			});
		},
	});

	return {
		taskQuery,
		createTask,
		updateTask,
		findTaskBacklog,
		deletedTasks,
		deleteTask,
		restoreTask,
		bulkUpdateTasks,
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
		queryFn: () => findAllTaskPriorityApi(workspaceId!, projectId!),
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
	const cancelAndSnapshot = async (): Promise<TaskCacheSnapshot> => {
		await Promise.all([
			queryClient.cancelQueries({ queryKey: taskKey }),
			queryClient.cancelQueries({ queryKey: backlogKey }),
		]);
		return {
			previousTasks: queryClient.getQueryData<FindAllTaskResponse>(taskKey),
			previousBacklog:
				queryClient.getQueryData<FindAllTaskBacklogResponse>(backlogKey),
		};
	};

	// Helper: rollback khi lỗi
	const rollback = (ctx?: TaskCacheSnapshot) => {
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
			queryClient.setQueryData<FindAllTaskResponse>(taskKey, (old) =>
				old
					? {
							...old,
							data: old.data.map((task) =>
								task.id === taskId
									? { ...task, sprintId }
									: task,
							),
						}
					: old,
			);

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

			queryClient.setQueryData<FindAllTaskResponse>(taskKey, (old) =>
				old
					? {
							...old,
							data: old.data.map((task) =>
								task.id === taskId
									? { ...task, sprintId: null }
									: task,
							),
						}
					: old,
			);

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

			queryClient.setQueryData<FindAllTaskResponse>(taskKey, (old) =>
				old
					? {
							...old,
							data: old.data.map((task) =>
								task.id === taskId
									? { ...task, sprintId: targetSprintId }
									: task,
							),
						}
					: old,
			);

			return ctx;
		},
		onError: (_, __, ctx) => rollback(ctx),
		onSettled: refreshBacklogAndSprints,
	});

	return { taskMoveSprint, removeTaskSprint, taskSprintToSprint };
};
