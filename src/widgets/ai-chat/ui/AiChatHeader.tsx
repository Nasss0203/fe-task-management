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
				variant='outline'
				size='sm'
				onClick={onNewChat}
				disabled={!hasMessages}
				className='h-7 gap-1.5 rounded-[6px] border-input bg-background px-2.5 text-[13px] font-medium text-foreground shadow-none hover:bg-accent/50 disabled:opacity-40'
			>
				<Plus className='size-3.5' />
				<span>New chat</span>
			</Button>
		</div>
	);
}
