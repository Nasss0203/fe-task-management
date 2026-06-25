"use client";
import { toast } from "sonner";
import {
	completeSprintApi,
	createSprintApi,
	findAllSprintApi,
	findTasksBySprintApi,
	startSprintApi,
	updateSprintApi,
	cancelSprintApi,
	deleteSprintApi,
} from "@/services/sprint/sprint.service";
import {
	CompleteSprintParams,
	CancelSprintParams,
	CreateSprintDto,
	DeleteSprintParams,
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
		onError: (err: any) => {
			console.error("createSprint failed", err);
			toast.error(err?.response?.data?.message || "Failed to create sprint");
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
		onError: (err: any) => {
			console.error("startSprint failed", err);
			toast.error(err?.response?.data?.message || "Failed to start sprint");
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
		onError: (err: any) => {
			console.error("completedSprint failed", err);
			toast.error(err?.response?.data?.message || "Failed to complete sprint");
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
		onError: (err: any) => {
			console.error("updateSprint failed", err);
			toast.error(err?.response?.data?.message || "Failed to update sprint");
		},
	});

	const deleteSprint = useMutation({
		mutationFn: async (data: DeleteSprintParams) => {
			const result = await deleteSprintApi(data);
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
		onError: (err: any) => {
			console.error("deleteSprint failed", err);
			toast.error(err?.response?.data?.message || "Failed to delete sprint");
		},
	});

	const cancelSprint = useMutation({
		mutationFn: async (data: CancelSprintParams) => {
			const result = await cancelSprintApi(data);
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
		onError: (err: any) => {
			console.error("cancelSprint failed", err);
			toast.error(err?.response?.data?.message || "Failed to cancel sprint");
		},
	});

	return {
		sprintsQuery,
		sprintsTaskQuery,
		createSprint,
		startSprint,
		completed,
		updateSprint,
		deleteSprint,
		cancelSprint,
	};
};
