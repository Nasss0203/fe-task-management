export type WorkspaceStatus = "ACTIVE" | "DELETED";

export type PlanTypeWorkspace = "free" | "pro";

export type AdminFindAllWorkspaceQuery = {
	search?: string;
	plan?: PlanTypeWorkspace;
	status?: WorkspaceStatus;
	createdFrom?: string;
	createdTo?: string;
	createdAt?: string;
	page?: number;
	pageSize?: number;
};

export type WorkspaceItem = {
	id: string;
	name: string;
	slug: string;

	plan: PlanTypeWorkspace;
	status: WorkspaceStatus;

	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;

	ownerName: string | null;
	ownerEmail: string | null;

	membersCount: number;
	projectsCount: number;
	boardsCount: number;
	tasksCount: number;
};

export type WorkspacePaginationResponse = {
	data: WorkspaceItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};
