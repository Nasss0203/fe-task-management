import type { PageShareAccessLevel } from "@/entities/page-share/model/page-share.types";

export type PageAccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface PageAccessRequest {
	id: string;
	pageId: string;
	userId: string;
	status: PageAccessRequestStatus;
	createdAt: string;
}

export interface CreatePageAccessRequestPayload {
	token: string;
}

export interface ApprovePageAccessRequestPayload {
	accessLevel: PageShareAccessLevel;
}

export interface MyPageAccessRequest {
	id: string;
	pageId: string;
	userId: string;
	status: "PENDING";
	createdAt: string;
	updatedAt: string;
}
