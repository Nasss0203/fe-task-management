"use client";

import { FileText } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import {
	displayToTokens,
	findMentionQuery,
	findPageMentionIds,
	type MentionRef,
	pageMentionsToDisplay,
	tokensToDisplay,
} from "@/entities/comment/lib/mention-text";
import { useMentionCandidates } from "@/entities/comment/model/comment.queries";
import type { MentionCandidate } from "@/entities/comment/model/comment.types";
import {
	usePage,
	usePageMentionTitles,
	usePageSearch,
} from "@/entities/page/model/page.queries";
import type {
	PageMentionTitle,
	PageSearchResult,
} from "@/entities/page/model/page.types";
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

type Suggestion =
	| { kind: "user"; id: string; user: MentionCandidate }
	| { kind: "page"; id: string; page: PageSearchResult };

const GROUP_LIMIT = 5;

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
	const [pickedPages, setPickedPages] = useState<
		Record<string, PageMentionTitle>
	>({});
	const listboxId = useId();

	const { data: page } = usePage(pageId, enabled);
	const workspaceId = page?.workspace_id;
	const { data: storedTitles } = usePageMentionTitles(
		workspaceId,
		findPageMentionIds(storedText),
		enabled,
	);
	const pageTitles = enabled ? { ...pickedPages, ...storedTitles } : undefined;

	const userDisplay = tokensToDisplay(storedText);
	const pageDisplay = pageMentionsToDisplay(userDisplay.text, pageTitles ?? {});
	const known = [...userDisplay.mentions, ...pageDisplay.mentions, ...picked];

	if (pageDisplay.text !== userDisplay.text && value === userDisplay.text) {
		setValue(pageDisplay.text);
	}

	const search = useDebounce(query?.search ?? "", 200);
	const open = enabled && query !== null;
	const { data: candidates = [] } = useMentionCandidates(pageId, search, open);
	const { data: pages = [] } = usePageSearch(workspaceId, search, open);

	const suggestions: Suggestion[] = query
		? [
				...candidates
					.slice(0, GROUP_LIMIT)
					.map((user) => ({ kind: "user" as const, id: user.id, user })),
				...pages
					.filter((result) => result.pageId !== pageId)
					.slice(0, GROUP_LIMIT)
					.map((result) => ({
						kind: "page" as const,
						id: result.pageId,
						page: result,
					})),
			]
		: [];

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

	const pick = (suggestion: Suggestion) => {
		if (!query) return;

		const mention: MentionRef =
			suggestion.kind === "user"
				? { id: suggestion.id, name: suggestion.user.username }
				: {
						id: suggestion.id,
						name: suggestion.page.title || "Untitled",
						kind: "page",
					};
		const inserted = `@${mention.name} `;
		const next = value.slice(0, query.start) + inserted + value.slice(query.end);
		const caret = query.start + inserted.length;
		const textarea = textareaRef.current;

		if (suggestion.kind === "page") {
			setPickedPages((current) => ({
				...current,
				[suggestion.id]: {
					pageId: suggestion.id,
					title: suggestion.page.title,
					icon: suggestion.page.icon,
				},
			}));
		}
		setPicked((current) => [...current, mention]);
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

	const renderOption = (suggestion: Suggestion, index: number) => (
		<li
			key={`${suggestion.kind}-${suggestion.id}`}
			role='option'
			aria-selected={index === activeIndex}
			onMouseDown={(event) => {
				event.preventDefault();
				pick(suggestion);
			}}
			onMouseEnter={() => setActiveIndex(index)}
			className={cn(
				"flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm",
				index === activeIndex && "bg-accent text-accent-foreground",
			)}
		>
			{suggestion.kind === "user" ? (
				<>
					<Avatar className='size-5 shrink-0'>
						<AvatarFallback className='bg-ring text-[9px] font-semibold text-white'>
							{suggestion.user.username.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className='max-w-[65%] shrink-0 truncate'>
						{suggestion.user.username}
					</span>
					<span className='min-w-0 flex-1 truncate text-right text-xs text-muted-foreground'>
						{suggestion.user.email}
					</span>
				</>
			) : (
				<>
					<span className='flex size-5 shrink-0 items-center justify-center text-muted-foreground'>
						{suggestion.page.icon ?? <FileText className='size-4' />}
					</span>
					<span className='min-w-0 flex-1 truncate'>
						{suggestion.page.title || "Untitled"}
					</span>
				</>
			)}
		</li>
	);

	const firstPageIndex = suggestions.findIndex((item) => item.kind === "page");

	return {
		toStored,
		pageTitles,
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
					aria-label='Mention a person or page'
					className='absolute left-0 top-full z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md'
				>
					{suggestions.map((suggestion, index) => [
						index === 0 && suggestion.kind === "user" ? (
							<li
								key='people'
								role='presentation'
								className='px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground'
							>
								People
							</li>
						) : null,
						index === firstPageIndex ? (
							<li
								key='pages'
								role='presentation'
								className='px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground'
							>
								Pages
							</li>
						) : null,
						renderOption(suggestion, index),
					])}
				</ul>
			) : null,
	};
}
