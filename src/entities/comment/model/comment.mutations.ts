import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";

import { commentApi } from "../api/comment.api";
import { commentKeys } from "./comment.queries";

function notifyCommentError(error: unknown) {
	toast.error(getApiErrorMessage(error, "Could not save the comment."));
}

export function useCreatePageComment(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { body: string; parentCommentId?: string | null }) =>
			commentApi.createPageComment(pageId, input),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: commentKeys.page(pageId) }),
		onError: notifyCommentError,
	});
}

export function useUpdateComment(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ commentId, body }: { commentId: string; body: string }) =>
			commentApi.update(commentId, body),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: commentKeys.page(pageId) }),
		onError: notifyCommentError,
	});
}

export function useDeleteComment(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commentId: string) => commentApi.delete(commentId),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: commentKeys.page(pageId) }),
		onError: notifyCommentError,
	});
}
