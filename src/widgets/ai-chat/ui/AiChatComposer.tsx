"use client";

import { ArrowUp, ImageIcon, MessageSquare, Plus } from "lucide-react";
import React, { useEffect, useRef } from "react";

import { Button } from "@/shared/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import type { AiChatMode } from "../model/types";

interface AiChatComposerProps {
	value: string;
	onChange: (value: string) => void;
	mode: AiChatMode;
	onModeChange: (mode: AiChatMode) => void;
	onSend: () => void;
	disabled?: boolean;
}

export function AiChatComposer({
	value,
	onChange,
	mode,
	onModeChange,
	onSend,
	disabled = false,
}: AiChatComposerProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const placeholder =
		mode === "image"
			? "Describe the image you want to generate..."
			: "Ask anything...";

	// Auto-resize textarea according to content
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
	}, [value]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			// Suppress default newline
			event.preventDefault();

			// IME composition safety check (per modern web guidance)
			if (
				event.nativeEvent.isComposing ||
				("keyCode" in event &&
					(event as unknown as { keyCode: number }).keyCode === 229)
			) {
				return;
			}

			if (value.trim() && !disabled) {
				onSend();
			}
		}
	};

	const canSend = Boolean(value.trim()) && !disabled;

	return (
		<div className='sticky bottom-0 z-10 w-full bg-background pt-2 pb-1'>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (canSend) {
						onSend();
					}
				}}
				className='relative rounded-xl border border-border/70 bg-card p-3 shadow-none transition-colors focus-within:border-ring/60 focus-within:ring-1 focus-within:ring-ring/25 sm:rounded-2xl'
			>
				<label htmlFor='ai-chat-input' className='sr-only'>
					{placeholder}
				</label>

				<textarea
					ref={textareaRef}
					id='ai-chat-input'
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					rows={1}
					disabled={disabled}
					aria-label={placeholder}
					className='block min-h-[36px] max-h-40 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-0'
				/>

				<div className='mt-2.5 flex items-center justify-between gap-2 border-t border-border/40 pt-2'>
					<div className='flex items-center gap-1'>
						<Button
							type='button'
							variant='ghost'
							size='icon-xs'
							className='size-7 rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground'
							aria-label='Add attachment'
							title='Add attachment'
						>
							<Plus className='size-3.5' />
						</Button>

						<Select
							value={mode}
							onValueChange={(val) => onModeChange(val as AiChatMode)}
						>
							<SelectTrigger
								size='sm'
								aria-label='Select AI mode'
								className='h-7 gap-1 rounded-md border-0 bg-transparent px-2 text-xs font-medium text-muted-foreground shadow-none hover:bg-accent/50 hover:text-foreground'
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className='rounded-lg border-border/60 bg-popover'>
								<SelectItem value='text'>
									<span className='flex items-center gap-1.5'>
										<MessageSquare className='size-3.5 text-muted-foreground' />
										<span>Text</span>
									</span>
								</SelectItem>
								<SelectItem value='image'>
									<span className='flex items-center gap-1.5'>
										<ImageIcon className='size-3.5 text-muted-foreground' />
										<span>Image</span>
									</span>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button
						type='submit'
						size='icon-xs'
						disabled={!canSend}
						aria-label='Send message'
						className='flex size-7 items-center justify-center rounded-md bg-foreground text-background shadow-none transition-opacity hover:bg-foreground/90 disabled:opacity-30 disabled:hover:bg-foreground'
					>
						<ArrowUp className='size-3.5' />
					</Button>
				</div>
			</form>
		</div>
	);
}
