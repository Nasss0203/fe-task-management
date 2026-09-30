import type {
	PublicNavigationPage,
	PublicSiteNavigation,
} from "../model/public-site.types";

export const DEFAULT_MOCK_NAVIGATION_PAGES: PublicNavigationPage[] = [
	{
		page_id: "page-root",
		title: "Page 1",
		icon: null,
		path: "/",
		navigation_parent_id: null,
	},
	{
		page_id: "page-about",
		title: "About",
		icon: null,
		path: "/about",
		navigation_parent_id: "page-root",
	},
	{
		page_id: "page-docs",
		title: "Docs",
		icon: null,
		path: "/docs",
		navigation_parent_id: "page-root",
	},
	{
		page_id: "page-api",
		title: "API",
		icon: null,
		path: "/docs/api",
		navigation_parent_id: "page-docs",
	},
	{
		page_id: "page-contact",
		title: "Contact",
		icon: null,
		path: "/contact",
		navigation_parent_id: "page-root",
	},
];

export const PRIVATE_PARENT_MOCK_NAVIGATION_PAGES: PublicNavigationPage[] = [
	{
		page_id: "page-root",
		title: "Page 1",
		icon: null,
		path: "/",
		navigation_parent_id: null,
	},
	{
		page_id: "api",
		title: "API",
		icon: null,
		path: "/internal-docs/api",
		navigation_parent_id: "page-root",
	},
];

export async function getMockPublicSiteNavigation(
	subdomain: string,
	signal?: AbortSignal,
): Promise<PublicSiteNavigation> {
	if (signal?.aborted) {
		throw new DOMException("Aborted", "AbortError");
	}

	const pages =
		subdomain === "private-parent-site"
			? PRIVATE_PARENT_MOCK_NAVIGATION_PAGES
			: DEFAULT_MOCK_NAVIGATION_PAGES;

	return Promise.resolve({
		subdomain,
		pages,
	});
}
