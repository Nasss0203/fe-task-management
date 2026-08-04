import { CreateWorkspaceInviteDto } from "@/services/workspace-invite/type";
import {
	acceptWorkspaceInviteApi,
	declineWorkspaceInviteApi,
	inviteWorkspaceMembersApi,
	searchInviteUsersApi,
} from "@/services/workspace-invite/workspace-invite.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_KEY } from "@/constants/query-key";
import { WORKSPACE_KEY } from "@/services/workspace/type";

export const WORKSPACE_INVITE_KEY = {
	SEARCH_INVITE_USERS: "SEARCH_INVITE_USERS",
	WORKSPACE_MEMBERS: "WORKSPACE_MEMBERS",
};

export const useSearchInviteUsers = (workspaceId: string, q: string) => {
	return useQuery({
		queryKey: [WORKSPACE_INVITE_KEY.SEARCH_INVITE_USERS, workspaceId, q],
		queryFn: () =>
			searchInviteUsersApi({
				workspaceId,
				q,
			}),
		enabled: !!workspaceId && q.trim().length >= 2,
	});
};

export const useInviteWorkspaceMembers = (workspaceId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWorkspaceInviteDto) =>
			inviteWorkspaceMembersApi(workspaceId, data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_INVITE_KEY.WORKSPACE_MEMBERS, workspaceId],
			});
		},
	});
};

export const useAcceptWorkspaceInvite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (token: string) => acceptWorkspaceInviteApi(token),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE],
				}),
				queryClient.invalidateQueries({
					queryKey: [NOTIFICATION_KEY.MY_NOTIFICATIONS],
				}),
				queryClient.invalidateQueries({
					queryKey: [NOTIFICATION_KEY.UNREAD_COUNT],
				}),
			]);
		},
	});
};

export const useDeclineWorkspaceInvite = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (token: string) => declineWorkspaceInviteApi(token),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: [WORKSPACE_KEY.WORKSPACE],
				}),
				queryClient.invalidateQueries({
					queryKey: [NOTIFICATION_KEY.MY_NOTIFICATIONS],
				}),
				queryClient.invalidateQueries({
					queryKey: [NOTIFICATION_KEY.UNREAD_COUNT],
				}),
			]);
		},
	});
};

