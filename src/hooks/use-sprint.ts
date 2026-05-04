"use client";
import {
	findAllSprintApi,
	findTasksBySprintApi,
} from "@/services/sprint/sprint.service";
import { SPRINT_KEY } from "@/services/sprint/type";
import { useQuery } from "@tanstack/react-query";

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

	return {
		sprintsQuery,
		sprintsTaskQuery,
	};
};
