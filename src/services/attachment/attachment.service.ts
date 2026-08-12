import instance from "../axios";
import { ApiResponse } from "../types";
import { AttachmentItem, GetDownloadUrlResponse } from "./type";

export const getTaskAttachmentsApi = async (
	taskId: string,
): Promise<ApiResponse<AttachmentItem[]>> => {
	const response = await instance.get<ApiResponse<AttachmentItem[]>>(
		`/attachment/tasks/${taskId}`,
	);
	return response.data;
};

export const uploadAttachmentApi = async (
	workspaceId: string,
	taskId: string | undefined,
	commentId: string | undefined,
	file: File,
): Promise<ApiResponse<AttachmentItem>> => {
	const formData = new FormData();
	formData.append("file", file);
	
	if (taskId) formData.append("taskId", taskId);
	if (commentId) formData.append("commentId", commentId);

	const response = await instance.post<ApiResponse<AttachmentItem>>(
		`/attachment/upload/${workspaceId}`,
		formData,
	);
	return response.data;
};

export const getAttachmentDownloadUrlApi = async (
	id: string,
): Promise<ApiResponse<GetDownloadUrlResponse>> => {
	const response = await instance.post<ApiResponse<GetDownloadUrlResponse>>(
		`/attachment/${id}/download-url`,
	);
	return response.data;
};

export const deleteAttachmentApi = async (
	id: string,
): Promise<ApiResponse<boolean>> => {
	const response = await instance.delete<ApiResponse<boolean>>(
		`/attachment/${id}`,
	);
	return response.data;
};
