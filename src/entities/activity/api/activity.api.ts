import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	ActivityPage,
	PageActivitySummary,
} from "../model/activity.types";

export const activityApi = {
	getPageActivities: async (
		workspaceId: string,
		pageId: string,
		cursor?: string,
		limit = 30,
	): Promise<ActivityPage> => {
		const response = await instance.get<ApiResponse<ActivityPage>>(
			`/activity/workspaces/${workspaceId}/pages/${pageId}`,
			{ params: { cursor, limit } },
		);

		return response.data.data;
	},

	getPageActivitySummary: async (
		workspaceId: string,
		pageId: string,
	): Promise<PageActivitySummary> => {
		const response = await instance.get<ApiResponse<PageActivitySummary>>(
			`/activity/workspaces/${workspaceId}/pages/${pageId}/summary`,
		);

		return response.data.data;
	},
};
