import { create } from "zustand";

import type {
	AiChatMessage,
	AiChatMode,
	AiChatPendingStage,
	AiChatThread,
	QuickActionItem,
} from "./types";

const DEFAULT_AI_MODE: AiChatMode = "writing.improve";

const GLOBAL_CHAT_SCOPE = "global";

/**
 * Each page has its own AI chat scope.
 * The dashboard AI chat uses the global scope.
 */
export function getAiChatScope(
	pageId?: string,
	workspaceId?: string | null,
	userId?: string,
): string {
	// A global thread belongs to one user and one workspace, even before a
	// persisted conversation exists (e.g. an AMBIGUOUS_PAGE prompt).
	if (userId && workspaceId) {
		return pageId
			? `user:${userId}:page:${pageId}`
			: `user:${userId}:workspace:${workspaceId}:global`;
	}
	return pageId ? `page:${pageId}` : GLOBAL_CHAT_SCOPE;
}

/**
 * Create a fresh chat thread.
 */
function createEmptyThread(): AiChatThread {
	return {
		messages: [],
		mode: DEFAULT_AI_MODE,
		input: "",

		conversationId: null,
		conversationWorkspaceId: null,

		pendingStage: null,
		activeRequestId: null,
	};
}

/**
 * Stable fallback for a thread that does not exist yet.
 * Do not mutate this object directly.
 */
export const EMPTY_AI_CHAT_THREAD: AiChatThread = createEmptyThread();

interface AiChatStore {
	threads: Record<string, AiChatThread>;

	setMessages: (
		scope: string,
		messages:
			| AiChatMessage[]
			| ((previous: AiChatMessage[]) => AiChatMessage[]),
	) => void;

	addMessage: (
		scope: string,
		message: AiChatMessage,
		requestId?: string,
	) => void;

	setMode: (scope: string, mode: AiChatMode) => void;

	setInput: (scope: string, input: string) => void;

	setConversation: (
		scope: string,
		conversationId: string,
		workspaceId: string,
	) => void;

	clearConversation: (scope: string) => void;

	newChat: (scope: string) => void;

	selectQuickAction: (scope: string, action: QuickActionItem) => void;

	beginRequest: (
		scope: string,
		requestId: string,
		stage: AiChatPendingStage,
	) => boolean;

	setPendingStage: (
		scope: string,
		requestId: string,
		stage: AiChatPendingStage,
	) => void;

	finishRequest: (scope: string, requestId: string) => void;
}

/**
 * Read an existing thread or return the empty fallback.
 */
function getThread(state: AiChatStore, scope: string): AiChatThread {
	return state.threads[scope] ?? EMPTY_AI_CHAT_THREAD;
}

/**
 * Update a single thread without modifying other threads.
 */
function updateThread(
	state: AiChatStore,
	scope: string,
	updater: (thread: AiChatThread) => AiChatThread,
): Pick<AiChatStore, "threads"> {
	const currentThread = getThread(state, scope);

	return {
		threads: {
			...state.threads,
			[scope]: updater(currentThread),
		},
	};
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
	threads: {},

	/**
	 * Replace or update messages in a specific thread.
	 */
	setMessages: (scope, messages) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				messages:
					typeof messages === "function"
						? messages(thread.messages)
						: messages,
			})),
		),

	/**
	 * Append a message to the correct thread.
	 * If requestId is provided, ignore stale requests.
	 */
	addMessage: (scope, message, requestId) =>
		set((state) => {
			const thread = getThread(state, scope);

			if (requestId && thread.activeRequestId !== requestId) {
				return state;
			}

			return updateThread(state, scope, (current) => ({
				...current,
				messages: [...current.messages, message],
			}));
		}),

	setMode: (scope, mode) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				mode,
			})),
		),

	setInput: (scope, input) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				input,
			})),
		),

	/**
	 * Save conversation information for one thread.
	 */
	setConversation: (scope, conversationId, workspaceId) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				conversationId,
				conversationWorkspaceId: workspaceId,
			})),
		),

	clearConversation: (scope) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				conversationId: null,
				conversationWorkspaceId: null,
			})),
		),

	/**
	 * Reset only the selected thread.
	 * Other page conversations remain unchanged.
	 */
	newChat: (scope) =>
		set((state) => ({
			threads: {
				...state.threads,
				[scope]: createEmptyThread(),
			},
		})),

	selectQuickAction: (scope, action) =>
		set((state) =>
			updateThread(state, scope, (thread) => ({
				...thread,
				mode: action.mode,
				input: action.prompt,
			})),
		),

	/**
	 * Start a request within one chat scope.
	 * Reject duplicate requests in that scope.
	 */
	beginRequest: (scope, requestId, stage) => {
		const thread = getThread(get(), scope);

		if (thread.activeRequestId !== null) {
			return false;
		}

		set((state) =>
			updateThread(state, scope, (current) => ({
				...current,
				activeRequestId: requestId,
				pendingStage: stage,
			})),
		);

		return true;
	},

	/**
	 * Update loading stage only for the active request.
	 */
	setPendingStage: (scope, requestId, stage) =>
		set((state) => {
			const thread = getThread(state, scope);

			if (thread.activeRequestId !== requestId) {
				return state;
			}

			return updateThread(state, scope, (current) => ({
				...current,
				pendingStage: stage,
			}));
		}),

	/**
	 * Finish a request and remove the loading state.
	 */
	finishRequest: (scope, requestId) =>
		set((state) => {
			const thread = getThread(state, scope);

			if (thread.activeRequestId !== requestId) {
				return state;
			}

			return updateThread(state, scope, (current) => ({
				...current,
				pendingStage: null,
				activeRequestId: null,
			}));
		}),
}));
