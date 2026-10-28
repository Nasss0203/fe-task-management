"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

interface CommentComposerProps {
	placeholder: string;
	initialValue?: string;
	submitLabel: string;
	/** Tên người đang viết; có thì hiện avatar bên trái như Notion. */
	authorName?: string;
	pending?: boolean;
	autoFocus?: boolean;
	className?: string;
	onSubmit: (body: string) => Promise<unknown>;
	onCancel?: () => void;
}

export function CommentComposer({
	placeholder,
	initialValue = "",
	submitLabel,
	authorName,
	pending = false,
	autoFocus = false,
	className,
	onSubmit,
	onCancel,
}: CommentComposerProps) {
	const [value, setValue] = useState(initialValue);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const body = value.trim();

	// Tự cao lên theo số dòng
	useEffect(() => {
		const textarea = textareaRef.current;

		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	}, [value]);

	const submit = async () => {
		if (!body || pending) return;

		await onSubmit(body);

		setValue("");
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

			<div className='flex min-w-0 flex-1 items-end gap-2'>
				<textarea
					ref={textareaRef}
					value={value}
					rows={1}
					autoFocus={autoFocus}
					placeholder={placeholder}
					aria-label={placeholder}
					onChange={(event) => setValue(event.target.value)}
					onKeyDown={(event) => {
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
					className='block max-h-48 min-h-7 w-full resize-none overflow-y-auto bg-transparent py-0.5 text-sm leading-6 outline-none placeholder:text-muted-foreground/60'
				/>

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
