"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
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

	const isModificationPlan =
		generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN";

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
					{message.pageSelection && (
						<div className="space-y-2 rounded-lg border border-border/60 p-3">
							{message.pageSelection.candidates.map((page) => (
								<div key={page.pageId} className="flex items-center justify-between gap-3 rounded-md border border-border/40 p-2">
									<div className="min-w-0">
										<p className="truncate text-xs font-medium">{page.title}</p>
										<p className="break-all text-[10px] text-muted-foreground">{page.pageId}</p>
											{page.parentPageId && <p className="text-[10px] text-muted-foreground">Parent: {page.parentPageId}</p>}
											{page.teamspaceId && <p className="text-[10px] text-muted-foreground">Teamspace: {page.teamspaceId}</p>}
									</div>
									<Button type="button" size="sm" variant="outline" disabled={disabled}
										onClick={() => onSelectPageCandidate?.(message.id, page.pageId)}>Select</Button>
								</div>
							))}
						</div>
					)}
						{generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN" &&
						typeof (generation.output_data as { pageId?: unknown } | null)?.pageId === "string" && (
						<Link href={`/page/${(generation.output_data as { pageId: string }).pageId}`}
							className="text-xs text-primary underline underline-offset-2">Open target page</Link>
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
