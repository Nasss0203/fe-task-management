import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import type {
	BlockCommentCounts,
	Comment,
	CommentTarget,
	MentionCandidate,
} from "../model/comment.types";

const TARGET_PATHS: Record<CommentTarget["type"], (id: string) => string> = {
	PAGE: (id) => `/page/${id}/comments`,
	PAGE_BLOCK: (id) => `/pageBlock/${id}/comments`,
	DATABASE_ROW: (id) => `/database-rows/${id}/comments`,
};

function targetPath(target: CommentTarget): string {
	return TARGET_PATHS[target.type](target.id);
}

// Trang /share/:token: BE cho đọc comment theo quyền của link
function shareConfig(shareToken?: string) {
	return shareToken
		? { headers: { "X-Page-Share-Token": shareToken } }
		: undefined;
}

export const commentApi = {
	mentionCandidates: async (
		pageId: string,
		search: string,
	): Promise<MentionCandidate[]> => {
		const response = await instance.get<ApiResponse<MentionCandidate[]>>(
			`/page/${pageId}/mention-candidates`,
			{ params: { q: search } },
		);

		return response.data.data;
	},

	blockCounts: async (
		pageId: string,
		shareToken?: string,
	): Promise<BlockCommentCounts> => {
		const response = await instance.get<ApiResponse<BlockCommentCounts>>(
			`/page/${pageId}/comments/block-counts`,
			shareConfig(shareToken),
		);

		return response.data.data;
	},

	list: async (
		target: CommentTarget,
		shareToken?: string,
	): Promise<Comment[]> => {
		const response = await instance.get<ApiResponse<Comment[]>>(
			targetPath(target),
			shareConfig(shareToken),
		);

		return response.data.data;
	},

	create: async (
		target: CommentTarget,
		input: { body: string; parentCommentId?: string | null },
	): Promise<Comment> => {
		const response = await instance.post<ApiResponse<Comment>>(
			targetPath(target),
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

	resolve: async (commentId: string, resolved: boolean): Promise<Comment> => {
		const response = await instance.patch<ApiResponse<Comment>>(
			`/comments/${commentId}/resolved`,
			{ resolved },
		);

		return response.data.data;
	},

	delete: async (commentId: string): Promise<void> => {
		await instance.delete(`/comments/${commentId}`);
	},
};
