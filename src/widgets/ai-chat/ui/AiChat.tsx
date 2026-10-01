"use client";

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
		sendMessage,
		newChat,
		selectQuickAction,
	} = useAiChatStore();

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
				<AiMessageList messages={messages} />
			)}

			<AiChatComposer
				value={input}
				onChange={setInput}
				mode={mode}
				onModeChange={setMode}
				onSend={sendMessage}
			/>
		</div>
	);
}
