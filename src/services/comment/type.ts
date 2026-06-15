export const COMMENT_KEY = {
	COMMENTS: "comments",
};

export interface TaskCommentItem {
	id: string;
	workspaceId: string;
	projectId: string;
	taskId: string;
	content: string;
	authorName: string | null;
	authorEmail: string | null;
	authorAvatarUrl?: string | null;
	authorId: string;
	isEdited: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTaskCommentDto {
	workspaceId: string;
	projectId: string;
	taskId: string;
	content: string;
}

export interface UpdateTaskCommentDto {
	workspaceId: string;
	projectId: string;
	taskId: string;
	commentId: string;
	content: string;
}

export interface DeleteTaskCommentDto {
	workspaceId: string;
	projectId: string;
	taskId: string;
	commentId: string;
}
