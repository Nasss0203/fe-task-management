"use client";

import type { AdminFindAllWorkspaceQuery } from "@/services/admin/workspace/type";
import { findAllWorkspaceManagementApi } from "@/services/admin/workspace/workspace-management.service";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/features/auth/hooks/useUser";
import { isSystemAdmin } from "@/lib/auth/system-role";

export const ADMIN_WORKSPACES_KEY = {
	WORKSPACE_LIST: "ADMIN_WORKSPACE_LIST",
} as const;

export const useAdminWorkspaces = (query?: AdminFindAllWorkspaceQuery) => {
	const { user } = useUser();
	const canAccessAdmin = isSystemAdmin(user);

	const workspaces = useQuery({
		queryKey: [ADMIN_WORKSPACES_KEY.WORKSPACE_LIST, query],
		queryFn: () => findAllWorkspaceManagementApi(query),
		retry: false,
		refetchInterval: 30_000,
		refetchIntervalInBackground: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		enabled: canAccessAdmin,
	});

	return {
		workspaces,
	};
};
