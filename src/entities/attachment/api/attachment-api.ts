import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	Attachment,
	AttachmentDownloadUrl,
	ListStorageFilesParams,
	StorageFilesPage,
	UploadAttachmentInput,
	WorkspaceStorage,
} from "../model/attachment.types";

const ATTACHMENT_API = "/attachment";

export const attachmentApi = {
	upload: async ({
		workspaceId,
		pageBlockId,
		file,
	}: UploadAttachmentInput): Promise<Attachment> => {
		const formData = new FormData();

		formData.append("file", file);
		formData.append("pageBlockId", pageBlockId);

		const response = await instance.post<ApiResponse<Attachment>>(
			`${ATTACHMENT_API}/upload/${workspaceId}`,
			formData,
		);

		return response.data.data;
	},

	createDownloadUrl: async (
		attachmentId: string,
	): Promise<AttachmentDownloadUrl> => {
		const response = await instance.post<
			ApiResponse<AttachmentDownloadUrl>
		>(`${ATTACHMENT_API}/${attachmentId}/download-url`);

		return response.data.data;
	},

	getWorkspaceStorage: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<WorkspaceStorage> => {
		const response = await instance.get<ApiResponse<WorkspaceStorage>>(
			`${ATTACHMENT_API}/workspaces/${workspaceId}/storage`,
			{ signal },
		);

		return response.data.data;
	},

	listWorkspaceFiles: async (
		workspaceId: string,
		params: ListStorageFilesParams,
		signal?: AbortSignal,
	): Promise<StorageFilesPage> => {
		const response = await instance.get<ApiResponse<StorageFilesPage>>(
			`${ATTACHMENT_API}/workspaces/${workspaceId}/files`,
			{ params, signal },
		);

		return response.data.data;
	},

	bulkDeleteWorkspaceFiles: async (
		workspaceId: string,
		ids: string[],
	): Promise<{ deletedCount: number }> => {
		const response = await instance.post<
			ApiResponse<{ deletedCount: number }>
		>(`${ATTACHMENT_API}/workspaces/${workspaceId}/files/bulk-delete`, {
			ids,
		});

		return response.data.data;
	},
};
