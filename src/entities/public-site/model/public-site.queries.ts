import { useQuery } from "@tanstack/react-query";

import { publicSiteApi } from "../api/public-site.api";

export const publicSiteKeys = {
	all: ["public-sites"] as const,

	detail: (subdomain: string, path: string) =>
		[...publicSiteKeys.all, "detail", subdomain, path] as const,
};

export function usePublicPage(subdomain?: string, path?: string) {
	const resolvedPath = path || "/";

	return useQuery({
		queryKey: publicSiteKeys.detail(subdomain ?? "", resolvedPath),

		queryFn: ({ signal }) =>
			publicSiteApi.getPublicPage(subdomain!, resolvedPath, signal),

		enabled: Boolean(subdomain),

		retry: false,
	});
}
