import { useMemo } from "react";
import { SPRINT_KEY } from "@/services/sprint/type";
import { findAllTaskPriorityApi } from "@/services/task-priority/task-priority.serivce";
import { findAllTaskStatusApi } from "@/services/task-status/task-status.service";
import { TaskStatusResponse } from "@/services/task-status/type";
import {
	bulkUpdateTasksApi,
	createSubtaskApi,
	createTaskApi,
	deleteTaskApi,
	findAllBacklogTaskApi,
	findDeletedTasksApi,
	findAllTaskApi,
	findOneTaskApi,
	moveTaskSprintToSprintApi,
	moveTaskToSprintApi,
	reorderTaskPositionApi,
	removeTaskFormSprintApi,
	restoreTaskApi,
	updateTaskApi,
} from "@/services/task/task.service";
import {
	BulkUpdateTasksDto,
	CreateSubtaskDto,
	FindAllTaskBacklogResponse,
	FindAllTaskResponse,
	FindBacklogTasksFilters,
	FindOneTaskResponse,
	ReorderTaskPositionDto,
	TASK_KEY,
	TaskItem,
	UpdateTaskDto,
} from "@/services/task/type";
import {
	QueryKey,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useTaskFilterStore } from "@/stores/use-task-filter";

type UpdateTaskInput = Omit<UpdateTaskDto, "id"> & {
	id: string;
	workspaceId?: string;
	projectId?: string;
};

type ReorderTaskPositionInput = ReorderTaskPositionDto & {
	workspaceId?: string;
	projectId?: string;
};

type CreateSubtaskInput = CreateSubtaskDto & {
	parentTaskId: string;
	workspaceId?: string;
	projectId?: string;
};

type TaskCacheSnapshot = {
	previousTasks: FindAllTaskResponse | undefined;
	previousBacklog: FindAllTaskBacklogResponse | undefined;
};

type UpdateTaskCacheSnapshot = {
	previousDetail: FindOneTaskResponse | undefined;
	previousTaskQueries: [QueryKey, FindAllTaskResponse | undefined][];
	previousBacklogQueries: [
		QueryKey,
		FindAllTaskBacklogResponse | undefined,
	][];
};

const getTaskUpdatePatch = ({
	id: _id,
	workspaceId: _workspaceId,
	projectId: _projectId,
	position: _position,
	assigneeIds: _assigneeIds,
	...patch
}: UpdateTaskInput): Partial<TaskItem> => {
	void _id;
	void _workspaceId;
	void _projectId;
	void _position;
	void _assigneeIds;

	return patch;
};

const updateTaskInPage = <
	TPage extends FindAllTaskResponse | FindAllTaskBacklogResponse,
>(
	page: TPage | undefined,
	taskId: string,
	patch: Partial<TaskItem>,
) => {
	if (!page) return page;

	return {
		...page,
		data: page.data.map((task) =>
			task.id === taskId ? { ...task, ...patch } : task,
		),
	};
};

const findTaskInPages = <
	TPage extends FindAllTaskResponse | FindAllTaskBacklogResponse,
>(
	queries: [QueryKey, TPage | undefined][],
	taskId: string,
) => {
	for (const [, page] of queries) {
		const task = page?.data.find((item) => item.id === taskId);

		if (task) return task;
	}

	return undefined;
};

export const useTaskDetailQuery = (taskId?: string) => {
	return useQuery({
		queryKey: [TASK_KEY.TASK, taskId],
		queryFn: () => findOneTaskApi(taskId!),
		enabled: !!taskId,
	});
};

export const useCreateSubtask = ({
	workspaceId,
	projectId,
}: {
	workspaceId: string;
	projectId: string;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			parentTaskId,
			workspaceId: _workspaceId,
			projectId: _projectId,
			...data
		}: CreateSubtaskInput) => {
			void _workspaceId;
			void _projectId;

			return createSubtaskApi({
				parentTaskId,
				data,
			});
		},
		onSuccess: (response, variables) => {
			const createdSubtask = response.data;

			queryClient.setQueryData(
				[TASK_KEY.TASK, variables.parentTaskId],
				(old: Awaited<ReturnType<typeof findOneTaskApi>> | undefined) =>
					old
						? {
								...old,
								data: {
									...old.data,
									subtasks: [
										...(old.data.subtasks ?? []),
										createdSubtask,
									],
								},
							}
						: old,
			);

			void Promise.all([
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK, variables.parentTaskId],
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
				}),
			]);
		},
	});
};

export const useUpdateTask = (
	workspaceId: string,
	projectId: string,
	options?: {
		refetchOnSuccess?: boolean;
	},
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			workspaceId: inputWorkspaceId,
			projectId: inputProjectId,
			position: _position, // Strip position since backend doesn't support it yet
			...body
		}: UpdateTaskInput) => {
			void inputWorkspaceId;
			void inputProjectId;
			void _position;

			return updateTaskApi(id, body);
		},
		onMutate: async (variables): Promise<UpdateTaskCacheSnapshot> => {
			const detailKey = [TASK_KEY.TASK, variables.id];
			const taskListKey = [TASK_KEY.TASKS, workspaceId, projectId];
			const backlogKey = [TASK_KEY.TASK_BACKLOG, workspaceId, projectId];

			await Promise.all([
				queryClient.cancelQueries({ queryKey: detailKey }),
				queryClient.cancelQueries({ queryKey: taskListKey }),
				queryClient.cancelQueries({ queryKey: backlogKey }),
			]);

			const snapshot: UpdateTaskCacheSnapshot = {
				previousDetail:
					queryClient.getQueryData<FindOneTaskResponse>(detailKey),
				previousTaskQueries:
					queryClient.getQueriesData<FindAllTaskResponse>({
						queryKey: taskListKey,
					}),
				previousBacklogQueries:
					queryClient.getQueriesData<FindAllTaskBacklogResponse>({
						queryKey: backlogKey,
					}),
			};

			const patch = getTaskUpdatePatch(variables);
			const fallbackTask =
				snapshot.previousDetail?.data ??
				findTaskInPages(snapshot.previousTaskQueries, variables.id) ??
				findTaskInPages(snapshot.previousBacklogQueries, variables.id);

			queryClient.setQueryData<FindOneTaskResponse>(
				detailKey,
				(old) =>
					old
						? {
								...old,
								data: {
									...old.data,
									...patch,
								},
							}
						: fallbackTask
							? {
									data: {
										...fallbackTask,
										...patch,
									},
								}
							: old,
			);

			queryClient.setQueriesData<FindAllTaskResponse>(
				{ queryKey: taskListKey },
				(old) => updateTaskInPage(old, variables.id, patch),
			);

			queryClient.setQueriesData<FindAllTaskBacklogResponse>(
				{ queryKey: backlogKey },
				(old) => updateTaskInPage(old, variables.id, patch),
			);

			return snapshot;
		},
		onError: (_error, _variables, context) => {
			if (!context) return;

			queryClient.setQueryData(
				[TASK_KEY.TASK, _variables.id],
				context.previousDetail,
			);

			context.previousTaskQueries.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data);
			});

			context.previousBacklogQueries.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data);
			});
		},
		onSuccess: (response, variables) => {
			const updatedTask = response.data;
			const detailKey = [TASK_KEY.TASK, variables.id];
			const taskListKey = [TASK_KEY.TASKS, workspaceId, projectId];
			const backlogKey = [TASK_KEY.TASK_BACKLOG, workspaceId, projectId];
			const refetchType =
				options?.refetchOnSuccess === false ? "none" : "active";

			queryClient.setQueryData<FindOneTaskResponse>(
				detailKey,
				(old) =>
					old
						? {
								...old,
								data: {
									...old.data,
									...updatedTask,
								},
							}
						: response,
			);

			queryClient.setQueriesData<FindAllTaskResponse>(
				{ queryKey: taskListKey },
				(old) => updateTaskInPage(old, variables.id, updatedTask),
			);

			queryClient.setQueriesData<FindAllTaskBacklogResponse>(
				{ queryKey: backlogKey },
				(old) => updateTaskInPage(old, variables.id, updatedTask),
			);

			void Promise.all([
				queryClient.invalidateQueries({
					queryKey: detailKey,
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: taskListKey,
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: backlogKey,
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
					refetchType,
				}),
			]);
		},
	});
};

export const useDeleteTask = (workspaceId: string, projectId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
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
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
				}),
			]);
		},
	});
};

export const useTask = (
	workspaceId: string,
	projectId: string,
	filtersProp?: FindBacklogTasksFilters,
	options?: {
		includeTrash?: boolean;
	},
) => {
	const queryClient = useQueryClient();
	const filtersByProject = useTaskFilterStore((state) => state.filtersByProject);

	const activeFilters = useMemo(() => {
		const globalFilters = filtersByProject[projectId] || {};

		return {
			...globalFilters,
			...filtersProp,
		};
	}, [filtersByProject, filtersProp, projectId]);

	const includeTrash = options?.includeTrash === true;
	const taskQuery = useQuery({
		queryKey: [TASK_KEY.TASKS, workspaceId, projectId, activeFilters],
		queryFn: () => findAllTaskApi(workspaceId, projectId, activeFilters),
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
			queryClient.invalidateQueries({
				queryKey: [
					TASK_KEY.TASK_BACKLOG,
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
			activeFilters,
		],
		queryFn: () =>
			findAllBacklogTaskApi(workspaceId, projectId, activeFilters),
		enabled: !!workspaceId && !!projectId,
	});

	const deletedTasks = useQuery({
		queryKey: [TASK_KEY.TASK_TRASH, workspaceId, projectId],
		queryFn: () => findDeletedTasksApi({ workspaceId, projectId }),
		enabled: !!workspaceId && includeTrash,
	});

	const deleteTask = useDeleteTask(workspaceId, projectId);

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
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
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
				queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
			});

			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
			});
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
			});
		},
	});

	const bulkMoveToSprint = useMutation({
		mutationFn: async ({ taskIds, sprintId }: { taskIds: string[]; sprintId: string }) => {
			if (!workspaceId || !projectId) {
				throw new Error("Missing workspaceId or projectId");
			}
			await Promise.all(
				taskIds.map((taskId) =>
					moveTaskToSprintApi({
						taskId,
						sprintId,
					})
				)
			);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
			});
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
			});
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
			});
		},
	});

	return {
		taskQuery,
		createTask,
		updateTask,
		findTaskBacklog,
		deletedTasks,
		bulkMoveToSprint,
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

export const useReorderTaskPosition = ({
	workspaceId,
	projectId,
	refetchOnSuccess = true,
}: {
	workspaceId: string;
	projectId: string;
	refetchOnSuccess?: boolean;
}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			workspaceId: _workspaceId,
			projectId: _projectId,
			...body
		}: ReorderTaskPositionInput) => {
			void _workspaceId;
			void _projectId;

			return reorderTaskPositionApi(body);
		},
		onSuccess: async () => {
			const refetchType = refetchOnSuccess ? "active" : "none";

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASKS, workspaceId, projectId],
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: [TASK_KEY.TASK_BACKLOG, workspaceId, projectId],
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
					refetchType,
				}),
				queryClient.invalidateQueries({
					queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
					refetchType,
				}),
			]);
		},
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
				queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId],
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
