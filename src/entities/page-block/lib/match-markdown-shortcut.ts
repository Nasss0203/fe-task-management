import { PageBlockType } from "../model/page-block.types";

export interface MarkdownShortcut {
	type: PageBlockType;
	content: Record<string, unknown> | null;
	styleConfig: Record<string, unknown> | null;
}

const SHORTCUTS: {
	prefix: string;
	type: PageBlockType;
	styleConfig?: Record<string, unknown>;
	extraContent?: Record<string, unknown>;
}[] = [
	{ prefix: "### ", type: PageBlockType.HEADER, styleConfig: { level: 3 } },
	{ prefix: "## ", type: PageBlockType.HEADER, styleConfig: { level: 2 } },
	{ prefix: "# ", type: PageBlockType.HEADER, styleConfig: { level: 1 } },
	{ prefix: "- ", type: PageBlockType.BULLETED_LIST },
	{ prefix: "* ", type: PageBlockType.BULLETED_LIST },
	{ prefix: "1. ", type: PageBlockType.NUMBERED_LIST },
	{ prefix: "[] ", type: PageBlockType.TODO, extraContent: { checked: false } },
	{ prefix: "> ", type: PageBlockType.QUOTE },
	{ prefix: "```", type: PageBlockType.CODE, extraContent: { language: "typescript" } },
	{ prefix: "---", type: PageBlockType.DIVIDER },
];

export function matchMarkdownShortcut(
	value: string,
	cursor: number,
): MarkdownShortcut | null {
	const shortcut = SHORTCUTS.find(
		(item) => cursor === item.prefix.length && value.startsWith(item.prefix),
	);

	if (!shortcut) return null;

	return {
		type: shortcut.type,
		content:
			shortcut.type === PageBlockType.DIVIDER
				? null
				: { text: value.slice(shortcut.prefix.length), ...shortcut.extraContent },
		styleConfig: shortcut.styleConfig ?? null,
	};
}
