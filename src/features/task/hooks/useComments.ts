import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/comment/comment.service";
import { COMMENT_KEY, type CreateTaskCommentDto, type UpdateTaskCommentDto, type DeleteTaskCommentDto, type TaskCommentItem } from "@/services/comment/type";

export const useGetComments = (workspaceId: string, projectId: string, taskId: string) => {
	return useQuery({
		queryKey: [COMMENT_KEY.COMMENTS, workspaceId, projectId, taskId],
		queryFn: () => commentService.getComments(workspaceId, projectId, taskId),
		enabled: !!workspaceId && !!projectId && !!taskId,
	});
};

export const useCreateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dto: CreateTaskCommentDto) => commentService.createComment(dto),
		onMutate: async (newComment) => {
			const queryKey = [COMMENT_KEY.COMMENTS, newComment.workspaceId, newComment.projectId, newComment.taskId];
			await queryClient.cancelQueries({ queryKey });

			const previousComments = queryClient.getQueryData<TaskCommentItem[]>(queryKey);

			queryClient.setQueryData<TaskCommentItem[]>(queryKey, (old = []) => [
				...old,
				{
					id: `temp-${Date.now()}`,
					workspaceId: newComment.workspaceId,
					projectId: newComment.projectId,
					taskId: newComment.taskId,
					content: newComment.content,
					authorName: "Sending...",
					authorEmail: null,
					authorId: "temp",
					isEdited: false,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			]);

			return { previousComments, queryKey };
		},
		onError: (_err, _newComment, context) => {
			if (context?.previousComments) {
				queryClient.setQueryData(context.queryKey, context.previousComments);
			}
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: [COMMENT_KEY.COMMENTS, variables.workspaceId, variables.projectId, variables.taskId],
			});
		},
	});
};

export const useUpdateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dto: UpdateTaskCommentDto) => commentService.updateComment(dto),
		onMutate: async (updatedComment) => {
			const queryKey = [COMMENT_KEY.COMMENTS, updatedComment.workspaceId, updatedComment.projectId, updatedComment.taskId];
			await queryClient.cancelQueries({ queryKey });

			const previousComments = queryClient.getQueryData<TaskCommentItem[]>(queryKey);

			queryClient.setQueryData<TaskCommentItem[]>(queryKey, (old = []) =>
				old.map((comment) =>
					comment.id === updatedComment.commentId
						? { ...comment, content: updatedComment.content, isEdited: true }
						: comment
				)
			);

			return { previousComments, queryKey };
		},
		onError: (_err, _newComment, context) => {
			if (context?.previousComments) {
				queryClient.setQueryData(context.queryKey, context.previousComments);
			}
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: [COMMENT_KEY.COMMENTS, variables.workspaceId, variables.projectId, variables.taskId],
			});
		},
	});
};

export const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dto: DeleteTaskCommentDto) => commentService.deleteComment(dto),
		onMutate: async (deletedComment) => {
			const queryKey = [COMMENT_KEY.COMMENTS, deletedComment.workspaceId, deletedComment.projectId, deletedComment.taskId];
			await queryClient.cancelQueries({ queryKey });

			const previousComments = queryClient.getQueryData<TaskCommentItem[]>(queryKey);

			queryClient.setQueryData<TaskCommentItem[]>(queryKey, (old = []) =>
				old.filter((comment) => comment.id !== deletedComment.commentId)
			);

			return { previousComments, queryKey };
		},
		onError: (_err, _newComment, context) => {
			if (context?.previousComments) {
				queryClient.setQueryData(context.queryKey, context.previousComments);
			}
		},
		onSettled: (_data, _error, variables) => {
			queryClient.invalidateQueries({
				queryKey: [COMMENT_KEY.COMMENTS, variables.workspaceId, variables.projectId, variables.taskId],
			});
		},
	});
};

