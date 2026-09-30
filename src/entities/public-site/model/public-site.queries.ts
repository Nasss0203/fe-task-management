import { useQuery } from "@tanstack/react-query";

import { publicSiteApi } from "../api/public-site.api";

export const publicSiteKeys = {
	all: ["public-sites"] as const,

	detail: (subdomain: string, path: string) =>
		[...publicSiteKeys.all, "detail", subdomain, path] as const,

	navigation: (subdomain: string) =>
		[...publicSiteKeys.all, "navigation", subdomain] as const,
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

export function usePublicSiteNavigation(subdomain?: string) {
	return useQuery({
		queryKey: publicSiteKeys.navigation(subdomain ?? ""),

		queryFn: ({ signal }) =>
			publicSiteApi.getPublicSiteNavigation(subdomain!, signal),

		enabled: Boolean(subdomain),

		retry: false,
	});
}
