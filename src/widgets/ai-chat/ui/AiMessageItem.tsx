"use client";

import { Sparkles } from "lucide-react";

import type { AiChatMessage } from "../model/types";
import { AiPageCompositionPreview } from "./AiPageCompositionPreview";

interface AiMessageItemProps {
	message: AiChatMessage;
	disabled?: boolean;
	onConfirmPageComposition: (generationId: string) => void;
	onDiscardGeneration: (generationId: string) => void;
}

export function AiMessageItem({
	message,
	disabled = false,
	onConfirmPageComposition,
	onDiscardGeneration,
}: AiMessageItemProps) {
	const isUser = message.role === "user";

	if (isUser) {
		return (
			<div className='flex w-full justify-end'>
				<div className='max-w-[75%] rounded-2xl rounded-tr-xs bg-muted px-4 py-2.5 text-sm text-foreground'>
					<p className='whitespace-pre-wrap break-words leading-relaxed'>
						{message.content}
					</p>
				</div>
			</div>
		);
	}

	const generation = message.generation;

	const isPageComposition =
		generation?.capability === "GENERATE_PAGE_COMPOSITION";

	return (
		<div className='flex w-full items-start gap-3'>
			<div className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/80 text-foreground/80'>
				<Sparkles className='size-3.5' />
			</div>

			<div className='flex-1 space-y-2.5 overflow-hidden pt-0.5'>
				{message.content && (
					<p className='whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground'>
						{message.content}
					</p>
				)}

				{isPageComposition && generation && (
					<AiPageCompositionPreview
						generation={generation}
						disabled={disabled}
						onConfirm={onConfirmPageComposition}
						onDiscard={onDiscardGeneration}
					/>
				)}
			</div>
		</div>
	);
}
