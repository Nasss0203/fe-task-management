import { create } from "zustand";

import type { AiChatMode, AiChatMessage } from "./types";

interface AiChatStore {
	messages: AiChatMessage[];
	mode: AiChatMode;
	input: string;
	setMessages: (
		messages: AiChatMessage[] | ((prev: AiChatMessage[]) => AiChatMessage[]),
	) => void;
	setMode: (mode: AiChatMode) => void;
	setInput: (input: string) => void;
	sendMessage: () => void;
	newChat: () => void;
	selectQuickAction: (action: {
		label: string;
		prompt: string;
		mode: AiChatMode;
	}) => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
	messages: [],
	mode: "text",
	input: "",

	setMessages: (messages) =>
		set((state) => ({
			messages:
				typeof messages === "function" ? messages(state.messages) : messages,
		})),

	setMode: (mode) => set({ mode }),

	setInput: (input) => set({ input }),

	sendMessage: () => {
		const { input, mode } = get();
		const trimmed = input.trim();
		if (!trimmed) return;

		const userMessageId = `user-${Date.now()}`;
		const currentMode = mode;

		const newUserMessage: AiChatMessage = {
			id: userMessageId,
			role: "user",
			content: trimmed,
			mode: currentMode,
			createdAt: new Date().toISOString(),
		};

		const assistantMessageId = `assistant-${Date.now() + 1}`;
		const demoAssistantReply: AiChatMessage =
			currentMode === "image"
				? {
						id: assistantMessageId,
						role: "assistant",
						content: `Here is a preview of the generated image layout for: "${trimmed}"`,
						imageUrl:
							"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
						mode: "image",
						createdAt: new Date().toISOString(),
				  }
				: {
						id: assistantMessageId,
						role: "assistant",
						content:
							"This is a local UI preview response. Backend AI services (Gemini/OpenAI) will be integrated in a future task.",
						mode: "text",
						createdAt: new Date().toISOString(),
				  };

		set((state) => ({
			messages: [...state.messages, newUserMessage, demoAssistantReply],
			input: "",
		}));
	},

	newChat: () => {
		set({
			messages: [],
			input: "",
			mode: "text",
		});
	},

	selectQuickAction: (action) => {
		set({
			mode: action.mode,
			input: action.prompt || "",
		});
	},
}));
