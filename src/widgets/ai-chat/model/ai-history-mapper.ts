import type {
	AiCapability,
	AiGeneration,
	AiHistoryMessage,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import type { AiChatMessage } from "./types";

const DEFAULT_CAPABILITY: AiCapability = "writing.improve";

export function mapAiHistoryMessages(
	messages: AiHistoryMessage[],
	generations: AiGeneration[],
	options: { previewOnly?: boolean } = {},
): AiChatMessage[] {
	const generationById = new Map(generations.map((generation) => [generation.id, generation]));
	return messages
		.filter((message) => message.role === "USER" || message.role === "ASSISTANT")
		.map((message) => {
			const linkedId = message.metadata?.generationId;
			const generation = typeof linkedId === "string"
				? generationById.get(linkedId)
				: undefined;
			const metadataCapability = message.metadata?.capability;
			const capability = generation?.capability ??
				(typeof metadataCapability === "string"
					? metadataCapability as AiCapability
					: DEFAULT_CAPABILITY);
			return {
				id: message.id,
				role: message.role === "USER" ? "user" : "assistant",
				content: message.content,
				capability,
					...(generation ? { generation } : {}),
					...(generation?.capability === "GENERATE_PAGE_MODIFICATION_PLAN" && options.previewOnly
						? { previewOnly: true } : {}),
				createdAt: message.created_at,
			};
		});
}
