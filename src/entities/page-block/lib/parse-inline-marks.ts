export type InlineNode =
	| { type: "text"; text: string }
	| { type: "code"; text: string }
	| { type: "bold" | "italic" | "strike"; children: InlineNode[] }
	| { type: "link"; href: string; children: InlineNode[] };

const ESCAPABLE = "\\*~`[]()_";
const LINK = /^\[([^\]]+)]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/i;
const AUTOLINK = /^(?:https?:\/\/|mailto:)[^\s<>]+[^\s<>.,;:!?)\]'"]/i;

const WRAPPERS = [
	{ marker: "**", type: "bold" },
	{ marker: "~~", type: "strike" },
	{ marker: "*", type: "italic" },
] as const;

/**
 * Markdown-style inline marks stored in a block's plain text:
 * **bold**, *italic*, ~~strike~~, `code`, [label](https://…) and bare URLs.
 * Unclosed markers stay literal text.
 */
export function parseInlineMarks(text: string): InlineNode[] {
	const nodes: InlineNode[] = [];
	let buffer = "";
	let index = 0;

	const flush = () => {
		if (buffer) nodes.push({ type: "text", text: buffer });
		buffer = "";
	};

	while (index < text.length) {
		const rest = text.slice(index);
		const char = text[index];

		if (char === "\\" && ESCAPABLE.includes(text[index + 1] ?? "")) {
			buffer += text[index + 1];
			index += 2;
			continue;
		}

		if (char === "`") {
			const close = text.indexOf("`", index + 1);
			if (close > index + 1) {
				flush();
				nodes.push({ type: "code", text: text.slice(index + 1, close) });
				index = close + 1;
				continue;
			}
		}

		const wrapper = WRAPPERS.find(({ marker }) => rest.startsWith(marker));
		if (wrapper) {
			const close = findClosing(text, wrapper.marker, index + wrapper.marker.length);
			if (close !== -1) {
				flush();
				nodes.push({
					type: wrapper.type,
					children: parseInlineMarks(
						text.slice(index + wrapper.marker.length, close),
					),
				});
				index = close + wrapper.marker.length;
				continue;
			}
		}

		if (char === "[") {
			const link = LINK.exec(rest);
			if (link) {
				flush();
				nodes.push({
					type: "link",
					href: link[2],
					children: parseInlineMarks(link[1]),
				});
				index += link[0].length;
				continue;
			}
		}

		const previous = text[index - 1];
		if (!previous || /\s|\(/.test(previous)) {
			const url = AUTOLINK.exec(rest);
			if (url) {
				flush();
				nodes.push({
					type: "link",
					href: url[0],
					children: [{ type: "text", text: url[0] }],
				});
				index += url[0].length;
				continue;
			}
		}

		buffer += char;
		index += 1;
	}

	flush();
	return nodes;
}

/** Closing marker with non-empty content; a single `*` must not be half of `**`. */
function findClosing(text: string, marker: string, from: number): number {
	let index = text.indexOf(marker, from);

	while (index !== -1) {
		// In `***`, bold closes on the last two stars so an inner italic can close first.
		while (marker === "**" && text[index + 2] === "*") index += 1;

		const isPartOfBold =
			marker === "*" &&
			(text[index + 1] === "*" || text[index - 1] === "*");

		if (index > from && text[index - 1] !== "\\" && !isPartOfBold) {
			return index;
		}

		index = text.indexOf(marker, index + 1);
	}

	return -1;
}

export const hasInlineMarks = (text: string) =>
	parseInlineMarks(text).some((node) => node.type !== "text");
