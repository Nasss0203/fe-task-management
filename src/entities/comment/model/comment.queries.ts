import { useQuery } from "@tanstack/react-query";

import { commentApi } from "../api/comment.api";
import type { Comment, CommentTarget, CommentThread } from "./comment.types";

export const commentKeys = {
	all: ["comments"] as const,

	target: (target: CommentTarget) =>
		[...commentKeys.all, target.type, target.id] as const,

	blockCounts: (pageId?: string) =>
		pageId
			? ([...commentKeys.all, "block-counts", pageId] as const)
			: ([...commentKeys.all, "block-counts"] as const),
};

/** Số comment của mọi block trong page, một request cho cả page. */
export function useBlockCommentCounts(pageId: string, enabled = true) {
	return useQuery({
		queryKey: commentKeys.blockCounts(pageId),
		queryFn: () => commentApi.blockCounts(pageId),
		enabled: Boolean(pageId) && enabled,
		refetchOnWindowFocus: true,
	});
}

export function useComments(target: CommentTarget, enabled = true) {
	return useQuery({
		queryKey: commentKeys.target(target),
		queryFn: () => commentApi.list(target),
		enabled: Boolean(target.id) && enabled,
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
