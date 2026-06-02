"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	findWorkspaceFeaturesApi,
	updateWorkspaceFeatureApi,
} from "@/services/workspace-feature/workspace-feature.service";
import {
	FeatureKey,
	WORKSPACE_FEATURE_KEY,
} from "@/services/workspace-feature/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";

export const useWorkspaceFeatures = (workspaceId?: string) => {
	const queryClient = useQueryClient();
	const currentWorkspaceId = useProjectSelectionStore(
		(state) => state.currentWorkspaceId,
	);
	const resolvedWorkspaceId = workspaceId || currentWorkspaceId || undefined;

	const workspaceFeaturesQuery = useQuery({
		queryKey: [WORKSPACE_FEATURE_KEY.WORKSPACE_FEATURES, resolvedWorkspaceId],
		queryFn: () => findWorkspaceFeaturesApi(resolvedWorkspaceId!),
		enabled: Boolean(resolvedWorkspaceId),
	});

	const features = workspaceFeaturesQuery.data?.data ?? [];
	const sprintFeature = features.find(
		(feature) =>
			feature.code.toLowerCase() === FeatureKey.SPRINT_ENABLED,
	);
	const canUseSprint = sprintFeature?.enabled === true;
	const shouldShowSprintFeature =
		Boolean(resolvedWorkspaceId) &&
		(workspaceFeaturesQuery.isPending ||
			workspaceFeaturesQuery.isError ||
			canUseSprint);

	const updateWorkspaceFeature = useMutation({
		mutationFn: updateWorkspaceFeatureApi,
		onSuccess: async (_, variables) => {
			await queryClient.invalidateQueries({
				queryKey: [
					WORKSPACE_FEATURE_KEY.WORKSPACE_FEATURES,
					variables.workspaceId,
				],
			});
		},
		onError: (error) => {
			console.error("updateWorkspaceFeature failed", error);
		},
	});

	return {
		workspaceFeaturesQuery,
		updateWorkspaceFeature,
		workspaceId: resolvedWorkspaceId,
		features,
		canUseSprint,
		shouldShowSprintFeature,
	};
};
