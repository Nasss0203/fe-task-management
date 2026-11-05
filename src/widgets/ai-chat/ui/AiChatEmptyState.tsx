"use client";

import {
	AlignLeft,
	ListPlus,
	Maximize2,
	Sparkles,
	WandSparkles,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import type { QuickActionItem } from "../model/types";

interface AiChatEmptyStateProps {
	onSelectQuickAction: (action: QuickActionItem) => void;
	disabled?: boolean;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
	{
		id: "create-page",
		label: "Create a page",
		prompt: "Create a new page about [topic], including [sections].",
		iconName: "list-plus",
	},
	{
		id: "improve-writing",
		label: "Improve writing",
		prompt: "Improve the wording of the following text:\n[text to improve]",
		iconName: "wand",
	},
	{
		id: "summarize",
		label: "Summarize",
		prompt: "Summarize the following text:\n[text to summarize]",
		iconName: "align-left",
	},
	{
		id: "expand-writing",
		label: "Expand writing",
		prompt: "Expand the following text while keeping its main ideas:\n[text to expand]",
		iconName: "maximize",
	},
];

export function getQuickActionIcon(iconName: QuickActionItem["iconName"]) {
	switch (iconName) {
		case "list-plus":
			return (
				<ListPlus className='size-4 shrink-0 text-muted-foreground' />
			);

		case "wand":
			return (
				<WandSparkles className='size-4 shrink-0 text-muted-foreground' />
			);

		case "align-left":
			return (
				<AlignLeft className='size-4 shrink-0 text-muted-foreground' />
			);

		case "maximize":
			return (
				<Maximize2 className='size-4 shrink-0 text-muted-foreground' />
			);

		default:
			return (
				<Sparkles className='size-4 shrink-0 text-muted-foreground' />
			);
	}
}

export function AiChatEmptyState({
	onSelectQuickAction,
	disabled = false,
}: AiChatEmptyStateProps) {
	return (
		<div className='flex flex-1 flex-col items-center pt-8 pb-4 text-center sm:pt-14'>
			<div className='mb-4 flex size-11 items-center justify-center rounded-xl border border-border/80 bg-muted/70 text-foreground/80'>
				<Sparkles className='size-5 text-foreground/75' />
			</div>

			<h2 className='text-[26px] font-semibold tracking-tight text-foreground'>
				How can I help you today?
			</h2>

			<p className='mt-2 max-w-[384px] text-sm text-muted-foreground'>
				Ask AI to improve your writing or create content for your
				workspace.
			</p>

			<div className='mt-7 grid w-full max-w-[450px] grid-cols-1 gap-2.5 sm:grid-cols-2'>
				{QUICK_ACTIONS.map((action) => (
					<Button
						key={action.id}
						type='button'
						disabled={disabled}
						variant='outline'
						onClick={() => onSelectQuickAction(action)}
						className='flex h-12 items-center justify-start gap-2.5 rounded-[8px] border border-border bg-background px-3.5 text-left font-medium text-foreground shadow-none transition-colors hover:bg-accent/50'
					>
						{getQuickActionIcon(action.iconName)}

						<span className='line-clamp-1 text-sm font-medium'>
							{action.label}
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}
