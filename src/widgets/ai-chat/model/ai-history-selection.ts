"use client";

import { useSyncExternalStore } from "react";

const STORAGE_PREFIX = "taskmanly:ai-history:active:v1";
const SELECTION_CHANGED = "taskmanly-ai-history-selection-changed";

export function aiHistorySelectionKey(
	userId: string | undefined,
	workspaceId: string | null,
	pageId?: string,
): string | null {
	if (!userId || !workspaceId) return null;
	return `${STORAGE_PREFIX}:${userId}:${workspaceId}:${pageId ? `page:${pageId}` : "global"}`;
}

function subscribe(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener(SELECTION_CHANGED, callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(SELECTION_CHANGED, callback);
	};
}

export function useSelectedAiConversation(key: string | null): string | null {
	return useSyncExternalStore(
		subscribe,
		() => (key ? window.localStorage.getItem(key) || null : null),
		() => null,
	);
}

export function saveSelectedAiConversation(key: string | null, id: string | null) {
	if (!key || typeof window === "undefined") return;
	// Store only the conversation id, never the message content or credentials.
	if (id) window.localStorage.setItem(key, id);
	else window.localStorage.setItem(key, "");
	window.dispatchEvent(new Event(SELECTION_CHANGED));
}
