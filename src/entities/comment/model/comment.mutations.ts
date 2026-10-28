import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";

import { commentApi } from "../api/comment.api";
import { commentKeys } from "./comment.queries";
import type { CommentTarget } from "./comment.types";

function notifyCommentError(error: unknown) {
	toast.error(getApiErrorMessage(error, "Could not save the comment."));
}

function useInvalidateComments(target: CommentTarget) {
	const queryClient = useQueryClient();

	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: commentKeys.target(target) }),
			// Số comment cạnh block đổi theo
			target.type === "PAGE_BLOCK" &&
				queryClient.invalidateQueries({ queryKey: commentKeys.blockCounts() }),
		]);
}

export function useCreateComment(target: CommentTarget) {
	const invalidate = useInvalidateComments(target);

	return useMutation({
		mutationFn: (input: { body: string; parentCommentId?: string | null }) =>
			commentApi.create(target, input),
		onSuccess: invalidate,
		onError: notifyCommentError,
	});
}

export function useUpdateComment(target: CommentTarget) {
	const invalidate = useInvalidateComments(target);

	return useMutation({
		mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
			commentApi.update(commentId, body),
		onSuccess: invalidate,
		onError: notifyCommentError,
	});
}

export function useDeleteComment(target: CommentTarget) {
	const invalidate = useInvalidateComments(target);

	return useMutation({
		mutationFn: (commentId: string) => commentApi.delete(commentId),
		onSuccess: invalidate,
		onError: notifyCommentError,
	});
}
