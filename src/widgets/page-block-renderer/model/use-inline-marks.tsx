"use client";

import { useState, type KeyboardEvent } from "react";

import { hasInlineMarks } from "@/entities/page-block/lib/parse-inline-marks";
import {
	getShortcutMark,
	toggleInlineMark,
} from "@/entities/page-block/lib/toggle-inline-mark";
import { ReadOnlyRichText } from "@/entities/page-block/ui/read-only-block-content";
import { cn } from "@/shared/lib/utils";

/**
 * Inline marks for a block textarea: Ctrl/⌘+B/I/E/K and Ctrl/⌘+Shift+S wrap the
 * selection in markdown markers, and while the textarea is not focused the
 * formatted text is shown in its place. The stored value stays plain text.
 */
export function useInlineMarks(
	value: string,
	setValue: (value: string) => void,
	previewClassName?: string,
) {
	const [focused, setFocused] = useState(false);
	const showPreview = !focused && hasInlineMarks(value);

	/** Returns true when the key was a formatting shortcut. */
	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		const mark = getShortcutMark(event);
		if (!mark) return false;

		event.preventDefault();
		const textarea = event.currentTarget;
		const edit = toggleInlineMark(
			value,
			textarea.selectionStart,
			textarea.selectionEnd,
			mark,
		);
		setValue(edit.value);
		requestAnimationFrame(() =>
			textarea.setSelectionRange(edit.selectionStart, edit.selectionEnd),
		);
		return true;
	};

	// The preview sits next to its textarea, so no ref has to be shared.
	const focusAtEnd = (preview: HTMLElement) => {
		const textarea = preview.parentElement?.querySelector("textarea");
		if (!textarea) return;
		setFocused(true);
		textarea.focus();
		textarea.setSelectionRange(value.length, value.length);
	};

	return {
		handleKeyDown,
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false),
		/** Keeps the textarea focusable but invisible while the preview shows. */
		textareaClassName: showPreview
			? "pointer-events-none absolute inset-0 opacity-0"
			: undefined,
		preview: showPreview ? (
			<div
				className={cn(
					"min-h-7 cursor-text whitespace-pre-wrap break-words",
					previewClassName,
				)}
				onMouseDown={(event) => {
					if ((event.target as HTMLElement).closest("a")) return;
					event.preventDefault();
					focusAtEnd(event.currentTarget);
				}}
			>
				<ReadOnlyRichText text={value} />
			</div>
		) : null,
	};
}
