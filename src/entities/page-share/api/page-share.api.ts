import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	PageAccess,
	PageShareAccessLevel,
	PageShareCandidate,
	PageShareInvitationResult,
	PageShareLink,
	PageShareMember,
	PageShareRecord,
	PageShareSetting,
	ResolvedPageShareLink,
	SharePagePayload,
	SharedPage,
	UpdatePageShareSettingPayload,
} from "../model/page-share.types";

const PAGE_SHARE_API = "/page-shares";

export const pageShareApi = {
	getSharedWithMePages: async (): Promise<SharedPage[]> => {
		const response = await instance.get<ApiResponse<SharedPage[]>>(
			`${PAGE_SHARE_API}/shared-with-me`,
		);

		return response.data.data;
	},

	getPageShares: async (pageId: string): Promise<PageShareMember[]> => {
		const response = await instance.get<ApiResponse<PageShareMember[]>>(
			`${PAGE_SHARE_API}/page/${pageId}`,
		);

		return response.data.data;
	},

	getPageShareCandidates: async (
		pageId: string,
		query: string,
	): Promise<PageShareCandidate[]> => {
		const response = await instance.get<ApiResponse<PageShareCandidate[]>>(
			`${PAGE_SHARE_API}/page/${pageId}/candidates`,
			{
				params: {
					query,
				},
			},
		);

		return response.data.data;
	},

	/**
	 * Effective normal access của current user.
	 *
	 * Không bao gồm quyền đến từ Share Link token.
	 */
	getPageAccess: async (pageId: string): Promise<PageAccess> => {
		const response = await instance.get<ApiResponse<PageAccess>>(
			`/page/${pageId}/access`,
		);

		if (process.env.NODE_ENV === "development") {
			console.log("[getPageAccess raw]", response.data);
		}

		return response.data.data;
	},

	/**
	 * Direct PageShare cho một user.
	 */
	sharePage: async (
		pageId: string,
		payload: SharePagePayload,
	): Promise<PageShareRecord> => {
		const response = await instance.post<ApiResponse<PageShareRecord>>(
			`${PAGE_SHARE_API}/page/${pageId}`,
			payload,
		);

		return response.data.data;
	},

	acceptInvitation: async (token: string): Promise<PageShareInvitationResult> => {
		const response = await instance.post<ApiResponse<PageShareInvitationResult>>(
			"/page/share-links/accept",
			{ token },
		);

		return response.data.data;
	},

	rejectInvitation: async (token: string): Promise<PageShareInvitationResult> => {
		const response = await instance.post<ApiResponse<PageShareInvitationResult>>(
			"/page/share-links/reject",
			{ token },
		);

		return response.data.data;
	},

	/**
	 * Tạo hoặc lấy stable Share Link
	 * của một Page.
	 */
	createPageShareLink: async (pageId: string): Promise<PageShareLink> => {
		const response = await instance.post<ApiResponse<PageShareLink>>(
			`/page/${pageId}/share-links`,
		);

		return response.data.data;
	},

	/**
	 * Resolve token thành Page.
	 *
	 * Backend:
	 * GET /page/share/:token
	 *
	 * Kết quả:
	 * {
	 *   pageId,
	 *   linkAccessLevel,
	 *   invitation
	 * }
	 */
	resolvePageShareLink: async (
		token: string,
	): Promise<ResolvedPageShareLink> => {
		const response = await instance.get<ApiResponse<ResolvedPageShareLink>>(
			`/page/share/${encodeURIComponent(token)}`,
		);

		return response.data.data;
	},

	getPageShareSetting: async (pageId: string): Promise<PageShareSetting> => {
		const response = await instance.get<ApiResponse<PageShareSetting>>(
			`/page/${pageId}/share-settings`,
		);

		return response.data.data;
	},

	updatePageShareAccess: async (
		shareId: string,
		accessLevel: PageShareAccessLevel,
	): Promise<PageShareRecord> => {
		const response = await instance.patch<ApiResponse<PageShareRecord>>(
			`${PAGE_SHARE_API}/${shareId}`,
			{
				access_level: accessLevel,
			},
		);

		return response.data.data;
	},

	updatePageShareSetting: async (
		pageId: string,
		payload: UpdatePageShareSettingPayload,
	): Promise<PageShareSetting> => {
		const response = await instance.patch<ApiResponse<PageShareSetting>>(
			`/page/${pageId}/share-settings`,
			payload,
		);

		return response.data.data;
	},
};
