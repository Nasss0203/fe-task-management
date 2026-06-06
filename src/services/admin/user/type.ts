export type AdminUserStatus = "ACTIVE" | "LOCKED";

export type AdminSystemRole = "USER" | "SYSTEM_ADMIN" | "SUPER_ADMIN";

export type AdminWorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export type AdminUserWorkspace = {
	id: string;
	name: string;
	role: AdminWorkspaceRole;
};

export type AdminUserActivity = {
	id: string;
	action: string;
	time: string;
	createdAt: string;
};

export type AdminUser = {
	id: string;
	fullName: string;
	email: string;
	avatarUrl?: string | null;
	status: AdminUserStatus;
	systemRole: AdminSystemRole;
	workspaces: AdminUserWorkspace[];
	createdAt: string;
	lastActive: string | null;
	activities: AdminUserActivity[];
};

export type AdminFindAllUserQuery = {
	search?: string;
	status?: AdminUserStatus;
	role?: AdminSystemRole;
	createdAt?: string;
	page?: number;
	pageSize?: number;
};

export type AdminUserPaginationResponse = {
	data: AdminUser[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type AdminUserOverviewResponseDto = {
	totalUsers: number;
	activeUsers: number;
	lockedUsers: number;
	systemAdmins: number;
	newUsersLast7Days: number;
	activeToday: number;
};
