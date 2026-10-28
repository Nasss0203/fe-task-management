import { useQuery } from "@tanstack/react-query";

import { commentApi } from "../api/comment.api";
import type { Comment, CommentThread } from "./comment.types";

export const commentKeys = {
	all: ["comments"] as const,

	page: (pageId: string) => [...commentKeys.all, "page", pageId] as const,
};

export function usePageComments(pageId: string, enabled = true) {
	return useQuery({
		queryKey: commentKeys.page(pageId),
		queryFn: () => commentApi.listPageComments(pageId),
		enabled: Boolean(pageId) && enabled,
		// Chưa có realtime: lấy lại khi quay về tab để thấy comment mới của người khác
		refetchOnWindowFocus: true,
	});
}

/** API trả danh sách phẳng (cũ trước); gom trả lời vào comment gốc của nó. */
export function groupCommentThreads(comments: Comment[]): CommentThread[] {
	const threads = new Map<string, CommentThread>();

	for (const comment of comments) {
		if (!comment.parent_comment_id) {
			threads.set(comment.id, { root: comment, replies: [] });
		}
	}

	for (const comment of comments) {
		if (comment.parent_comment_id) {
			threads.get(comment.parent_comment_id)?.replies.push(comment);
		}
	}

	return [...threads.values()];
}
