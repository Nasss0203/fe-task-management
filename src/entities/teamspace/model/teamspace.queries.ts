import { useQuery } from "@tanstack/react-query";

import { teamspaceApi } from "../api/teamspace.api";

export const teamspaceKeys = {
	all: ["teamspaces"] as const,

	workspace: (workspaceId: string) =>
		["teamspaces", "workspace", workspaceId] as const,

	members: (teamspaceId: string) =>
		["teamspaces", teamspaceId, "members"] as const,
};

export function useTeamspaces(workspaceId: string) {
	return useQuery({
		queryKey: teamspaceKeys.workspace(workspaceId),

		queryFn: ({ signal }) =>
			teamspaceApi.getByWorkspace(workspaceId, signal),

		enabled: Boolean(workspaceId),
	});
}

export function useTeamspaceMembers(teamspaceId: string) {
	return useQuery({
		queryKey: teamspaceKeys.members(teamspaceId),

		queryFn: ({ signal }) => teamspaceApi.getMembers(teamspaceId, signal),

		enabled: Boolean(teamspaceId),
	});
}
