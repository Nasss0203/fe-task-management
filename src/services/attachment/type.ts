export type AttachmentProvider = "R2" | "CLOUDINARY";

export type AttachmentStatus = "READY" | "FAILED";

export interface AttachmentItem {
	id: string;
	workspaceId: string;
	taskId: string | null;
	commentId: string | null;
	uploadedBy: string;
	fileName: string;
	mimeType: string;
	size: number;
	provider: AttachmentProvider;
	storageKey: string | null;
	publicId: string | null;
	url: string | null;
	secureUrl: string | null;
	status: AttachmentStatus;
	createdAt: string;
	updatedAt: string;
}

export interface UploadAttachmentDto {
	workspaceId: string;
	taskId?: string;
	commentId?: string;
}

export interface GetDownloadUrlResponse {
	attachmentId: string;
	fileName: string;
	mimeType: string;
	size: number;
	downloadUrl: string;
	expiresIn: number;
}
