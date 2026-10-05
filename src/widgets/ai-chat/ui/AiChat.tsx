"use client";

import { useAiChat } from "../model/use-ai-chat";
import { useAiChatStore } from "../model/use-ai-chat-store";
import { AiChatComposer } from "./AiChatComposer";
import { AiChatEmptyState } from "./AiChatEmptyState";
import { AiChatHeader } from "./AiChatHeader";
import { AiMessageList } from "./AiMessageList";

interface AiChatProps {
	showHeader?: boolean;
}

export function AiChat({ showHeader = false }: AiChatProps) {
	const {
		messages,
		mode,
		input,
		setInput,
		setMode,
		newChat,
		selectQuickAction,
	} = useAiChatStore();

	const {
		sendMessage,
		confirmPageComposition,
		discardGeneration,
		isPending,
		currentWorkspaceId,
	} = useAiChat();

	return (
		<div className='mx-auto flex h-full w-full max-w-3xl flex-col px-4 sm:px-6'>
			{showHeader && (
				<AiChatHeader
					onNewChat={newChat}
					hasMessages={messages.length > 0}
				/>
			)}

			{messages.length === 0 ? (
				<AiChatEmptyState onSelectQuickAction={selectQuickAction} />
			) : (
				<AiMessageList
					messages={messages}
					disabled={isPending}
					onConfirmPageComposition={(generationId) => {
						void confirmPageComposition(generationId);
					}}
					onDiscardGeneration={(generationId) => {
						void discardGeneration(generationId);
					}}
				/>
			)}

			<AiChatComposer
				value={input}
				onChange={setInput}
				mode={mode}
				onModeChange={setMode}
				onSend={() => {
					void sendMessage();
				}}
				disabled={isPending || !currentWorkspaceId}
			/>
		</div>
	);
}
