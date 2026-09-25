import type { Page } from "@/entities/page/model/page.types";

export function collectDescendantIds(
	pages: Page[],
	rootPageId: string,
): Set<string> {
	const childrenMap = new Map<string, string[]>();

	for (const page of pages) {
		if (!page.parent_page_id) {
			continue;
		}

		const children = childrenMap.get(page.parent_page_id) ?? [];

		children.push(page.id);
		childrenMap.set(page.parent_page_id, children);
	}

	const descendantIds = new Set<string>();
	const visitedIds = new Set([rootPageId]);
	const pendingIds = [rootPageId];

	while (pendingIds.length > 0) {
		const parentId = pendingIds.pop();

		if (!parentId) {
			continue;
		}

		for (const childId of childrenMap.get(parentId) ?? []) {
			if (visitedIds.has(childId)) {
				continue;
			}

			visitedIds.add(childId);
			descendantIds.add(childId);
			pendingIds.push(childId);
		}
	}

	return descendantIds;
}
