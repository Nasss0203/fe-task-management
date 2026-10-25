import type { AiOperationInput, AiOperationToken } from "./types";
import { useAiChatStore } from "./use-ai-chat-store";
import { aiHistorySelectionKey, getAiSelectionRevision, getSelectedAiConversation, saveSelectedAiConversation } from "./ai-history-selection";

export interface AiChatView {
	accessId?: string;
	shareToken?: string;
	userId?: string;
	workspaceId: string | null;
	pageId: string | null;
	chatScope: string;
	revision: number;
}

export function acquireAiChatOperation(view: AiChatView, live: () => AiChatView | null,
	action: Pick<Extract<AiOperationInput, { type: "ask" }>, "type" | "requestId"> |
		{ type: "confirm" | "discard"; generationId: string }) {
	if (!view.userId || !view.workspaceId) return null;
	const key = aiHistorySelectionKey(view.userId, view.workspaceId, view.pageId ?? undefined, view.accessId);
	let selectedId = getSelectedAiConversation(key);
	let selectionRevision = getAiSelectionRevision(key);
	const thread = useAiChatStore.getState().threads[view.chatScope];
	if (thread?.conversationId && thread.conversationId !== selectedId) return null;
	const token = useAiChatStore.getState().acquireOperation({ ...action, userId: view.userId,
		workspaceId: view.workspaceId, pageId: view.pageId, chatScope: view.chatScope, accessId: view.accessId, epoch: thread?.epoch ?? 0 });
	if (!token) return null;
	const isCurrent = () => {
		const current = live();
		return Boolean(current && current.userId === token.userId && current.workspaceId === token.workspaceId &&
			current.accessId === view.accessId && current.pageId === token.pageId && current.chatScope === token.chatScope && current.revision === view.revision &&
			useAiChatStore.getState().isOperationActive(token) && getSelectedAiConversation(key) === selectedId &&
			getAiSelectionRevision(key) === selectionRevision);
	};
	if (!isCurrent()) { useAiChatStore.getState().releaseOperation(token); return null; }
	return {
		token, shareToken: view.shareToken, initialConversationId: selectedId, isCurrent,
		conversationId: () => selectedId,
		selectionRevision: () => selectionRevision,
		/** Chat nhiều lượt: only after the server explicitly opened another conversation. */
		switchConversation: (id: string, turnId: string) => {
			if (!isCurrent() || !selectedId || selectedId === id ||
				!useAiChatStore.getState().switchOperationConversation(token, id, turnId)) return false;
			saveSelectedAiConversation(key, id);
			selectedId = id;
			selectionRevision = getAiSelectionRevision(key);
			return true;
		},
		bindConversation: (id: string) => {
			if (!isCurrent() || (selectedId && selectedId !== id) || !useAiChatStore.getState().bindOperationConversation(token, id)) return false;
			if (selectedId !== id) saveSelectedAiConversation(key, id);
			selectedId = id;
			selectionRevision = getAiSelectionRevision(key);
			return true;
		},
	};
}

export type AiChatOperation = NonNullable<ReturnType<typeof acquireAiChatOperation>>;

export function operationBinding(token: AiOperationToken) {
	return { userId: token.userId, workspaceId: token.workspaceId, pageId: token.pageId,
		chatScope: token.chatScope, accessId: token.accessId, epoch: token.epoch };
}
