"use client";

import { useEffect, useRef } from "react";

import type { AiChatMessage } from "../model/types";
import { AiMessageItem } from "./AiMessageItem";

interface AiMessageListProps {
	messages: AiChatMessage[];
	disabled?: boolean;
	onConfirmPageComposition: (generationId: string) => void;
	onDiscardGeneration: (generationId: string) => void;
}

export function AiMessageList({
	messages,
	disabled = false,
	onConfirmPageComposition,
	onDiscardGeneration,
}: AiMessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: "smooth",
		});
	}, [messages]);

	return (
		<div className='flex-1 overflow-y-auto py-4'>
			<div className='space-y-6 pb-4'>
				{messages.map((message) => (
					<AiMessageItem
						key={message.id}
						message={message}
						disabled={disabled}
						onConfirmPageComposition={onConfirmPageComposition}
						onDiscardGeneration={onDiscardGeneration}
					/>
				))}

				<div ref={messagesEndRef} aria-hidden='true' />
			</div>
		</div>
	);
}
