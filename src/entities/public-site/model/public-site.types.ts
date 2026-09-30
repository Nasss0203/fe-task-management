import type { PageBlockType } from "@/entities/page-block/model/page-block.types";

export type PublicPage = {
	id: string;

	title: string;

	slug: string | null;

	icon: string | null;

	cover_url: string | null;

	updated_at: string;
};

export type PublicPageBlock = {
	id: string;

	parent_block_id: string | null;

	type: PageBlockType;

	title: string | null;

	position_x: number | null;
	position_y: number | null;

	width: number | null;
	height: number | null;

	order_index: number;

	content: unknown;

	style_config: Record<string, unknown> | null;

	data_config: unknown;

	is_open: boolean;
};

export type PublicSitePage = {
	breadcrumbs: PublicBreadcrumb[];
	subdomain: string;

	path: string;

	page: PublicPage;

	blocks: PublicPageBlock[];
};

export type PublicBreadcrumb = {
	page_id: string;
	title: string;
	path: string;
};

export type PublicNavigationPage = {
	page_id: string;
	title: string;
	icon: string | null;
	path: string;
	navigation_parent_id: string | null;
};

export type PublicSiteNavigation = {
	subdomain: string;
	pages: PublicNavigationPage[];
};

export type PublicNavigationNode = PublicNavigationPage & {
	children: PublicNavigationNode[];
};
