export interface TocHeading {
	id: string;
	text: string;
	level: number;
}

interface TocNode {
	id: string;
	type: string;
	content?: unknown;
	style_config?: Record<string, unknown> | null;
	children?: TocNode[];
	toc_headings?: TocHeading[];
}

function getHeading(node: TocNode): TocHeading {
	const content = node.content as Record<string, unknown> | null | undefined;
	const level = Number(node.style_config?.level);

	return {
		id: node.id,
		text: typeof content?.text === "string" ? content.text : "",
		level: level === 2 || level === 3 ? level : 1,
	};
}

export function assignTocHeadings(roots: TocNode[]) {
	const headings: TocHeading[] = [];
	const tocNodes: TocNode[] = [];

	const walk = (nodes: TocNode[]) => {
		for (const node of nodes) {
			const type = node.type.toUpperCase();

			if (type === "HEADER" || type === "HEADING") headings.push(getHeading(node));
			if (type === "TABLE_OF_CONTENTS") tocNodes.push(node);

			walk(node.children ?? []);
		}
	};

	walk(roots);

	for (const node of tocNodes) {
		node.toc_headings = headings;
	}
}
