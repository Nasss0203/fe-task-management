export const MEMBER_KEY = {
	MEMBERS: "members",
};

export type WorkspaceMemberItem = {
	id: string;
	workspace_id: string;
	user_id: string;
	full_name: string;
	email: string;
	avatar_url: string | null;
	role_name: string;
	lastOpenedAt: string | null;
	joinedAt: string | null;
	taskCount: number;
};

export type FindAllMemberResponse = {
	data: WorkspaceMemberItem[];
};
