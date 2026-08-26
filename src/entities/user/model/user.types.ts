export enum SystemRole {
	USER = "USER",
	SYSTEM_ADMIN = "SYSTEM_ADMIN",
	SUPER_ADMIN = "SUPER_ADMIN",
}

export interface User {
	id: string;
	email: string;
	username: string;
	avatarUrl: string | null;
	isActive: boolean;
	systemRole: SystemRole;

	lastActiveWorkspaceId: string | null;

	createdAt: string;
	updatedAt: string;
}

export type GetMeResponse = User;
