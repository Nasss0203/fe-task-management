import type {
	AiGeneration,
	AiHistoryMessage,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import type { AiChatMessage } from "./types";
import { isAiCapability } from "./ai-capability";
import { validSources } from "./ai-ask-response-mapper";

/** M8: the source Pages saved with a draft, so a reopened draft still shows "Dựa trên". */
function savedSources(generation: AiGeneration) {
	const output = generation.output_data;
	const pageId = output && typeof output === "object" && !Array.isArray(output) && "pageId" in output
		? output.pageId : undefined;
	return generation.capability === "GENERATE_PAGE_MODIFICATION_PLAN" && generation.sources !== undefined &&
		validSources(generation.sources, pageId) ? generation.sources : undefined;
}

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
			const sources = generation && message.role === "ASSISTANT" ? savedSources(generation) : undefined;
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
					...(sources ? { sources } : {}),
					...(generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN" && options.previewOnly
						? { previewOnly: true } : {}),
				createdAt: message.created_at,
			};
		});
}
