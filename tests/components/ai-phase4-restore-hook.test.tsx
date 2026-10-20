import { act, renderHook, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
	AiConversation, AiGeneration, AiHistoryMessage,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import {
	aiHistorySelectionKey, saveSelectedAiConversation,
} from "@/widgets/ai-chat/model/ai-history-selection";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";

const state = vi.hoisted(() => ({
	createConversation: vi.fn(), submitMessage: vi.fn(), generatePagePlan: vi.fn(), invalidateQueries: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@tanstack/react-query", () => ({
	useQueryClient: () => ({ invalidateQueries: state.invalidateQueries }),
}));
vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "user-1", lastActiveWorkspaceId: "workspace-1" } }),
}));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: [{ id: "workspace-1" }] }),
}));
vi.mock("@/entities/page/model/page.queries", () => ({
	usePage: () => ({ data: undefined }),
}));
vi.mock("@/entities/ai-assistant/model/ai-assistant.mutations", () => {
	const unused = { mutateAsync: vi.fn(), isPending: false };
	return {
		useConfirmAiModificationPlan: () => unused,
		useConfirmPageComposition: () => unused,
		useCreateAiConversation: () => ({ mutateAsync: state.createConversation, isPending: false }),
		useDiscardAiGeneration: () => unused,
		useGenerateAiModificationPlan: () => unused,
		useGeneratePagePlanFromInstruction: () => ({ mutateAsync: state.generatePagePlan, isPending: false }),
		useSubmitAiMessage: () => ({ mutateAsync: state.submitMessage, isPending: false }),
	};
});

const pageConversation = {
	id: "page-conversation", workspace_id: "workspace-1", scope: "PAGE", page_id: "page-1",
	title: "QA draft", status: "ACTIVE", created_at: "2026-10-18T10:00:00Z",
	updated_at: "2026-10-18T10:00:00Z",
} as AiConversation;
const globalConversation = {
	...pageConversation, id: "global-conversation", scope: "GLOBAL", page_id: null,
} as AiConversation;
const savedGeneration = {
	id: "generation-1", conversation_id: "page-conversation",
	capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED",
	output_data: {
		type: "AI_MODIFICATION_PLAN", schemaVersion: 1, status: "PLAN_READY",
		pageId: "page-1", summary: "Add QA", operations: [],
	},
} as AiGeneration;
const pageMessages: AiHistoryMessage[] = [{
	id: "user-message", conversation_id: pageConversation.id, role: "USER",
	content: "Thêm heading QA vào page QA draft", metadata: { generationId: savedGeneration.id },
	created_at: "2026-10-18T10:00:00Z",
}, {
	id: "assistant-message", conversation_id: pageConversation.id, role: "ASSISTANT",
	content: "Preview ready", metadata: { generationId: savedGeneration.id },
	created_at: "2026-10-18T10:00:01Z",
}];
// React Query keeps cached data references stable across unrelated Zustand
// rerenders. The test doubles must do the same to avoid synthetic effect loops.
const globalConversationsResult = { data: { pages: [{ items: [globalConversation] }] }, isPending: false, isSuccess: true };
const pageConversationsResult = { data: { pages: [{ items: [pageConversation] }] }, isPending: false, isSuccess: true };
const pageMessagesResult = { data: { pages: [{ items: pageMessages }] }, isPending: false, isSuccess: true };
const pageGenerationsResult = { data: { pages: [{ items: [savedGeneration] }] }, isPending: false, isSuccess: true };
const emptyMessagesResult = { data: { pages: [{ items: [] }] }, isPending: false, isSuccess: true };

vi.mock("@/entities/ai-assistant/model/ai-assistant.queries", () => ({
	aiHistoryKeys: {
		conversations: (...args: unknown[]) => ["conversation", ...args],
		messages: (...args: unknown[]) => ["messages", ...args],
		generations: (...args: unknown[]) => ["generations", ...args],
	},
	useAiHistoryConversations: (_userId: string, filter: { scope?: string } | null) =>
		filter?.scope === "PAGE" ? pageConversationsResult : globalConversationsResult,
	useAiHistoryMessages: (_userId: string, id: string | null) =>
		id === pageConversation.id ? pageMessagesResult : emptyMessagesResult,
	useAiHistoryGenerations: (_userId: string, id: string | null) =>
		id === pageConversation.id ? pageGenerationsResult : emptyMessagesResult,
}));

describe("Phase 4 F5 restoration from Backend history", () => {
	const key = aiHistorySelectionKey("user-1", "workspace-1");
	const scope = getAiChatScope(undefined, "workspace-1", "user-1");
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
		useAiChatStore.setState({ threads: {} });
		state.invalidateQueries.mockResolvedValue(undefined);
	});

	it("rebuilds PAGE messages with an actionable draft after a fresh mount", async () => {
		saveSelectedAiConversation(key, pageConversation.id);
		const { result } = renderHook(() => useAiChat());
		expect(result.current.conversations.map((item) => item.scope)).toEqual(["PAGE", "GLOBAL"]);
		await waitFor(() => {
			const thread = useAiChatStore.getState().threads[scope];
			expect(thread?.messages).toHaveLength(2);
			expect(thread?.messages[1].generation?.id).toBe(savedGeneration.id);
				expect(thread?.messages[1].previewOnly).toBeUndefined();
		});
	});

	it("creates a new GLOBAL conversation when sending Writing after a PAGE draft", async () => {
		saveSelectedAiConversation(key, pageConversation.id);
		state.createConversation.mockResolvedValue({ id: "new-global-conversation" });
		state.submitMessage.mockResolvedValue({
			id: "writing-generation", conversation_id: "new-global-conversation",
			capability: "writing.improve", status: "COMPLETED", output_data: { text: "Improved text" },
			created_at: "2026-10-18T10:00:01Z",
		});
		const { result } = renderHook(() => useAiChat());
		await waitFor(() => expect(useAiChatStore.getState().threads[scope]?.messages).toHaveLength(2));
		act(() => {
			useAiChatStore.getState().setMode(scope, "writing.improve");
			useAiChatStore.getState().setInput(scope, "Viết lại đoạn này");
		});
		await act(async () => { await result.current.sendMessage(); });
		expect(state.createConversation).toHaveBeenCalledWith(expect.objectContaining({
			workspaceId: "workspace-1", scope: "GLOBAL",
		}));
		expect(state.submitMessage).toHaveBeenCalledWith(expect.objectContaining({
			conversationId: "new-global-conversation",
		}));
	});

	it.each([
		[401, "Your session has expired"],
		[403, "don't have permission"],
		[502, "AI service is temporarily unavailable"],
	])("shows HTTP %s failure in Chat and clears pending state", async (status, feedback) => {
		state.generatePagePlan.mockRejectedValue(new AxiosError(
			"private backend error", "ERR_BAD_RESPONSE", undefined, undefined,
			{ status } as never,
		));
		const { result } = renderHook(() => useAiChat());
		act(() => {
			useAiChatStore.getState().setMode(scope, "GENERATE_PAGE_MODIFICATION_PLAN");
			useAiChatStore.getState().setInput(scope, "Thêm heading QA vào page QA draft");
		});
		await act(async () => { await result.current.sendMessage(); });
		const thread = useAiChatStore.getState().threads[scope];
		expect(thread.messages[1].content).toContain(feedback);
		expect(thread.messages[1].content).not.toContain("private backend error");
		expect(thread.activeRequestId).toBeNull();
		expect(thread.pendingStage).toBeNull();
	});
});
