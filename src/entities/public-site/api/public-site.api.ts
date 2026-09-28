import type { ApiResponse } from "@/shared/api";
import publicApiClient from "@/shared/api/public-api-client";

import type { PublicSitePage } from "../model/public-site.types";

const PUBLIC_SITE_API = "/public/sites";

export const publicSiteApi = {
	getPublicPage: async (
		subdomain: string,
		path: string,
		signal?: AbortSignal,
	): Promise<PublicSitePage> => {
		const response = await publicApiClient.get<ApiResponse<PublicSitePage>>(
			`${PUBLIC_SITE_API}/${encodeURIComponent(subdomain)}`,
			{
				params: {
					path,
				},
				signal,
			},
		);

		return response.data.data;
	},
};
