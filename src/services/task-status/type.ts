export type TaskStatusItem = {
	id: string;
	workspaceId: string;
	projectId: string;
	name: string;
	position: number;
	color: string;
	isDone: boolean;
	createdAt: string;
	updatedAt: string;
};

export type TaskStatusResponse = {
	statusCode: number;
	message: string;
	data: TaskStatusItem[];
};
