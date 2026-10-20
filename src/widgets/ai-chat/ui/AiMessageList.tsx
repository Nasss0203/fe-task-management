"use client";

import { useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";

import type { AiChatPendingStage } from "../model/use-ai-chat";
import type { AiChatMessage } from "../model/types";

import { AiMessageItem } from "./AiMessageItem";

interface AiMessageListProps {
	messages: AiChatMessage[];
	hasMore?: boolean;
	loadingMore?: boolean;
	onLoadMore?: () => void;
	pendingStage?: AiChatPendingStage | null;
	disabled?: boolean;

	onConfirmPageComposition: (generationId: string) => void;

	onConfirmAiModificationPlan: (generationId: string, pageId: string) => void;

	onDiscardGeneration: (generationId: string) => void;
	onSelectPageCandidate?: (messageId: string, pageId: string) => void;
}

const pendingStageContent: Record<
	AiChatPendingStage,
	{
		title: string;
		description: string;
	}
> = {
	preparing: {
		title: "Preparing your request...",
		description: "Connecting to Taskmanly AI.",
	},

	writing: {
		title: "AI is writing a response...",
		description: "Processing your text and preparing an answer.",
	},

	"composing-page": {
		title: "AI is creating a page draft...",
		description: "Generating page content for you to review.",
	},

	"planning-modification": {
		title: "AI is generating a modification plan...",
		description: "Analyzing your request and preparing page changes.",
	},

	"loading-preview": {
		title: "Loading your plan preview...",
		description: "Getting the generated plan ready for review.",
	},
};

function AiPendingMessage({ stage }: { stage: AiChatPendingStage }) {
	const { title, description } = pendingStageContent[stage];

	return (
		<div
			className='flex w-full items-start gap-3'
			role='status'
			aria-live='polite'
			aria-atomic='true'
		>
			<div className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/80 text-foreground/80'>
				<Sparkles className='size-3.5' />
			</div>

			<div className='min-w-0 flex-1 space-y-2 pt-0.5'>
				<div className='flex items-center gap-2'>
					<Loader2
						className='size-4 shrink-0 animate-spin text-primary'
						aria-hidden='true'
					/>

					<p className='text-sm font-medium leading-relaxed text-foreground'>
						{title}
					</p>
				</div>

				<p className='text-xs leading-relaxed text-muted-foreground'>
					{description}
				</p>

				<div
					className='flex items-center gap-1.5 pt-1'
					aria-hidden='true'
				>
					<span className='size-1.5 animate-pulse rounded-full bg-muted-foreground/70' />

					<span className='size-1.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-delay:150ms]' />

					<span className='size-1.5 animate-pulse rounded-full bg-muted-foreground/30 [animation-delay:300ms]' />
				</div>
			</div>
		</div>
	);
}

export function AiMessageList({
	messages,
	hasMore = false,
	loadingMore = false,
	onLoadMore,
	pendingStage = null,
	disabled = false,
	onConfirmPageComposition,
	onConfirmAiModificationPlan,
	onDiscardGeneration,
	onSelectPageCandidate,
}: AiMessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end",
		});
	}, [messages.length, pendingStage]);

	return (
		<div className='flex-1 overflow-y-auto py-4'>
			<div className='space-y-6 pb-4'>
				{hasMore && onLoadMore && (
					<button type="button" disabled={loadingMore || disabled}
						onClick={onLoadMore}
						className="w-full rounded-md border border-border/60 py-2 text-xs text-muted-foreground hover:bg-accent/50 disabled:opacity-50">
						{loadingMore ? "Loading messages..." : "Load more messages"}
					</button>
				)}
				{messages.map((message) => (
					<AiMessageItem
						key={message.id}
						message={message}
						disabled={disabled}
						onConfirmPageComposition={onConfirmPageComposition}
						onConfirmAiModificationPlan={
							onConfirmAiModificationPlan
						}
							onDiscardGeneration={onDiscardGeneration}
							onSelectPageCandidate={onSelectPageCandidate}
					/>
				))}

				{pendingStage !== null && (
					<AiPendingMessage stage={pendingStage} />
				)}

				<div ref={messagesEndRef} aria-hidden='true' />
			</div>
		</div>
	);
}
