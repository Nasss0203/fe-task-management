export interface Assignee {
	id: string;
	taskId: string;
	userId: string;
	username: string | null;
	assignedBy: string | null;
	assignedByUsername: string | null;
	assignedAt: Date;
}

export interface AssignInput {
	taskId: string;
	userId: string;
	assignedBy?: string;
}
