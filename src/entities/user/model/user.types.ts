export enum SystemRole {
	USER = "USER",
	SYSTEM_ADMIN = "SYSTEM_ADMIN",
	SUPER_ADMIN = "SUPER_ADMIN",
}

export interface User {
	id: string;
	email: string;
	username: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	avatarUrl?: string;
	googleId?: string;
	systemRole: SystemRole;
}

export type GetMeResponse = User;
