import type { Page } from "../model/page.types";

export interface PageTreeNode extends Page {
	children: PageTreeNode[];
}

export function buildPageTree(pages: Page[]): PageTreeNode[] {
	const pageMap = new Map<string, PageTreeNode>();

	for (const page of pages) {
		pageMap.set(page.id, {
			...page,
			children: [],
		});
	}

	const roots: PageTreeNode[] = [];

	for (const page of pages) {
		const node = pageMap.get(page.id);

		if (!node) {
			continue;
		}

		if (!page.parent_page_id) {
			roots.push(node);
			continue;
		}

		const parent = pageMap.get(page.parent_page_id);

		if (!parent) {
			roots.push(node);
			continue;
		}

		parent.children.push(node);
	}

	return roots;
}
