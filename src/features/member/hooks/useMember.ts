import { findAllMemberApi } from "@/services/member/member.service";
import { MEMBER_KEY } from "@/services/member/type";
import { useQuery } from "@tanstack/react-query";

type UseMemberParams = {
	workspaceId?: string;
};

export const useMember = ({ workspaceId }: UseMemberParams = {}) => {
	const findAllMember = useQuery({
		queryKey: [MEMBER_KEY.MEMBERS, workspaceId],
		queryFn: () => findAllMemberApi(workspaceId!),
		enabled: !!workspaceId,
	});

	return {
		findAllMember,
	};
};
