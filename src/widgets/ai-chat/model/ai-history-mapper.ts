import type {
	AiGeneration,
	AiHistoryMessage,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import type { AiChatMessage } from "./types";
import { isAiCapability } from "./ai-capability";

export function mapAiHistoryMessages(
	messages: AiHistoryMessage[],
	generations: AiGeneration[],
	options: { previewOnly?: boolean } = {},
): AiChatMessage[] {
	const generationById = new Map(generations.map((generation) => [generation.id, generation]));
	return [...new Map(messages.map((message) => [message.id, message])).values()]
		.filter((message) => message.role === "USER" || message.role === "ASSISTANT")
		.map((message) => {
			const linkedId = message.metadata?.generationId;
			const candidate = typeof linkedId === "string"
				? generationById.get(linkedId)
				: undefined;
			const generation = candidate && isAiCapability(candidate.capability) &&
				(candidate.conversation_id === undefined || candidate.conversation_id === message.conversation_id)
				? candidate : undefined;
			const metadataCapability = message.metadata?.capability;
			const wireCapability = candidate?.capability ?? metadataCapability;
			const capability = isAiCapability(wireCapability) ? wireCapability : null;
			return {
				id: message.id,
				role: message.role === "USER" ? "user" : "assistant",
				content: message.content,
				capability,
				wireCapability: typeof wireCapability === "string" ? wireCapability : null,
				origin: {
					source: "persisted" as const,
					serverMessageId: message.id,
					conversationId: message.conversation_id,
					...(typeof message.metadata?.requestId === "string" ? { requestId: message.metadata.requestId } : {}),
					...(typeof linkedId === "string" ? { generationId: linkedId } : {}),
				},
					...(generation ? { generation } : {}),
					...(generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN" && options.previewOnly
						? { previewOnly: true } : {}),
				createdAt: message.created_at,
			};
		});
}
