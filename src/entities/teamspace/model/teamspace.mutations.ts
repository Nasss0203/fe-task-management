import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teamspaceApi } from "../api/teamspace.api";
import { teamspaceKeys } from "./teamspace.queries";

import type {
	CreateTeamspaceInput,
	CreateTeamspaceInviteLinkInput,
	TeamspaceRole,
	TeamspaceVisibility,
	UpdateTeamspacePayload,
} from "./teamspace.types";

export function useCreateTeamspace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTeamspaceInput) => teamspaceApi.create(input),

		onSuccess: (teamspace) => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.workspace(teamspace.workspaceId),
			});
		},
	});
}

export function useAcceptTeamspaceInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) =>
			teamspaceApi.acceptInvitation(invitationId),

		// Refresh on failure too: the invitation may have expired or been revoked.
		onSettled: () => {
			// Covers the invitation list and the sidebar's teamspace lists.
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.all,
			});
		},
	});
}

export function useDeclineTeamspaceInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) =>
			teamspaceApi.declineInvitation(invitationId),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.myInvitations(),
			});
		},
	});
}

/*
 * Management mutations refresh on failure too (onSettled): a 409/403 usually
 * means the cached state is stale (member already removed, link already revoked).
 */

export function useUpdateTeamspaceMemberRole(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { memberId: string; roleName: TeamspaceRole }) =>
			teamspaceApi.updateMemberRole(
				teamspaceId,
				input.memberId,
				input.roleName,
			),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.members(teamspaceId),
			});
		},
	});
}

export function useRemoveTeamspaceMember(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (memberId: string) =>
			teamspaceApi.removeMember(teamspaceId, memberId),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.members(teamspaceId),
			});
		},
	});
}

export function useLeaveTeamspace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (teamspaceId: string) => teamspaceApi.leave(teamspaceId),

		onSettled: () => {
			// Sidebar list, discover list and the teamspace's own queries.
			queryClient.invalidateQueries({ queryKey: teamspaceKeys.all });
		},
	});
}

export function useInviteTeamspaceMember(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (workspaceMemberId: string) =>
			teamspaceApi.inviteMember(teamspaceId, workspaceMemberId),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.invitations(teamspaceId),
			});
		},
	});
}

export function useRevokeTeamspaceInvitation(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) =>
			teamspaceApi.revokeInvitation(invitationId),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.invitations(teamspaceId),
			});
		},
	});
}

export function useResendTeamspaceInvitation(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (invitationId: string) =>
			teamspaceApi.resendInvitation(invitationId),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.invitations(teamspaceId),
			});
		},
	});
}

export function useCreateTeamspaceInviteLink(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateTeamspaceInviteLinkInput) =>
			teamspaceApi.createInviteLink(teamspaceId, input),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.inviteLinks(teamspaceId),
			});
		},
	});
}

export function useRevokeTeamspaceInviteLink(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (linkId: string) =>
			teamspaceApi.revokeInviteLink(teamspaceId, linkId),

		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: teamspaceKeys.inviteLinks(teamspaceId),
			});
		},
	});
}

export function useJoinTeamspaceByLink() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (token: string) => teamspaceApi.joinByLink(token),

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: teamspaceKeys.all });
		},
	});
}

export function useJoinTeamspace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (teamspaceId: string) => teamspaceApi.join(teamspaceId),

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: teamspaceKeys.all });
		},
	});
}

export function useUpdateTeamspaceJoinSettings(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (visibility: TeamspaceVisibility) =>
			teamspaceApi.updateJoinSettings(teamspaceId, visibility),

		onSettled: () => {
			// Visibility shows in the sidebar list and the discover list.
			queryClient.invalidateQueries({ queryKey: teamspaceKeys.all });
		},
	});
}

export function useUpdateTeamspace(teamspaceId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: UpdateTeamspacePayload) =>
			teamspaceApi.update(teamspaceId, body),

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: teamspaceKeys.all });
		},
	});
}
