"use client";

import { FileText, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/shared/ui/button";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { isValidAiCompositionGeneration, isValidAiGeneration } from "../model/ai-ask-response-mapper";
import { isAiModificationPlan, isRecord } from "../model/ai-capability";

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
	onSelectUnifiedAskPageCandidate?: (messageId: string, pageId: string) => void;
	onRetryUnifiedAskPreview?: (messageId: string) => void;
	generationContext?: { workspaceId: string | null; pageId?: string; conversationId?: string | null };
}

/** UI eligibility only; explicit actions still perform the Phase B GET preflight. */
export function isReviewableAiGeneration(generation: AiGeneration, context: { workspaceId: string | null; pageId?: string; conversationId?: string | null }): boolean {
	if (!isValidAiGeneration(generation) || !context.workspaceId || generation.workspace_id !== context.workspaceId ||
		(context.conversationId && generation.conversation_id !== context.conversationId) ||
		!["COMPLETED", "APPLIED", "DISCARDED"].includes(generation.status)) return false;
	if (generation.capability === "GENERATE_PAGE_COMPOSITION") return isValidAiCompositionGeneration(generation);
	if (generation.capability === "GENERATE_PAGE_MODIFICATION_PLAN") return isAiModificationPlan(generation.output_data) &&
		(!context.pageId || generation.output_data.pageId === context.pageId);
	return generation.capability.startsWith("writing.") && isRecord(generation.output_data) && typeof generation.output_data.text === "string";
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
	onSelectUnifiedAskPageCandidate,
	onRetryUnifiedAskPreview,
	generationContext,
}: AiMessageItemProps) {
	const actionRef = useRef(false);
	const runOnce = (callback: () => void) => {
		if (disabled || actionRef.current) return;
		actionRef.current = true;
		queueMicrotask(() => { actionRef.current = false; });
		callback();
	};
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

	const invalidGeneration = Boolean(message.generation && generationContext &&
		!isReviewableAiGeneration(message.generation, generationContext));
	const generation = invalidGeneration || message.previewRecovery ? undefined : message.generation;
	const candidates = message.unifiedSelection?.candidates ?? message.pageSelection?.candidates;
	const selectCandidate = message.unifiedSelection ? onSelectUnifiedAskPageCandidate : onSelectPageCandidate;

	const isPageComposition =
		generation?.capability === "GENERATE_PAGE_COMPOSITION";

	const isModificationPlan =
		generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN";

	// Restored plan messages repeat the plan summary the card already shows.
	const planSummary = isModificationPlan
		? (generation.output_data as { summary?: unknown } | null)?.summary
		: undefined;
	// The composition card shows the draft; older history stored its raw JSON as content.
	const showContent =
		!invalidGeneration && Boolean(message.content.trim()) && !isPageComposition &&
		!(isModificationPlan && (generation?.status === "APPLIED" || generation?.status === "DISCARDED")) &&
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

				{invalidGeneration && <p role="alert" className="text-sm text-muted-foreground">
					This draft could not be verified. Refresh history before taking any action.
				</p>}
				{message.origin?.source === "feedback" && message.origin.feedbackKind === "clarification" && (
					<p className="text-xs text-muted-foreground">Send a complete request with the additional details.</p>
				)}
				{message.previewRecovery && (
					<Button type="button" size="sm" variant="outline" disabled={disabled || !onRetryUnifiedAskPreview}
						onClick={() => runOnce(() => onRetryUnifiedAskPreview?.(message.id))}>
						Retry loading preview
					</Button>
				)}
				{candidates && (
					<ul className='overflow-hidden rounded-xl border border-border/60 bg-card'>
						{candidates.map((page) => (
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
										{page.parentPageId ? `Subpage · Parent: ${page.parentPageId}` : "Top-level page"}
										{page.teamspaceId ? ` · Teamspace: ${page.teamspaceId}` : ""}
									</p>
								</div>

								<Button
									type='button'
									size='sm'
									variant='outline'
									disabled={disabled || !selectCandidate}
									onClick={() => runOnce(() => selectCandidate?.(message.id, page.pageId))}
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
						requireContentReview={Boolean(generationContext)}
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
