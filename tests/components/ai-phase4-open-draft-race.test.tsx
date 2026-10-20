import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiConversation, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { AiChat } from "@/widgets/ai-chat/ui/AiChat";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api", () => ({ getAiGeneration: vi.fn() }));
vi.mock("@/widgets/ai-chat/model/use-ai-chat", () => ({ useAiChat: vi.fn() }));
vi.mock("@/widgets/ai-chat/ui/AiChatComposer", () => ({ AiChatComposer: () => null }));
vi.mock("@/widgets/ai-chat/ui/AiChatEmptyState", () => ({ AiChatEmptyState: () => null }));

const draft = {
	id: "draft-a", conversation_id: "conversation-a",
	capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED",
	created_at: "2026-10-18T10:00:00Z",
	output_data: {
		type: "AI_MODIFICATION_PLAN", schemaVersion: 1, status: "PLAN_READY",
		pageId: "page-1", summary: "QA", operations: [],
	},
} as AiGeneration;

const conversation = {
	id: "conversation-a", workspace_id: "workspace-1", scope: "PAGE", page_id: "page-1",
	title: "QA draft", status: "ACTIVE", created_at: "2026-10-18T10:00:00Z",
	updated_at: "2026-10-18T10:00:00Z",
} as AiConversation;

let selectedId: string | null = conversation.id;

function stubChatHook() {
	const query = { isPending: false, isError: false, hasNextPage: false,
		isFetchingNextPage: false, fetchNextPage: vi.fn() };
	vi.mocked(useAiChat).mockImplementation(() => ({
		chatScope: "user:1:workspace:1:global", currentWorkspaceId: "workspace-1",
		selectedConversationId: selectedId,
		conversations: [conversation], savedGenerations: selectedId ? [draft] : [],
		conversationsQuery: query, workspacePageConversationsQuery: query,
		messagesQuery: query, generationsQuery: query,
		isPending: false, pendingStage: null, sendMessage: vi.fn(),
		selectPageCandidate: vi.fn(), confirmPageComposition: vi.fn(),
		confirmAiModificationPlan: vi.fn(), discardGeneration: vi.fn(),
		startNewChat: vi.fn(), selectHistoryConversation: vi.fn(),
	}) as unknown as ReturnType<typeof useAiChat>);
}

describe("Phase 4 saved-draft request races", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		selectedId = conversation.id;
		useAiChatStore.setState({ threads: {} });
		stubChatHook();
	});

	it("does not show a stale loading state or preview after switching conversations", async () => {
		let resolveDraft!: (value: AiGeneration) => void;
		vi.mocked(getAiGeneration).mockReturnValue(new Promise((resolve) => { resolveDraft = resolve; }));
		const { rerender } = render(<AiChat currentPageId="page-1" />);
		fireEvent.click(screen.getByRole("button", { name: /History/ }));
		fireEvent.click(screen.getByRole("button", { name: /Page modification/ }));
		expect(screen.getByText("Loading draft...")).toBeTruthy();

		selectedId = "conversation-b";
		rerender(<AiChat currentPageId="page-1" />);
		expect(screen.queryByText("Loading draft...")).toBeNull();
		await act(async () => { resolveDraft(draft); });
		expect(screen.queryByText("Saved generation preview")).toBeNull();

		selectedId = conversation.id;
		rerender(<AiChat currentPageId="page-1" />);
		expect(screen.queryByText("Saved generation preview")).toBeNull();
	});

	it("can open a saved draft from Page chat History with actions requiring confirmation", async () => {
		vi.mocked(getAiGeneration).mockResolvedValue(draft);
		render(<AiChat currentPageId="page-1" />);
		fireEvent.click(screen.getByRole("button", { name: /History/ }));
		fireEvent.click(screen.getByRole("button", { name: /Page modification/ }));
		expect(await screen.findByText("Saved generation preview")).toBeTruthy();
		expect(screen.getByRole("button", { name: /Apply changes/ })).toBeTruthy();
		expect(screen.getByRole("button", { name: /Discard/ })).toBeTruthy();
	});
});
