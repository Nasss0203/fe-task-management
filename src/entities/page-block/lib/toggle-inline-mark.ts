export type InlineMark = "bold" | "italic" | "strike" | "code" | "link";

const MARKERS: Record<Exclude<InlineMark, "link">, string> = {
	bold: "**",
	italic: "*",
	strike: "~~",
	code: "`",
};

const LINK_PLACEHOLDER = "https://";

export interface MarkEdit {
	value: string;
	selectionStart: number;
	selectionEnd: number;
}

/**
 * Wraps the selection in a mark, or unwraps it when it is already wrapped.
 * An empty selection inserts the markers and puts the caret between them.
 * Links become `[selection](https://)` with the URL part selected for typing.
 */
export function toggleInlineMark(
	value: string,
	start: number,
	end: number,
	mark: InlineMark,
): MarkEdit {
	const selected = value.slice(start, end);

	if (mark === "link") {
		const label = selected || "link";
		const before = `${value.slice(0, start)}[${label}](`;
		return {
			value: `${before}${LINK_PLACEHOLDER})${value.slice(end)}`,
			selectionStart: before.length,
			selectionEnd: before.length + LINK_PLACEHOLDER.length,
		};
	}

	const marker = MARKERS[mark];
	const size = marker.length;
	const wrappedOutside =
		value.slice(start - size, start) === marker &&
		value.slice(end, end + size) === marker &&
		// `*` next to another `*` belongs to bold, not italic.
		!(mark === "italic" && (value[start - size - 1] === "*" || value[end + size] === "*"));

	if (wrappedOutside && selected) {
		return {
			value: value.slice(0, start - size) + selected + value.slice(end + size),
			selectionStart: start - size,
			selectionEnd: end - size,
		};
	}

	const wrappedInside =
		selected.length > size * 2 &&
		selected.startsWith(marker) &&
		selected.endsWith(marker);

	if (wrappedInside) {
		const inner = selected.slice(size, -size);
		return {
			value: value.slice(0, start) + inner + value.slice(end),
			selectionStart: start,
			selectionEnd: start + inner.length,
		};
	}

	return {
		value: value.slice(0, start) + marker + selected + marker + value.slice(end),
		selectionStart: start + size,
		selectionEnd: end + size,
	};
}

/** Notion's shortcuts: Ctrl/⌘ + B, I, E (code), K (link), Shift+S (strike). */
export function getShortcutMark(event: {
	key: string;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
}): InlineMark | null {
	if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;

	const key = event.key.toLowerCase();
	if (event.shiftKey) return key === "s" ? "strike" : null;

	switch (key) {
		case "b":
			return "bold";
		case "i":
			return "italic";
		case "e":
			return "code";
		case "k":
			return "link";
		default:
			return null;
	}
}
