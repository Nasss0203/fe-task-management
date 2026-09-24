import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "@/entities/notification/model/notification.keys";

import { workspaceInviteApi } from "../api/workspace-invite.api";

import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";
import { workspaceInviteKeys } from "./workspace-invite.queries";
import type { CreateWorkspaceInvitePayload } from "./workspace-invite.types";

interface InviteWorkspaceMembersVariables {
	workspaceId: string;

	payload: CreateWorkspaceInvitePayload;
}

export function useInviteWorkspaceMembers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			workspaceId,
			payload,
		}: InviteWorkspaceMembersVariables) =>
			workspaceInviteApi.invite(workspaceId, payload),

		onSuccess: async (_data, { workspaceId }) => {
			await queryClient.invalidateQueries({
				queryKey: workspaceInviteKeys.pending(workspaceId),
			});
		},
	});
}

interface ManageWorkspaceInviteVariables {
	workspaceId: string;
	inviteId: string;
}

export function useResendWorkspaceInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workspaceId, inviteId }: ManageWorkspaceInviteVariables) =>
			workspaceInviteApi.resend(workspaceId, inviteId),

		onSuccess: async (_data, { workspaceId }) => {
			await queryClient.invalidateQueries({
				queryKey: workspaceInviteKeys.pending(workspaceId),
			});
		},
	});
}

export function useRevokeWorkspaceInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workspaceId, inviteId }: ManageWorkspaceInviteVariables) =>
			workspaceInviteApi.revoke(workspaceId, inviteId),

		onSuccess: async (_data, { workspaceId }) => {
			await queryClient.invalidateQueries({
				queryKey: workspaceInviteKeys.pending(workspaceId),
			});
		},
	});
}

interface WorkspaceInviteActionVariables {
	token: string;
}

export function useAcceptWorkspaceInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token }: WorkspaceInviteActionVariables) =>
			workspaceInviteApi.accept(token),

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: notificationKeys.all,
				}),

				queryClient.invalidateQueries({
					queryKey: workspaceKeys.all,
				}),
			]);
		},
	});
}
export function useDeclineWorkspaceInvite() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ token }: WorkspaceInviteActionVariables) =>
			workspaceInviteApi.decline(token),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: notificationKeys.all,
			});
		},
	});
}
