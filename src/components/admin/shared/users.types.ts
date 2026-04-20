export type UserStatus = "ACTIVE" | "LOCKED" | "PENDING";

export type SystemRole = "SYSTEM_ADMIN" | "USER";

export type WorkspaceMembership = {
	id: string;
	name: string;
	role: "OWNER" | "ADMIN" | "MEMBER";
};

export type UserActivity = {
	id: string;
	action: string;
	time: string;
};

export type AdminUser = {
	id: string;
	fullName: string;
	email: string;
	avatarUrl?: string | null;
	status: UserStatus;
	systemRole: SystemRole;
	workspaces: WorkspaceMembership[];
	createdAt: string;
	lastActive: string;
	activities: UserActivity[];
};
