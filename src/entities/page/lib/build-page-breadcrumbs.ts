import type { Page } from "../model/page.types";

export interface PageCrumb {
	label: string;
	href?: string;
}

// Dài hơn thì gộp các page cha ở giữa thành "…" như Notion
const MAX_ANCESTORS = 3;

/**
 * Workspace › Teamspace › page cha… › page hiện tại.
 * Page cha không có trong danh sách (vd không có quyền xem) thì dừng ở đó.
 */
export function buildPageBreadcrumbs(
	page: Pick<Page, "id" | "title" | "parent_page_id" | "teamspace_id">,
	pages: Pick<Page, "id" | "title" | "parent_page_id">[],
	options: { workspaceName?: string; teamspaceName?: string } = {},
): PageCrumb[] {
	const byId = new Map(pages.map((item) => [item.id, item]));
	const ancestors: PageCrumb[] = [];
	const seen = new Set([page.id]);

	for (
		let parent = page.parent_page_id ? byId.get(page.parent_page_id) : undefined;
		parent && !seen.has(parent.id);
		parent = parent.parent_page_id ? byId.get(parent.parent_page_id) : undefined
	) {
		seen.add(parent.id);
		ancestors.unshift({
			label: parent.title || "Untitled",
			href: `/page/${parent.id}`,
		});
	}

	const shownAncestors =
		ancestors.length > MAX_ANCESTORS
			? [ancestors[0], { label: "…" }, ...ancestors.slice(-(MAX_ANCESTORS - 1))]
			: ancestors;

	return [
		...(options.workspaceName ? [{ label: options.workspaceName }] : []),
		...(options.teamspaceName ? [{ label: options.teamspaceName }] : []),
		...shownAncestors,
		{ label: page.title || "Untitled" },
	];
}
