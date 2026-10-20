import type { AiConversation } from "@/entities/ai-assistant/model/ai-assistant.types";

/** Merge workspace history without crossing user/workspace boundaries. */
export function mergeAiWorkspaceHistory(
	global: AiConversation[],
	page: AiConversation[],
	workspaceId: string | null,
	includePage: boolean,
): AiConversation[] {
	if (!workspaceId) return [];
	const byId = new Map<string, AiConversation>();
	for (const conversation of [...global, ...(includePage ? page : [])]) {
		if (conversation.workspace_id !== workspaceId) continue;
		if (
			conversation.scope !== "GLOBAL" &&
			(!includePage || conversation.scope !== "PAGE")
		) continue;
		if (conversation.scope === "PAGE" && !conversation.page_id) continue;
		byId.set(conversation.id, conversation);
	}
	return [...byId.values()].sort(
		(a, b) =>
			b.created_at.localeCompare(a.created_at) ||
			b.id.localeCompare(a.id),
	);
}

export function shouldReuseAiConversation(
	conversation: AiConversation | undefined,
	workspaceId: string,
	scope: "GLOBAL" | "PAGE",
	pageId?: string,
): boolean {
	return Boolean(
		conversation &&
		conversation.workspace_id === workspaceId &&
		conversation.scope === scope &&
		(scope === "GLOBAL" || conversation.page_id === pageId),
	);
}
