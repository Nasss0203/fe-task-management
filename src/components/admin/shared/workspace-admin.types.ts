export type WorkspaceStatus = "ACTIVE" | "LOCKED" | "DELETED";

export type WorkspacePlan = "FREE" | "PRO" | "ENTERPRISE";

export type WorkspaceMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type WorkspaceMember = {
	id: string;
	name: string;
	email: string;
	role: WorkspaceMemberRole;
};

export type WorkspaceActivity = {
	id: string;
	action: string;
	time: string;
};

export type AdminWorkspace = {
	id: string;
	name: string;
	slug: string;
	ownerId: string;
	ownerName: string;
	ownerEmail: string;
	status: WorkspaceStatus;
	plan: WorkspacePlan;
	membersCount: number;
	projectsCount: number;
	boardsCount: number;
	tasksCount: number;
	storageUsedGb: number;
	storageLimitGb: number;
	createdAt: string;
	lastActive: string;
	members: WorkspaceMember[];
	activities: WorkspaceActivity[];
};
