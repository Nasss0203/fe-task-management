"use client";
import {
	createSprintApi,
	findAllSprintApi,
	findTasksBySprintApi,
} from "@/services/sprint/sprint.service";
import { CreateSprintDto, SPRINT_KEY } from "@/services/sprint/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type UseSprintsParams = {
	workspaceId?: string;
	projectId?: string;
	sprintId?: string;
};

export const useSprints = ({
	workspaceId,
	projectId,
	sprintId,
}: UseSprintsParams) => {
	const queryClient = useQueryClient();

	const sprintsQuery = useQuery({
		queryKey: [SPRINT_KEY.SPRINTS, workspaceId, projectId],
		queryFn: () => findAllSprintApi(workspaceId!, projectId!),
		enabled: Boolean(workspaceId && projectId),
	});

	const sprintsTaskQuery = useQuery({
		queryKey: [SPRINT_KEY.SPRINT, workspaceId, projectId, sprintId],
		queryFn: () =>
			findTasksBySprintApi(workspaceId!, projectId!, sprintId!),
		enabled: Boolean(workspaceId && projectId && sprintId),
	});

	const createSprint = useMutation({
		mutationFn: async (data: CreateSprintDto) => {
			const result = await createSprintApi(data);
			console.log("🚀 ~ result~", result);

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

	return {
		sprintsQuery,
		sprintsTaskQuery,
		createSprint,
	};
};
