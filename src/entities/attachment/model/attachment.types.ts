export interface Attachment {
	id: string;
	workspaceId: string;
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

export type StorageFileType = "image" | "document" | "other";

export type StorageFileStatus = "IN_USE" | "IN_TRASH" | "ORPHANED";

export type StorageFileSort = "size_desc" | "created_desc" | "created_asc";

export interface StorageUsage {
	bytes: number;
	count: number;
}

export interface WorkspaceStorage {
	workspace: StorageUsage;
	byType: Record<StorageFileType, StorageUsage>;
	mine: StorageUsage;
	canManageAll: boolean;
}

export interface StorageFile {
	id: string;
	fileName: string;
	mimeType: string;
	size: number;
	type: StorageFileType;
	status: StorageFileStatus;
	createdAt: string;
	uploadedBy: { id: string; username: string; avatarUrl: string | null } | null;
	location: { pageId: string; pageTitle: string } | null;
}

export interface ListStorageFilesParams {
	type?: StorageFileType;
	status?: StorageFileStatus;
	search?: string;
	sort?: StorageFileSort;
	page?: number;
	pageSize?: number;
}

export interface StorageFilesPage {
	data: StorageFile[];
	meta: { page: number; pageSize: number; total: number; totalPages: number };
}
