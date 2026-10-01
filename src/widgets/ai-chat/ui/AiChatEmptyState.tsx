"use client";

import {
	AlignLeft,
	FileText,
	ImageIcon,
	Lightbulb,
	Sparkles,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import type { AiChatMode, QuickActionItem } from "../model/types";

interface AiChatEmptyStateProps {
	onSelectQuickAction: (action: {
		label: string;
		prompt: string;
		mode: AiChatMode;
	}) => void;
}

const QUICK_ACTIONS: QuickActionItem[] = [
	{
		id: "generate-image",
		label: "Generate an image",
		prompt: "",
		mode: "image",
		iconName: "image",
	},
	{
		id: "write-content",
		label: "Write content",
		prompt: "Help me write a clear and concise project update for my team.",
		mode: "text",
		iconName: "file-text",
	},
	{
		id: "brainstorm-ideas",
		label: "Brainstorm ideas",
		prompt: "Brainstorm 5 innovative ideas for improving team collaboration.",
		mode: "text",
		iconName: "lightbulb",
	},
	{
		id: "summarize",
		label: "Summarize",
		prompt: "Summarize the key takeaways and action items from this document:",
		mode: "text",
		iconName: "align-left",
	},
];

export function AiChatEmptyState({ onSelectQuickAction }: AiChatEmptyStateProps) {
	const getIcon = (iconName: QuickActionItem["iconName"]) => {
		switch (iconName) {
			case "image":
				return <ImageIcon className='size-4 text-muted-foreground shrink-0' />;
			case "file-text":
				return <FileText className='size-4 text-muted-foreground shrink-0' />;
			case "lightbulb":
				return <Lightbulb className='size-4 text-muted-foreground shrink-0' />;
			case "align-left":
				return <AlignLeft className='size-4 text-muted-foreground shrink-0' />;
		}
	};

	return (
		<div className='flex flex-1 flex-col items-center pt-8 pb-4 text-center sm:pt-14'>
			{/* Subtle Sparkles Icon (40–44px container) */}
			<div className='mb-4 flex size-11 items-center justify-center rounded-xl border border-border/40 bg-muted/60 text-foreground/80'>
				<Sparkles className='size-5 text-foreground/75' />
			</div>

			{/* Title */}
			<h2 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
				How can I help you today?
			</h2>

			{/* Subtitle */}
			<p className='mt-2 max-w-sm text-sm text-muted-foreground sm:text-base'>
				Ask anything, create content, or generate an image.
			</p>

			{/* Lightweight Quick Actions (2 cols desktop, 1 col mobile) */}
			<div className='mt-7 grid w-full max-w-md grid-cols-1 gap-2.5 sm:grid-cols-2'>
				{QUICK_ACTIONS.map((action) => (
					<Button
						key={action.id}
						type='button'
						variant='outline'
						onClick={() =>
							onSelectQuickAction({
								label: action.label,
								prompt: action.prompt,
								mode: action.mode,
							})
						}
						className='flex h-12 items-center justify-start gap-2.5 rounded-lg border border-border/60 bg-background px-3.5 text-left font-normal text-foreground/90 shadow-none transition-colors hover:border-border hover:bg-accent/50 hover:text-foreground'
					>
						{getIcon(action.iconName)}
						<span className='line-clamp-1 text-sm font-medium'>
							{action.label}
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}
