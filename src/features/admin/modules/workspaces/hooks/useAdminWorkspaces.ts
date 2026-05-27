"use client";

import type { AdminFindAllWorkspaceQuery } from "@/services/admin/workspace/type";
import {
	findAllWorkspaceManagementApi,
	updateWorkspacePlanManagementApi,
} from "@/services/admin/workspace/workspace-management.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ADMIN_WORKSPACES_KEY = {
	WORKSPACE_LIST: "ADMIN_WORKSPACE_LIST",
} as const;

export const useAdminWorkspaces = (query?: AdminFindAllWorkspaceQuery) => {
	const queryClient = useQueryClient();

	const workspaces = useQuery({
		queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST, query],
		queryFn: () => findAllWorkspaceManagementApi(query),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const updatePlan = useMutation({
		mutationFn: updateWorkspacePlanManagementApi,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST],
			});
		},
	});

	return {
		workspaces,
		updatePlan,
	};
};
