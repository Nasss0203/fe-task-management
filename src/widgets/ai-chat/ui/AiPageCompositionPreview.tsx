"use client";

import { Check, FileText, Trash2 } from "lucide-react";

import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { Button } from "@/shared/ui/button";

interface AiPageCompositionPreviewProps {
	generation: AiGeneration;
	disabled?: boolean;
	onConfirm: (generationId: string) => void;
	onDiscard: (generationId: string) => void;
}

export function AiPageCompositionPreview({
	generation,
	disabled = false,
	onConfirm,
	onDiscard,
}: AiPageCompositionPreviewProps) {
	const preview = generation.preview;

	if (generation.capability !== "GENERATE_PAGE_COMPOSITION" || !preview) {
		return null;
	}

	const isCompleted = generation.status === "COMPLETED";
	const isApplied = generation.status === "APPLIED";
	const isDiscarded = generation.status === "DISCARDED";

	return (
		<div className='rounded-xl border border-border/60 bg-card p-4'>
			<div className='flex items-start gap-3'>
				<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted'>
					<FileText className='size-4 text-muted-foreground' />
				</div>

				<div className='min-w-0 flex-1'>
					<p className='truncate text-sm font-medium text-foreground'>
						{preview.page.title}
					</p>

					<p className='mt-1 text-xs text-muted-foreground'>
						{preview.summary.blocks} blocks ·{" "}
						{preview.summary.databases}{" "}
						{preview.summary.databases === 1
							? "database"
							: "databases"}{" "}
						· {preview.summary.database_rows} rows
					</p>
				</div>
			</div>

			{isCompleted && (
				<div className='mt-4 flex items-center gap-2 border-t border-border/50 pt-3'>
					<Button
						type='button'
						size='sm'
						disabled={disabled}
						onClick={() => onConfirm(generation.id)}
					>
						<Check className='size-4' />
						Confirm
					</Button>

					<Button
						type='button'
						size='sm'
						variant='outline'
						disabled={disabled}
						onClick={() => onDiscard(generation.id)}
					>
						<Trash2 className='size-4' />
						Discard
					</Button>
				</div>
			)}

			{isApplied && (
				<p className='mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground'>
					Page created successfully.
				</p>
			)}

			{isDiscarded && (
				<p className='mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground'>
					Draft discarded.
				</p>
			)}
		</div>
	);
}
