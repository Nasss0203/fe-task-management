import { create } from "zustand";

import type { AiChatMessage, AiChatMode, QuickActionItem } from "./types";

interface AiChatStore {
	messages: AiChatMessage[];
	mode: AiChatMode;
	input: string;

	conversationId: string | null;
	conversationWorkspaceId: string | null;

	setMessages: (
		messages:
			| AiChatMessage[]
			| ((prev: AiChatMessage[]) => AiChatMessage[]),
	) => void;

	addMessage: (message: AiChatMessage) => void;

	setMode: (mode: AiChatMode) => void;
	setInput: (input: string) => void;

	setConversation: (conversationId: string, workspaceId: string) => void;

	clearConversation: () => void;

	newChat: () => void;

	selectQuickAction: (action: QuickActionItem) => void;
}

const DEFAULT_AI_MODE: AiChatMode = "writing.improve";

export const useAiChatStore = create<AiChatStore>((set) => ({
	messages: [],
	mode: DEFAULT_AI_MODE,
	input: "",

	conversationId: null,
	conversationWorkspaceId: null,

	setMessages: (messages) =>
		set((state) => ({
			messages:
				typeof messages === "function"
					? messages(state.messages)
					: messages,
		})),

	addMessage: (message) =>
		set((state) => ({
			messages: [...state.messages, message],
		})),

	setMode: (mode) => set({ mode }),

	setInput: (input) => set({ input }),

	setConversation: (conversationId, workspaceId) =>
		set({
			conversationId,
			conversationWorkspaceId: workspaceId,
		}),

	clearConversation: () =>
		set({
			conversationId: null,
			conversationWorkspaceId: null,
		}),

	newChat: () =>
		set({
			messages: [],
			input: "",
			mode: DEFAULT_AI_MODE,
			conversationId: null,
			conversationWorkspaceId: null,
		}),

	selectQuickAction: (action) =>
		set({
			mode: action.mode,
			input: action.prompt,
		}),
}));
