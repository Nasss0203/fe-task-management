"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface AiChatHeaderProps {
	onNewChat?: () => void;
	hasMessages?: boolean;
}

export function AiChatHeader({
	onNewChat,
	hasMessages = false,
}: AiChatHeaderProps) {
	if (!onNewChat) return null;

	return (
		<div className='flex items-center justify-end py-1'>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				onClick={onNewChat}
				disabled={!hasMessages}
				className='h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground disabled:opacity-40'
			>
				<Plus className='size-3.5' />
				<span>New chat</span>
			</Button>
		</div>
	);
}
