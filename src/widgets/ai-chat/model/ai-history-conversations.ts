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
		conversation.status === "ACTIVE" &&
		conversation.workspace_id === workspaceId &&
		conversation.scope === scope &&
		(scope === "GLOBAL" ? conversation.page_id === null : Boolean(pageId) && conversation.page_id === pageId),
	);
}

export type AiConversationVerification =
	| { status: "pending" }
	| { status: "error"; error: unknown }
	| { status: "verified"; userId: string; conversation: AiConversation };

/** Context-only preflight, before the Backend has classified an intent. */
export function isVerifiedAiConversationContext(
	verification: AiConversationVerification,
	context: { userId: string; workspaceId: string; currentPageId?: string | null },
	activeOnly = true,
): boolean {
	if (verification.status !== "verified" || verification.userId !== context.userId) return false;
	const conversation = verification.conversation;
	return conversation.workspace_id === context.workspaceId && (!activeOnly || conversation.status === "ACTIVE") &&
		(conversation.scope === "GLOBAL" ? conversation.page_id === null : conversation.scope === "PAGE" &&
			Boolean(conversation.page_id) && (!context.currentPageId || context.currentPageId === conversation.page_id));
}

/** Call with the result of the user-keyed authenticated detail query, not storage data. */
export function getAiConversationVerification(
	userId: string | undefined,
	selectedId: string | null,
	query: { isSuccess: boolean; isError: boolean; data?: AiConversation; error?: unknown },
): AiConversationVerification {
	if (!userId || !selectedId) return { status: "pending" };
	if (query.isError) return { status: "error", error: query.error };
	if (!query.isSuccess || !query.data) return { status: "pending" };
	if (query.data.id !== selectedId) return { status: "error", error: new Error("Conversation identity mismatch") };
	return { status: "verified", userId, conversation: query.data };
}

/** Intent is supplied only after Backend classification; this helper does not inspect text. */
export function canReuseVerifiedAiConversation(
	verification: AiConversationVerification,
	context: { userId: string; workspaceId: string; currentPageId?: string | null },
	intent: "WRITING" | "CREATE_PAGE" | "MODIFY_PAGE",
	resolvedPageId?: string,
): boolean {
	if (verification.status !== "verified" || verification.userId !== context.userId) return false;
	const conversation = verification.conversation;
	if (context.currentPageId && conversation.scope === "PAGE" && conversation.page_id !== context.currentPageId) return false;
	if (intent === "CREATE_PAGE" || (intent === "WRITING" && conversation.scope === "GLOBAL")) {
		return shouldReuseAiConversation(conversation, context.workspaceId, "GLOBAL");
	}
	return shouldReuseAiConversation(
		conversation, context.workspaceId, "PAGE",
		intent === "WRITING" ? context.currentPageId ?? undefined : resolvedPageId ?? context.currentPageId ?? undefined,
	);
}
