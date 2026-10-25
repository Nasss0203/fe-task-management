"use client";

import { useSyncExternalStore } from "react";
import { useAiChatStore } from "./use-ai-chat-store";

const STORAGE_PREFIX = "taskmanly:ai-history:active:v1";
const SELECTION_CHANGED = "taskmanly-ai-history-selection-changed";
const revisions = new Map<string, number>();

export function getSelectedAiConversation(key: string | null): string | null {
	return key && typeof window !== "undefined" ? window.localStorage.getItem(key) || null : null;
}

export function getAiSelectionRevision(key: string | null): number {
	return key ? revisions.get(key) ?? 0 : 0;
}

export function aiHistorySelectionKey(
	userId: string | undefined,
	workspaceId: string | null,
	pageId?: string,
	accessId?: string,
): string | null {
	if (!userId || !workspaceId) return null;
	return `${STORAGE_PREFIX}:${userId}:${workspaceId}:${pageId ? `page:${pageId}` : "global"}${accessId ? `:access:${accessId}` : ""}`;
}

function subscribe(callback: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key?.startsWith(STORAGE_PREFIX)) revisions.set(event.key, getAiSelectionRevision(event.key) + 1);
		callback();
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener(SELECTION_CHANGED, callback);
	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener(SELECTION_CHANGED, callback);
	};
}

export function useSelectedAiConversation(key: string | null): string | null {
	return useSyncExternalStore(
		subscribe,
		() => getSelectedAiConversation(key),
		() => null,
	);
}

export function saveSelectedAiConversation(key: string | null, id: string | null) {
	if (!key || typeof window === "undefined") return;
	// Store only the conversation id, never the message content or credentials.
	if (id) window.localStorage.setItem(key, id);
	else window.localStorage.setItem(key, "");
	revisions.set(key, getAiSelectionRevision(key) + 1);
	window.dispatchEvent(new Event(SELECTION_CHANGED));
}

/** Reset the store first; a rejected busy reset must never change storage/navigation. */
export function resetAiChatSelection(scope: string, key: string | null, selection?: { id: string; workspaceId: string }): boolean {
	if (!key || !useAiChatStore.getState().newChat(scope)) return false;
	if (selection) useAiChatStore.getState().setConversation(scope, selection.id, selection.workspaceId);
	saveSelectedAiConversation(key, selection?.id ?? null);
	return true;
}
