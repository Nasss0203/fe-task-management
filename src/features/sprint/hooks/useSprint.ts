"use client";
import {
	completeSprintApi,
	createSprintApi,
	findAllSprintApi,
	findTasksBySprintApi,
	startSprintApi,
	updateSprintApi,
} from "@/services/sprint/sprint.service";
import {
	CompleteSprintParams,
	CreateSprintDto,
	SPRINT_KEY,
	StartSprintParams,
	UpdateSprintParams,
} from "@/services/sprint/type";
import { TASK_KEY } from "@/services/task/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseSprintsParams = {
	workspaceId?: string;
	projectId?: string;
	sprintId?: string;
	enabled?: boolean;
};

export const useSprints = ({
	workspaceId,
	projectId,
	sprintId,
	enabled = true,
}: UseSprintsParams) => {
	const queryClient = useQueryClient();

	const sprintsQuery = useQuery({
		queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
		queryFn: () => findAllSprintApi(workspaceId!, projectId!),
		enabled: Boolean(enabled && workspaceId && projectId),
	});

	const sprintsTaskQuery = useQuery({
		queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId, sprintId],
		queryFn: () =>
			findTasksBySprintApi(workspaceId!, projectId!, sprintId!),
		enabled: Boolean(enabled && workspaceId && projectId && sprintId),
	});

	const createSprint = useMutation({
		mutationFn: async (data: CreateSprintDto) => {
			const result = await createSprintApi(data);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS],
			});
		},
		onError: (err) => {
			console.error("createWorkspaceApi failed", err);
		},
	});

	const startSprint = useMutation({
		mutationFn: async (data: StartSprintParams) => {
			const result = await startSprintApi(data);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS],
			});
		},
		onError: (err) => {
			console.error("startSprint failed", err);
		},
	});

	const completed = useMutation({
		mutationFn: async (data: CompleteSprintParams) => {
			const result = await completeSprintApi(data);

			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS],
			});
			await queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG],
			});
		},
		onError: (err) => {
			console.error("startSprint failed", err);
		},
	});

	const updateSprint = useMutation({
		mutationFn: async (data: UpdateSprintParams) => {
			const result = await updateSprintApi(data);
			return result;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS],
			});
			await queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG],
			});
		},
		onError: (err) => {
			console.error("updateSprint failed", err);
		},
	});

	return {
		sprintsQuery,
		sprintsTaskQuery,
		createSprint,
		startSprint,
		completed,
		updateSprint,
	};
};
