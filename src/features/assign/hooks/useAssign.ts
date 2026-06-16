"use client";

import { SPRINT_KEY } from "@/services/sprint/type";
import { assignService } from "@/services/assign/assign.service";
import type { AssignInput } from "@/services/assign/type";
import { TASK_KEY } from "@/services/task/type";
import { WORKSPACE_OVERVIEW_KEY } from "@/features/workspace/hooks/useWorkspaceOverview";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ASSIGN_QUERY_KEYS } from "../constants";

export function useAssign(taskId: string) {
	const queryClient = useQueryClient();
	const queryKey = ASSIGN_QUERY_KEYS.byTask(taskId);
	const invalidateRelatedQueries = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey }),
			queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASKS],
			}),
			queryClient.invalidateQueries({
				queryKey: [TASK_KEY.TASK_BACKLOG],
			}),
			queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINTS],
			}),
			queryClient.invalidateQueries({
				queryKey: [SPRINT_KEY.SPRINT],
			}),
			queryClient.invalidateQueries({
				queryKey: [WORKSPACE_OVERVIEW_KEY],
			}),
		]);
	};

	const assign = useMutation({
		mutationFn: (input: AssignInput) => assignService.assign(input),
		onSuccess: invalidateRelatedQueries,
	});

	const unassign = useMutation({
		mutationFn: (userId: string) => assignService.unassign(taskId, userId),
		onSuccess: invalidateRelatedQueries,
	});

	return { assign, unassign };
}
