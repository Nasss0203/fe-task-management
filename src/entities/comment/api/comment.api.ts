import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import type { Comment } from "../model/comment.types";

export const commentApi = {
	listPageComments: async (pageId: string): Promise<Comment[]> => {
		const response = await instance.get<ApiResponse<Comment[]>>(
			`/page/${pageId}/comments`,
		);

		return response.data.data;
	},

	createPageComment: async (
		pageId: string,
		input: { body: string; parentCommentId?: string | null },
	): Promise<Comment> => {
		const response = await instance.post<ApiResponse<Comment>>(
			`/page/${pageId}/comments`,
			{
				body: input.body,
				parent_comment_id: input.parentCommentId ?? undefined,
			},
		);

		return response.data.data;
	},

	update: async (commentId: string, body: string): Promise<Comment> => {
		const response = await instance.patch<ApiResponse<Comment>>(
			`/comments/${commentId}`,
			{ body },
		);

		return response.data.data;
	},

	delete: async (commentId: string): Promise<void> => {
		await instance.delete(`/comments/${commentId}`);
	},
};
