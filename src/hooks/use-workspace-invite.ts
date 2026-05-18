import { CreateWorkspaceInviteDto } from "@/services/workspace-invite/type";
import {
	inviteWorkspaceMembersApi,
	searchInviteUsersApi,
} from "@/services/workspace-invite/workspace-invite.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
