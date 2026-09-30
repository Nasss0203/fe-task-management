import type {
	PublicNavigationNode,
	PublicNavigationPage,
} from "../model/public-site.types";

export function normalizeNavigationPath(path?: string | null): string {
	if (!path || path === "" || path === "/") return "/";
	const trimmed = path.trim();
	const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	return withLeading.length > 1 && withLeading.endsWith("/")
		? withLeading.slice(0, -1)
		: withLeading;
}

export function buildPublicNavigationTree(
	pages: PublicNavigationPage[],
): PublicNavigationNode[] {
	const map = new Map<string, PublicNavigationNode>();

	for (const page of pages) {
		map.set(page.page_id, {
			...page,
			children: [],
		});
	}

	const roots: PublicNavigationNode[] = [];

	for (const page of pages) {
		const node = map.get(page.page_id);
		if (!node) continue;

		if (!page.navigation_parent_id) {
			roots.push(node);
		} else {
			const parent = map.get(page.navigation_parent_id);
			if (parent) {
				parent.children.push(node);
			} else {
				// If declared navigation parent is not present in public navigation list,
				// fall back to root so the page remains accessible
				roots.push(node);
			}
		}
	}

	return roots;
}

export function getAncestorPageIds(
	pages: PublicNavigationPage[],
	targetPath: string,
): Set<string> {
	const ancestorIds = new Set<string>();
	const normalizedTarget = normalizeNavigationPath(targetPath);
	const pageMap = new Map<string, PublicNavigationPage>();
	let targetPageId: string | null = null;

	for (const page of pages) {
		pageMap.set(page.page_id, page);
		if (normalizeNavigationPath(page.path) === normalizedTarget) {
			targetPageId = page.page_id;
		}
		// Expand root items by default
		if (!page.navigation_parent_id) {
			ancestorIds.add(page.page_id);
		}
	}

	let current = targetPageId ? pageMap.get(targetPageId) : null;
	while (current && current.navigation_parent_id) {
		ancestorIds.add(current.navigation_parent_id);
		current = pageMap.get(current.navigation_parent_id) ?? null;
	}

	return ancestorIds;
}
