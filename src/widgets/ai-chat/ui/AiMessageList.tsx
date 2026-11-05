"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import type { AiChatPendingStage } from "../model/use-ai-chat";
import type { AiChatMessage } from "../model/types";

import { AiAssistantAvatar, AiMessageItem } from "./AiMessageItem";

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
	onSelectUnifiedAskPageCandidate?: (messageId: string, pageId: string) => void;
	onRetryUnifiedAskPreview?: (messageId: string) => void;
	generationContext?: { workspaceId: string | null; pageId?: string; conversationId?: string | null };
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
			<AiAssistantAvatar />

			<div className='flex min-w-0 flex-1 items-center gap-3 rounded-[10px] border border-border bg-muted/25 px-3.5 py-3'>
				<Loader2
					className='size-5 shrink-0 animate-spin text-[#5e6ad2] dark:text-indigo-400'
					aria-hidden='true'
				/>

				<div className='min-w-0 flex-1 space-y-0.5'>
					<p className='text-[13.5px] font-medium leading-5 text-foreground'>
						{title}
					</p>
					<p className='text-[12.5px] leading-[18px] text-muted-foreground'>
						{description}
					</p>
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
	onSelectUnifiedAskPageCandidate,
	onRetryUnifiedAskPreview,
	generationContext,
}: AiMessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
		});
	}, [messages.length, pendingStage]);

	return (
		<div className='min-h-0 flex-1 overflow-y-auto py-6'>
			<div className='space-y-6 pb-4'>
				{hasMore && onLoadMore && (
					<div className='flex justify-center'>
						<button type="button" disabled={loadingMore || disabled}
							onClick={onLoadMore}
							className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground disabled:opacity-50">
							{loadingMore && <Loader2 className="size-3 animate-spin" />}
							{loadingMore ? "Loading messages..." : "Load earlier messages"}
						</button>
					</div>
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
							onSelectUnifiedAskPageCandidate={onSelectUnifiedAskPageCandidate}
							onRetryUnifiedAskPreview={onRetryUnifiedAskPreview}
							generationContext={generationContext}
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
