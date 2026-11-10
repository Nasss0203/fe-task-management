"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import {
	displayToTokens,
	findMentionQuery,
	type MentionRef,
	tokensToDisplay,
} from "@/entities/comment/lib/mention-text";
import { useMentionCandidates } from "@/entities/comment/model/comment.queries";
import type { MentionCandidate } from "@/entities/comment/model/comment.types";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

interface UseBlockMentionsOptions {
	pageId: string;
	enabled: boolean;
	storedText: string;
	value: string;
	setValue: (value: string) => void;
}

type TextField = HTMLTextAreaElement | HTMLInputElement;

interface MentionQuery {
	start: number;
	end: number;
	search: string;
}

export function useBlockMentions({
	pageId,
	enabled,
	storedText,
	value,
	setValue,
}: UseBlockMentionsOptions) {
	const textareaRef = useRef<TextField | null>(null);
	const [query, setQuery] = useState<MentionQuery | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const [picked, setPicked] = useState<MentionRef[]>([]);
	const listboxId = useId();
	const known = [...tokensToDisplay(storedText).mentions, ...picked];

	const search = useDebounce(query?.search ?? "", 200);
	const { data: candidates = [] } = useMentionCandidates(
		pageId,
		search,
		enabled && query !== null,
	);
	const suggestions = query ? candidates : [];

	const toStored = (display: string) => displayToTokens(display, known);

	const close = () => setQuery(null);

	const track = (textarea: TextField) => {
		textareaRef.current = textarea;

		if (!enabled) return;

		const caret = textarea.selectionStart ?? textarea.value.length;
		const found = findMentionQuery(textarea.value, caret);

		setQuery(found ? { ...found, end: caret } : null);
		setActiveIndex(0);
	};

	const pick = (user: MentionCandidate) => {
		if (!query) return;

		const inserted = `@${user.username} `;
		const next = value.slice(0, query.start) + inserted + value.slice(query.end);
		const caret = query.start + inserted.length;
		const textarea = textareaRef.current;

		setPicked((current) => [...current, { id: user.id, name: user.username }]);
		setValue(next);
		setQuery(null);

		requestAnimationFrame(() => {
			textarea?.focus();
			textarea?.setSelectionRange(caret, caret);
		});
	};

	const handleKeyDown = (event: KeyboardEvent<TextField>) => {
		if (suggestions.length === 0 || event.nativeEvent.isComposing) {
			return false;
		}

		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			const step = event.key === "ArrowDown" ? 1 : -1;
			setActiveIndex(
				(index) => (index + step + suggestions.length) % suggestions.length,
			);
			return true;
		}

		if (event.key === "Enter" || event.key === "Tab") {
			event.preventDefault();
			pick(suggestions[activeIndex] ?? suggestions[0]);
			return true;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			close();
			return true;
		}

		return false;
	};

	return {
		toStored,
		track,
		close,
		handleKeyDown,
		comboboxProps: enabled
			? {
					role: "combobox" as const,
					"aria-expanded": suggestions.length > 0,
					"aria-controls": listboxId,
					"aria-autocomplete": "list" as const,
				}
			: {},
		menu:
			suggestions.length > 0 ? (
				<ul
					id={listboxId}
					role='listbox'
					aria-label='Mention someone'
					className='absolute left-0 top-full z-50 mt-1 max-h-56 w-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md'
				>
					{suggestions.map((user, index) => (
						<li
							key={user.id}
							role='option'
							aria-selected={index === activeIndex}
							onMouseDown={(event) => {
								event.preventDefault();
								pick(user);
							}}
							onMouseEnter={() => setActiveIndex(index)}
							className={cn(
								"flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm",
								index === activeIndex && "bg-accent text-accent-foreground",
							)}
						>
							<Avatar className='size-5 shrink-0'>
								<AvatarFallback className='bg-ring text-[9px] font-semibold text-white'>
									{user.username.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className='max-w-[65%] shrink-0 truncate'>
								{user.username}
							</span>
							<span className='min-w-0 flex-1 truncate text-right text-xs text-muted-foreground'>
								{user.email}
							</span>
						</li>
					))}
				</ul>
			) : null,
	};
}
