import { findAllMemberApi, updateMemberRoleApi, removeMemberApi } from "@/services/member/member.service";
import { MEMBER_KEY } from "@/services/member/type";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type UseMemberParams = {
	workspaceId?: string;
};

export const useMember = ({ workspaceId }: UseMemberParams = {}) => {
	const queryClient = useQueryClient();

	const findAllMember = useQuery({
		queryKey: [MEMBER_KEY.MEMBERS, workspaceId],
		queryFn: () => findAllMemberApi(workspaceId!),
		enabled: !!workspaceId,
	});

	const updateMemberRole = useMutation({
		mutationFn: ({ userId, role_name }: { userId: string; role_name: string }) =>
			updateMemberRoleApi(workspaceId!, userId, role_name),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [MEMBER_KEY.MEMBERS, workspaceId],
			});
		},
	});

	const removeMember = useMutation({
		mutationFn: (userId: string) => removeMemberApi(workspaceId!, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [MEMBER_KEY.MEMBERS, workspaceId],
			});
		},
	});

	return {
		findAllMember,
		updateMemberRole,
		removeMember,
	};
};
