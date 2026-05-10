import { findAllMemberApi } from "@/services/member/member.service";
import { MEMBER_KEY } from "@/services/member/type";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useMember = ({ workspaceId }: any = {}) => {
	const queryClient = useQueryClient();

	const findAllMember = useQuery({
		queryKey: [MEMBER_KEY.MEMBERS],
		queryFn: () => findAllMemberApi(workspaceId),
		enabled: !!workspaceId,
	});

	return {
		findAllMember,
	};
};
