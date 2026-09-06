export interface PageTreeBase {
	id: string;
	parent_page_id: string | null;
	title: string;
	icon: string | null;
}

export type PageTreeNode<T extends PageTreeBase> = T & {
	children: PageTreeNode<T>[];
};

export function buildPageTree<T extends PageTreeBase>(
	pages: T[],
): PageTreeNode<T>[] {
	const pageMap = new Map<string, PageTreeNode<T>>();

	for (const page of pages) {
		pageMap.set(page.id, {
			...page,
			children: [],
		});
	}

	const roots: PageTreeNode<T>[] = [];

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
