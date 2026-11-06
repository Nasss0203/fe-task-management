import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type { SlackConnectionStatus } from "../model/slack.types";

const SLACK_API = "/integrations/slack";

export const slackApi = {
	getStatus: async (): Promise<SlackConnectionStatus> => {
		const response = await instance.get<ApiResponse<SlackConnectionStatus>>(SLACK_API);

		return response.data.data;
	},

	getAuthorizeUrl: async (returnTo: string): Promise<string> => {
		const response = await instance.post<ApiResponse<{ url: string }>>(
			`${SLACK_API}/authorize-url`,
			{ returnTo },
		);

		return response.data.data.url;
	},

	disconnect: async (): Promise<void> => {
		await instance.delete(SLACK_API);
	},
};
