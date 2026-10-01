"use client";

import { Sparkles } from "lucide-react";

import type { AiChatMessage } from "../model/types";

interface AiMessageItemProps {
	message: AiChatMessage;
}

export function AiMessageItem({ message }: AiMessageItemProps) {
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

	return (
		<div className='flex w-full items-start gap-3'>
			<div className='flex size-6 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/80 text-foreground/80 mt-0.5'>
				<Sparkles className='size-3.5' />
			</div>

			<div className='flex-1 space-y-2.5 overflow-hidden pt-0.5'>
				{message.content && (
					<p className='whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground'>
						{message.content}
					</p>
				)}

				{message.imageUrl && (
					<div className='mt-2.5 overflow-hidden rounded-lg border border-border/60 bg-muted/20 max-w-sm sm:max-w-md'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={message.imageUrl}
							alt={message.content || "AI generated image preview"}
							className='h-auto w-full object-cover max-h-80'
							loading='lazy'
						/>
					</div>
				)}
			</div>
		</div>
	);
}
