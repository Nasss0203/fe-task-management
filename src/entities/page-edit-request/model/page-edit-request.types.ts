export type PageEditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PageEditRequest {
	id: string;

	pageId: string;

	pageShareId: string;

	userId: string;

	status: PageEditRequestStatus;

	reviewedBy: string | null;

	reviewedAt: string | null;

	createdAt: string;

	updatedAt: string;
}
