import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "@/entities/notification/model/notification.keys";

import { workspaceInviteApi } from "../api/workspace-invite.api";

import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";
import type { CreateWorkspaceInvitePayload } from "./workspace-invite.types";

interface InviteWorkspaceMembersVariables {
	workspaceId: string;

	payload: CreateWorkspaceInvitePayload;
}

export function useInviteWorkspaceMembers() {
	return useMutation({
		mutationFn: ({
			workspaceId,
			payload,
		}: InviteWorkspaceMembersVariables) =>
			workspaceInviteApi.invite(workspaceId, payload),
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
