export interface Attachment {
	id: string;
	workspaceId: string;
	taskId: string | null;
	commentId: string | null;
	pageBlockId: string | null;
	uploadedBy: string;
	fileName: string;
	mimeType: string;
	size: number;
	provider: string;
	storageKey: string | null;
	publicId: string | null;
	url: string | null;
	secureUrl: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export interface UploadAttachmentInput {
	workspaceId: string;
	pageBlockId: string;
	file: File;
}

export interface AttachmentDownloadUrl {
	downloadUrl: string;
	expiresIn: number;
}
