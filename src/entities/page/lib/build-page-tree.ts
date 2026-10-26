import type { WorkspaceDatabase } from "../model/page.types";

export interface PageTreeBase {
	id: string;
	parent_page_id: string | null;
	title: string;
	icon: string | null;
	kind?: "database";
}

export type PageTreeNode<T extends PageTreeBase> = T & {
	children: PageTreeNode<T>[];
};

export interface PageTreeDatabaseNode extends PageTreeBase {
	kind: "database";
}

/**
 * Appends databases as children of their page, after the child pages.
 * Databases whose page is not in `pages` are dropped so they never
 * surface as roots of another section.
 */
export function withDatabaseNodes<T extends PageTreeBase>(
	pages: T[],
	databases: WorkspaceDatabase[],
): (T | PageTreeDatabaseNode)[] {
	const pageIds = new Set(pages.map((page) => page.id));

	return [
		...pages,
		...databases
			.filter((database) => pageIds.has(database.pageId))
			.map(
				(database): PageTreeDatabaseNode => ({
					id: database.id,
					parent_page_id: database.pageId,
					title: database.name,
					icon: null,
					kind: "database",
				}),
			),
	];
}

export function getPageTreeHref(node: PageTreeBase) {
	return node.kind === "database"
		? `/database/${node.id}`
		: `/page/${node.id}`;
}

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
