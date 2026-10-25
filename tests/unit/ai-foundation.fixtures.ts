import type { AiConversation, AiGeneration, AiHistoryMessage } from "@/entities/ai-assistant/model/ai-assistant.types";
import type { AiChatMessage } from "@/widgets/ai-chat/model/types";
import { writingGeneration, workspaceId, conversationId } from "./ai-ask.fixtures";

export const foundationConversation: AiConversation = {
	id: conversationId, workspace_id: workspaceId, scope: "GLOBAL", page_id: null, status: "ACTIVE",
	title: "Foundation", created_at: writingGeneration.created_at, updated_at: writingGeneration.updated_at,
};
export const foundationGeneration: AiGeneration = { ...writingGeneration, capability: "writing.improve" };
export const foundationContext = { conversationId, workspaceId };

export function localMessage(id: string, role: "user" | "assistant", requestId = "request-1",
	overrides: Partial<AiChatMessage> = {}): AiChatMessage {
	return { id, role, capability: null, content: id, createdAt: writingGeneration.created_at,
		origin: role === "user" ? { source: "optimistic", localId: id, conversationId, requestId, turnId: "turn-1" } :
			{ source: "feedback", feedbackKind: "clarification", localId: id, conversationId, requestId, turnId: "turn-1" },
		...overrides };
}

export function serverMessage(id: string, role: "USER" | "ASSISTANT", metadata: Record<string, unknown> = {}): AiHistoryMessage {
	return { id, role, conversation_id: conversationId, content: id, metadata,
		created_at: writingGeneration.created_at };
}
