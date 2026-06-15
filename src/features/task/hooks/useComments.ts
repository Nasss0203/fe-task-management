import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/comment/comment.service";
import { COMMENT_KEY, type CreateTaskCommentDto, type UpdateTaskCommentDto, type DeleteTaskCommentDto } from "@/services/comment/type";

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
		onSuccess: (_, variables) => {
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
		onSuccess: (_, variables) => {
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
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [COMMENT_KEY.COMMENTS, variables.workspaceId, variables.projectId, variables.taskId],
			});
		},
	});
};
