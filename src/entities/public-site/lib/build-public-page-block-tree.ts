import { assignListNumbers } from "@/entities/page-block/lib/assign-list-numbers";
import {
	assignTocHeadings,
	type TocHeading,
} from "@/entities/page-block/lib/assign-toc-headings";
import type { PublicPageBlock } from "../model/public-site.types";

export interface PublicPageBlockNode extends PublicPageBlock {
	children: PublicPageBlockNode[];
	list_number?: number;
	toc_headings?: TocHeading[];
}

export function buildPublicPageBlockTree(
	blocks: PublicPageBlock[],
): PublicPageBlockNode[] {
	const nodeMap = new Map<string, PublicPageBlockNode>();

	for (const block of blocks) {
		nodeMap.set(block.id, {
			...block,
			children: [],
		});
	}

	const roots: PublicPageBlockNode[] = [];

	for (const block of blocks) {
		const node = nodeMap.get(block.id);

		if (!node) continue;

		if (!block.parent_block_id) {
			roots.push(node);
			continue;
		}

		const parent = nodeMap.get(block.parent_block_id);

		if (!parent) {
			roots.push(node);
			continue;
		}

		parent.children.push(node);
	}

	const sortNodes = (nodes: PublicPageBlockNode[]) => {
		nodes.sort((a, b) => a.order_index - b.order_index);
		assignListNumbers(nodes);

		for (const node of nodes) {
			sortNodes(node.children);
		}
	};

	sortNodes(roots);
	assignTocHeadings(roots);

	return roots;
}
