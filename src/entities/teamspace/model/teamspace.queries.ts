import { useQuery } from "@tanstack/react-query";

import { teamspaceApi } from "../api/teamspace.api";

export const teamspaceKeys = {
	all: ["teamspaces"] as const,

	workspace: (workspaceId: string) =>
		["teamspaces", "workspace", workspaceId] as const,

	/** Prefix of every query scoped to one teamspace (members, invitations, links). */
	detail: (teamspaceId: string) => ["teamspaces", teamspaceId] as const,

	members: (teamspaceId: string) =>
		["teamspaces", teamspaceId, "members"] as const,

	invitations: (teamspaceId: string) =>
		["teamspaces", teamspaceId, "invitations"] as const,

	inviteLinks: (teamspaceId: string) =>
		["teamspaces", teamspaceId, "invite-links"] as const,

	discover: (workspaceId: string) =>
		["teamspaces", "discover", workspaceId] as const,

	myInvitations: () => ["teamspaces", "invitations", "me"] as const,

	archived: (workspaceId: string) =>
		["teamspaces", "archived", workspaceId] as const,
};

export function useArchivedTeamspaces(workspaceId: string, enabled = true) {
	return useQuery({
		queryKey: teamspaceKeys.archived(workspaceId),

		queryFn: ({ signal }) => teamspaceApi.getArchived(workspaceId, signal),

		enabled: Boolean(workspaceId) && enabled,
	});
}

export function useTeamspaces(workspaceId: string, enabled = true) {
	return useQuery({
		queryKey: teamspaceKeys.workspace(workspaceId),

		queryFn: ({ signal }) =>
			teamspaceApi.getByWorkspace(workspaceId, signal),

		enabled: Boolean(workspaceId) && enabled,
	});
}

export function useTeamspaceMembers(teamspaceId: string, enabled = true) {
	return useQuery({
		queryKey: teamspaceKeys.members(teamspaceId),

		queryFn: ({ signal }) => teamspaceApi.getMembers(teamspaceId, signal),

		enabled: Boolean(teamspaceId) && enabled,
	});
}

export function useTeamspacePendingInvitations(
	teamspaceId: string,
	enabled = true,
) {
	return useQuery({
		queryKey: teamspaceKeys.invitations(teamspaceId),

		queryFn: ({ signal }) =>
			teamspaceApi.getPendingInvitations(teamspaceId, signal),

		enabled: Boolean(teamspaceId) && enabled,
	});
}

export function useTeamspaceInviteLinks(teamspaceId: string, enabled = true) {
	return useQuery({
		queryKey: teamspaceKeys.inviteLinks(teamspaceId),

		queryFn: ({ signal }) => teamspaceApi.getInviteLinks(teamspaceId, signal),

		enabled: Boolean(teamspaceId) && enabled,
	});
}

export function useDiscoverTeamspaces(workspaceId: string, enabled = true) {
	return useQuery({
		queryKey: teamspaceKeys.discover(workspaceId),

		queryFn: ({ signal }) => teamspaceApi.discover(workspaceId, signal),

		enabled: Boolean(workspaceId) && enabled,
	});
}

export function useMyTeamspaceInvitations() {
	return useQuery({
		queryKey: teamspaceKeys.myInvitations(),

		queryFn: ({ signal }) => teamspaceApi.getMyInvitations(signal),
	});
}
