import { beforeEach, describe, expect, it } from "vitest";

import { mapAiHistoryMessages } from "@/widgets/ai-chat/model/ai-history-mapper";
import {
	aiHistorySelectionKey,
	saveSelectedAiConversation,
} from "@/widgets/ai-chat/model/ai-history-selection";
import type {
	AiGeneration,
	AiHistoryMessage,
} from "@/entities/ai-assistant/model/ai-assistant.types";

describe("AI Chat History Phase 4", () => {
	beforeEach(() => window.localStorage.clear());

	it("keeps selected PAGE/GLOBAL conversation ids isolated by user and workspace", () => {
		const globalA = aiHistorySelectionKey("user-a", "workspace-1");
		const pageA = aiHistorySelectionKey("user-a", "workspace-1", "page-1");
		const globalB = aiHistorySelectionKey("user-b", "workspace-1");
		const otherWorkspace = aiHistorySelectionKey("user-a", "workspace-2");

		saveSelectedAiConversation(pageA, "conversation-page");
		saveSelectedAiConversation(globalA, "conversation-global");
		expect(localStorage.getItem(pageA!)).toBe("conversation-page");
		expect(localStorage.getItem(globalA!)).toBe("conversation-global");
		expect(localStorage.getItem(globalB!)).toBeNull();
		expect(localStorage.getItem(otherWorkspace!)).toBeNull();

		saveSelectedAiConversation(globalA, null);
		expect(localStorage.getItem(globalA!)).toBe("");
		expect(localStorage.getItem(pageA!)).toBe("conversation-page");
		expect(aiHistorySelectionKey(undefined, "workspace-1")).toBeNull();
	});

	it("links saved ASSISTANT messages to their generation preview without persisting chat content", () => {
		const generation = {
			id: "generation-1",
			capability: "GENERATE_PAGE_MODIFICATION_PLAN",
			status: "COMPLETED",
			conversation_id: "conversation-1",
		} as AiGeneration;
		const messages: AiHistoryMessage[] = [
			{
				id: "message-user",
				conversation_id: "conversation-1",
				role: "USER",
				content: "Create tasks",
				metadata: { generationId: "generation-1" },
				created_at: "2026-10-17T10:00:00.000Z",
			},
			{
				id: "message-assistant",
				conversation_id: "conversation-1",
				role: "ASSISTANT",
				content: "Tasks prepared",
				metadata: {
					generationId: "generation-1",
					capability: "GENERATE_PAGE_MODIFICATION_PLAN",
				},
				created_at: "2026-10-17T10:00:01.000Z",
			},
			{
				id: "message-system",
				conversation_id: "conversation-1",
				role: "SYSTEM",
				content: "internal",
				metadata: null,
				created_at: "2026-10-17T10:00:02.000Z",
			},
		];
		const result = mapAiHistoryMessages(messages, [generation]);
		expect(result).toHaveLength(2);
		expect(result[0].role).toBe("user");
		expect(result[1].generation).toBe(generation);
		expect(result[1].capability).toBe("GENERATE_PAGE_MODIFICATION_PLAN");
		expect(result.some((message) => message.content === "internal")).toBe(false);
	});
});
