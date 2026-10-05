"use client";

import {
	AlignLeft,
	ArrowUp,
	ListPlus,
	Maximize2,
	MessageSquareMore,
	Minimize2,
	Plus,
	WandSparkles,
} from "lucide-react";
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

function getPlaceholder(mode: AiChatMode): string {
	switch (mode) {
		case "GENERATE_PAGE_COMPOSITION":
			return "Describe the page you want AI to create...";

		case "writing.improve":
			return "Enter text you want to improve...";

		case "writing.shorten":
			return "Enter text you want to shorten...";

		case "writing.expand":
			return "Enter text you want to expand...";

		case "writing.summarize":
			return "Enter text you want to summarize...";

		case "writing.continue":
			return "Enter text you want AI to continue...";

		case "writing.translate":
			return "Enter text you want to translate...";

		default:
			return "Enter your text...";
	}
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

	const placeholder = getPlaceholder(mode);

	useEffect(() => {
		const textarea = textareaRef.current;

		if (!textarea) {
			return;
		}

		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
	}, [value]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key !== "Enter" || event.shiftKey) {
			return;
		}

		event.preventDefault();

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
	};

	const canSend = Boolean(value.trim()) && !disabled;

	return (
		<div className='sticky bottom-0 z-10 w-full bg-background pt-2 pb-1'>
			<form
				onSubmit={(event) => {
					event.preventDefault();

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
					onChange={(event) => onChange(event.target.value)}
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
							onValueChange={(value) =>
								onModeChange(value as AiChatMode)
							}
						>
							<SelectTrigger
								size='sm'
								aria-label='Select AI capability'
								className='h-7 gap-1 rounded-md border-0 bg-transparent px-2 text-xs font-medium text-muted-foreground shadow-none hover:bg-accent/50 hover:text-foreground'
							>
								<SelectValue />
							</SelectTrigger>

							<SelectContent className='rounded-lg border-border/60 bg-popover'>
								<SelectItem value='GENERATE_PAGE_COMPOSITION'>
									<span className='flex items-center gap-1.5'>
										<ListPlus className='size-3.5 text-muted-foreground' />
										<span>Create page</span>
									</span>
								</SelectItem>

								<SelectItem value='writing.improve'>
									<span className='flex items-center gap-1.5'>
										<WandSparkles className='size-3.5 text-muted-foreground' />
										<span>Improve</span>
									</span>
								</SelectItem>

								<SelectItem value='writing.shorten'>
									<span className='flex items-center gap-1.5'>
										<Minimize2 className='size-3.5 text-muted-foreground' />
										<span>Shorten</span>
									</span>
								</SelectItem>

								<SelectItem value='writing.expand'>
									<span className='flex items-center gap-1.5'>
										<Maximize2 className='size-3.5 text-muted-foreground' />
										<span>Expand</span>
									</span>
								</SelectItem>

								<SelectItem value='writing.summarize'>
									<span className='flex items-center gap-1.5'>
										<AlignLeft className='size-3.5 text-muted-foreground' />
										<span>Summarize</span>
									</span>
								</SelectItem>

								<SelectItem value='writing.continue'>
									<span className='flex items-center gap-1.5'>
										<MessageSquareMore className='size-3.5 text-muted-foreground' />
										<span>Continue</span>
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
