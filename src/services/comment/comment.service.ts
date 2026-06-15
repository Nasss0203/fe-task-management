import axios from "@/services/axios";
import { type ApiResponse } from "@/services/types";
import {
	type TaskCommentItem,
	type CreateTaskCommentDto,
	type UpdateTaskCommentDto,
	type DeleteTaskCommentDto,
} from "./type";

const BASE_PATH = "/task-commnent";

export const commentService = {
	getComments: async (
		workspaceId: string,
		projectId: string,
		taskId: string,
	): Promise<TaskCommentItem[]> => {
		const { data } = await axios.get<ApiResponse<TaskCommentItem[]>>(
			`${BASE_PATH}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
		);
		return data.data;
	},

	createComment: async (
		dto: CreateTaskCommentDto,
	): Promise<TaskCommentItem> => {
		const { workspaceId, projectId, taskId, content } = dto;
		const { data } = await axios.post<ApiResponse<TaskCommentItem>>(
			`${BASE_PATH}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
			{ content },
		);
		return data.data;
	},

	updateComment: async (
		dto: UpdateTaskCommentDto,
	): Promise<TaskCommentItem> => {
		const { workspaceId, projectId, taskId, commentId, content } = dto;
		const { data } = await axios.put<ApiResponse<TaskCommentItem>>(
			`${BASE_PATH}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/${commentId}`,
			{ content },
		);
		return data.data;
	},

	deleteComment: async (dto: DeleteTaskCommentDto): Promise<void> => {
		const { workspaceId, projectId, taskId, commentId } = dto;
		await axios.delete(
			`${BASE_PATH}/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/${commentId}`,
		);
	},
};
