import { useQuery } from "@tanstack/react-query";

import { workspaceInviteApi } from "../api/workspace-invite.api";

export const workspaceInviteKeys = {
	all: ["workspace-invites"] as const,

	search: (workspaceId: string, query: string) =>
		[...workspaceInviteKeys.all, "search", workspaceId, query] as const,
	pending: (workspaceId: string) =>
		[...workspaceInviteKeys.all, "pending", workspaceId] as const,
};

export function useSearchWorkspaceInviteUsers(
	workspaceId: string,
	query: string,
) {
	const normalizedQuery = query.trim();

	return useQuery({
		queryKey: workspaceInviteKeys.search(workspaceId, normalizedQuery),

		queryFn: () =>
			workspaceInviteApi.searchUsers(workspaceId, normalizedQuery),

		enabled: Boolean(workspaceId) && normalizedQuery.length > 0,

		retry: false,
	});
}

export function usePendingWorkspaceInvites(
	workspaceId: string,
	enabled = true,
) {
	return useQuery({
		queryKey: workspaceInviteKeys.pending(workspaceId),

		queryFn: () => workspaceInviteApi.getPendingInvites(workspaceId),

		enabled: Boolean(workspaceId) && enabled,
	});
}
