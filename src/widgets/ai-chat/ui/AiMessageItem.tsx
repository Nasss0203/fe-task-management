"use client";

import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";

import type { AiChatMessage } from "../model/types";
import { AiModificationPlanPreview } from "./AiModificationPlanPreview";
import { AiPageCompositionPreview } from "./AiPageCompositionPreview";

interface AiMessageItemProps {
	message: AiChatMessage;
	disabled?: boolean;

	onConfirmPageComposition: (generationId: string) => void;

	onConfirmAiModificationPlan: (generationId: string, pageId: string) => void;

	onDiscardGeneration: (generationId: string) => void;
	onSelectPageCandidate?: (messageId: string, pageId: string) => void;
}

export function AiAssistantAvatar() {
	return (
		<div
			aria-hidden='true'
			className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
		>
			<Sparkles className='size-3.5' />
		</div>
	);
}

export function AiMessageItem({
	message,
	disabled = false,
	onConfirmPageComposition,
	onConfirmAiModificationPlan,
	onDiscardGeneration,
	onSelectPageCandidate,
}: AiMessageItemProps) {
	const isUser = message.role === "user";

	if (isUser) {
		return (
			<div className='flex w-full justify-end'>
				<div className='max-w-[80%] rounded-2xl rounded-br-md bg-muted px-4 py-2.5 text-sm text-foreground'>
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

	const isModificationPlan =
		generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN";

	// Restored plan messages repeat the plan summary the card already shows.
	const planSummary = isModificationPlan
		? (generation.output_data as { summary?: unknown } | null)?.summary
		: undefined;
	const showContent =
		Boolean(message.content.trim()) &&
		!(
			typeof planSummary === "string" &&
			planSummary.trim() === message.content.trim()
		);

	return (
		<div className='flex w-full items-start gap-3'>
			<AiAssistantAvatar />

			<div className='min-w-0 flex-1 space-y-3 pt-1'>
				{showContent && (
					<p className='whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground'>
						{message.content}
					</p>
				)}

				{message.pageSelection && (
					<ul className='overflow-hidden rounded-xl border border-border/60 bg-card'>
						{message.pageSelection.candidates.map((page) => (
							<li
								key={page.pageId}
								title={page.pageId}
								className='flex items-center gap-3 border-b border-border/40 px-3 py-2.5 last:border-b-0'
							>
								<FileText className='size-4 shrink-0 text-muted-foreground' />

								<div className='min-w-0 flex-1'>
									<p className='truncate text-sm font-medium text-foreground'>
										{page.title || "Untitled"}
									</p>
									<p className='text-[11px] text-muted-foreground'>
										{page.parentPageId ? "Subpage" : "Top-level page"}
										{page.teamspaceId ? " · Teamspace" : ""}
									</p>
								</div>

								<Button
									type='button'
									size='sm'
									variant='outline'
									disabled={disabled}
									onClick={() =>
										onSelectPageCandidate?.(message.id, page.pageId)
									}
								>
									Select
								</Button>
							</li>
						))}
					</ul>
				)}

				{isPageComposition && generation && (
					<AiPageCompositionPreview
						generation={generation}
						disabled={disabled}
						onConfirm={onConfirmPageComposition}
						onDiscard={onDiscardGeneration}
					/>
				)}

				{isModificationPlan && generation && (
					<AiModificationPlanPreview
						generation={generation}
						disabled={disabled}
						previewOnly={message.previewOnly}
						onConfirm={onConfirmAiModificationPlan}
						onDiscard={onDiscardGeneration}
					/>
				)}
			</div>
		</div>
	);
}
