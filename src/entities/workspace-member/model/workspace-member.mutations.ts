import { useMutation, useQueryClient } from "@tanstack/react-query";

import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";

import { workspaceMemberApi } from "../api/workspace-member.api";
import { workspaceMemberKeys } from "./workspace-member.queries";
import type { WorkspaceMemberRole } from "./workspace-member.types";

interface UpdateWorkspaceMemberRoleVariables {
	workspaceId: string;
	userId: string;
	roleName: WorkspaceMemberRole;
}

interface LeaveWorkspaceVariables {
	workspaceId: string;
}

interface RemoveWorkspaceMemberVariables {
	workspaceId: string;
	userId: string;
}

export function useUpdateWorkspaceMemberRole() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			workspaceId,
			userId,
			roleName,
		}: UpdateWorkspaceMemberRoleVariables) =>
			workspaceMemberApi.updateRole(workspaceId, userId, roleName),

		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: workspaceMemberKeys.people(variables.workspaceId),
			});
		},
	});
}

export function useLeaveWorkspace() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workspaceId }: LeaveWorkspaceVariables) =>
			workspaceMemberApi.leaveWorkspace(workspaceId),

		onSuccess: async (_data, variables) => {
			const { workspaceId } = variables;

			queryClient.removeQueries({
				queryKey: workspaceMemberKeys.people(workspaceId),
				exact: true,
			});

			queryClient.removeQueries({
				queryKey: workspaceKeys.detail(workspaceId),
				exact: true,
			});

			queryClient.removeQueries({
				queryKey: workspaceKeys.access(workspaceId),
				exact: true,
			});

			await queryClient.invalidateQueries({
				queryKey: workspaceKeys.all,
				exact: true,
			});
		},
	});
}

export function useRemoveWorkspaceMember() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ workspaceId, userId }: RemoveWorkspaceMemberVariables) =>
			workspaceMemberApi.removeMember(workspaceId, userId),

		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: workspaceMemberKeys.people(variables.workspaceId),
			});
		},
	});
}
