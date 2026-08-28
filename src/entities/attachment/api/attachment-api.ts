import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	Attachment,
	AttachmentDownloadUrl,
	UploadAttachmentInput,
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
};
