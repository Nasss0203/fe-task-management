import type { PageBlock } from "../model/page-block.types";
import { assignListNumbers } from "./assign-list-numbers";
import { assignTocHeadings, type TocHeading } from "./assign-toc-headings";

export interface PageBlockNode extends PageBlock {
	children: PageBlockNode[];
	list_number?: number;
	toc_headings?: TocHeading[];
}

export function buildPageBlockTree(blocks: PageBlock[]): PageBlockNode[] {
	const nodeMap = new Map<string, PageBlockNode>();

	for (const block of blocks) {
		nodeMap.set(block.id, {
			...block,
			children: [],
		});
	}

	const roots: PageBlockNode[] = [];

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

	const sortNodes = (nodes: PageBlockNode[]) => {
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
