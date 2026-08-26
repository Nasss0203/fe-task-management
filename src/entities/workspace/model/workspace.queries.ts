import { useQuery } from "@tanstack/react-query";

import { workspaceApi } from "../api/workspace.api";

export const workspaceKeys = {
	all: ["workspaces"] as const,

	detail: (workspaceId: string) => ["workspaces", workspaceId] as const,

	access: (workspaceId: string) =>
		["workspaces", workspaceId, "access"] as const,
};

export function useWorkspaces() {
	return useQuery({
		queryKey: workspaceKeys.all,
		queryFn: ({ signal }) => workspaceApi.getAll(signal),
	});
}

export function useWorkspace(workspaceId: string) {
	return useQuery({
		queryKey: workspaceKeys.detail(workspaceId),
		queryFn: ({ signal }) => workspaceApi.getById(workspaceId, signal),
		enabled: Boolean(workspaceId),
	});
}

export function useWorkspaceAccess(workspaceId: string) {
	return useQuery({
		queryKey: workspaceKeys.access(workspaceId),
		queryFn: ({ signal }) => workspaceApi.getAccess(workspaceId, signal),
		enabled: Boolean(workspaceId),
	});
}
