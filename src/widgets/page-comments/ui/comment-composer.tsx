"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import {
	displayToTokens,
	type MentionRef,
	splitDisplayMentions,
	tokensToDisplay,
} from "@/entities/comment/lib/mention-text";
import { useMentionCandidates } from "@/entities/comment/model/comment.queries";
import type { MentionCandidate } from "@/entities/comment/model/comment.types";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

interface CommentComposerProps {
	placeholder: string;
	initialValue?: string;
	submitLabel: string;
	/** Tên người đang viết; có thì hiện avatar bên trái như Notion. */
	authorName?: string;
	/** Page để gợi ý người khi gõ `@`; không truyền thì tắt mention. */
	mentionPageId?: string;
	pending?: boolean;
	autoFocus?: boolean;
	className?: string;
	onSubmit: (body: string) => Promise<unknown>;
	onCancel?: () => void;
}

/** `@abc` ngay trước con trỏ (đầu dòng hoặc sau khoảng trắng). */
function findMentionQuery(
	text: string,
	caret: number,
): { start: number; search: string } | null {
	const match = text.slice(0, caret).match(/(?:^|\s)@([^\s@]{0,30})$/);

	return match ? { start: caret - match[1].length - 1, search: match[1] } : null;
}

export function CommentComposer({
	placeholder,
	initialValue = "",
	submitLabel,
	authorName,
	mentionPageId,
	pending = false,
	autoFocus = false,
	className,
	onSubmit,
	onCancel,
}: CommentComposerProps) {
	const [initial] = useState(() => tokensToDisplay(initialValue));
	const [value, setValue] = useState(initial.text);
	const [mentions, setMentions] = useState<MentionRef[]>(initial.mentions);
	const [mentionQuery, setMentionQuery] = useState<{
		start: number;
		search: string;
	} | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const listboxId = useId();
	const overlayRef = useRef<HTMLDivElement>(null);

	const search = useDebounce(mentionQuery?.search ?? "", 200);
	const { data: candidates = [] } = useMentionCandidates(
		mentionPageId ?? "",
		search,
		Boolean(mentionPageId && mentionQuery),
	);
	const suggestions = mentionQuery ? candidates : [];

	const body = value.trim();
	const hasMentions = mentions.length > 0;

	// Tự cao lên theo số dòng
	useEffect(() => {
		const textarea = textareaRef.current;

		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	}, [value]);

	const updateMentionQuery = (text: string, caret: number) => {
		setMentionQuery(mentionPageId ? findMentionQuery(text, caret) : null);
		setActiveIndex(0);
	};

	const pickMention = (user: MentionCandidate) => {
		const textarea = textareaRef.current;

		if (!mentionQuery || !textarea) return;

		const caret = textarea.selectionStart;
		const inserted = `@${user.username} `;
		const next =
			value.slice(0, mentionQuery.start) + inserted + value.slice(caret);

		setValue(next);
		setMentions((current) => [
			...current,
			{ id: user.id, name: user.username },
		]);
		setMentionQuery(null);

		const nextCaret = mentionQuery.start + inserted.length;

		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(nextCaret, nextCaret);
		});
	};

	const submit = async () => {
		if (!body || pending) return;

		await onSubmit(displayToTokens(body, mentions));

		setValue("");
		setMentions([]);
		setMentionQuery(null);
	};

	return (
		<div className={cn("flex items-start gap-2.5", className)}>
			{authorName && (
				<Avatar className='mt-0.5 size-6 shrink-0'>
					<AvatarFallback className='bg-primary/15 text-[11px] font-medium text-primary'>
						{authorName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			)}

			<div className='relative flex min-w-0 flex-1 items-end gap-2'>
				<div className='relative min-w-0 flex-1'>
					{/*
					 * Textarea không tô màu từng đoạn được: lớp phủ phía dưới vẽ lại chữ (cùng font, khoảng cách)
					 * với `@Tên` đã chọn được tô màu; chữ của textarea trong suốt, chỉ còn con trỏ.
					 * Mention không đổi đậm / padding để chữ hai lớp luôn trùng nhau.
					 */}
					{hasMentions && (
						<div
							ref={overlayRef}
							aria-hidden='true'
							className='pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words py-0.5 text-sm leading-6 text-foreground'
						>
							{splitDisplayMentions(value, mentions).map((part, index) =>
								part.mention ? (
									<span key={index} className='rounded-sm bg-primary/15 text-primary'>
										{part.text}
									</span>
								) : (
									part.text
								),
							)}
							{/* Dòng cuối trống vẫn có chiều cao như trong textarea */}
							{"​"}
						</div>
					)}
					<textarea
						ref={textareaRef}
						onScroll={(event) => {
							if (overlayRef.current) {
								overlayRef.current.scrollTop = event.currentTarget.scrollTop;
							}
						}}
						value={value}
						rows={1}
						autoFocus={autoFocus}
						placeholder={placeholder}
						aria-label={placeholder}
						// Có gợi ý mention thì ô nhập là combobox điều khiển danh sách bên dưới
						role={mentionPageId ? "combobox" : undefined}
						aria-expanded={mentionPageId ? suggestions.length > 0 : undefined}
						aria-controls={mentionPageId ? listboxId : undefined}
						aria-autocomplete={mentionPageId ? "list" : undefined}
						onChange={(event) => {
							setValue(event.target.value);
							updateMentionQuery(
								event.target.value,
								event.target.selectionStart,
							);
						}}
						onKeyDown={(event) => {
							if (suggestions.length > 0) {
								if (event.key === "ArrowDown" || event.key === "ArrowUp") {
									event.preventDefault();
									const step = event.key === "ArrowDown" ? 1 : -1;
									setActiveIndex(
										(index) =>
											(index + step + suggestions.length) % suggestions.length,
									);
									return;
								}

								if (event.key === "Enter" || event.key === "Tab") {
									event.preventDefault();
									pickMention(suggestions[activeIndex] ?? suggestions[0]);
									return;
								}

								if (event.key === "Escape") {
									event.preventDefault();
									setMentionQuery(null);
									return;
								}
							}

							// Enter gửi, Shift+Enter xuống dòng; bỏ qua Enter chốt chữ của bộ gõ tiếng Việt
							if (
								event.key === "Enter" &&
								!event.shiftKey &&
								!event.nativeEvent.isComposing
							) {
								event.preventDefault();
								void submit();
							}

							if (event.key === "Escape" && onCancel) {
								event.preventDefault();
								onCancel();
							}
						}}
						className={cn(
							"relative block max-h-48 min-h-7 w-full resize-none overflow-y-auto break-words bg-transparent py-0.5 text-sm leading-6 outline-none placeholder:text-muted-foreground/60",
							hasMentions && "text-transparent caret-foreground",
						)}
					/>
				</div>

				{suggestions.length > 0 && (
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
								// mousedown để chọn trước khi textarea mất focus
								onMouseDown={(event) => {
									event.preventDefault();
									pickMention(user);
								}}
								onMouseEnter={() => setActiveIndex(index)}
								className={cn(
									"flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm",
									index === activeIndex && "bg-accent text-accent-foreground",
								)}
							>
								<Avatar className='size-5 shrink-0'>
									<AvatarFallback className='bg-primary/15 text-[10px] text-primary'>
										{user.username.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<span className='truncate'>{user.username}</span>
								<span className='ml-auto truncate text-xs text-muted-foreground'>
									{user.email}
								</span>
							</li>
						))}
					</ul>
				)}

				{onCancel && (
					<button
						type='button'
						onClick={onCancel}
						className='mb-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground'
					>
						Cancel
					</button>
				)}

				<button
					type='button'
					aria-label={submitLabel}
					disabled={!body || pending}
					onClick={() => void submit()}
					className='mb-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors disabled:bg-muted disabled:text-muted-foreground/60'
				>
					<ArrowUp className='size-3.5' />
				</button>
			</div>
		</div>
	);
}
