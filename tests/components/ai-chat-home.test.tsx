import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AiConversation } from "@/entities/ai-assistant/model/ai-assistant.types";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { AiChatHome } from "@/widgets/ai-chat/ui/AiChatHome";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/widgets/ai-chat/model/use-ai-chat", () => ({ useAiChat: vi.fn() }));
vi.mock("@/widgets/ai-chat/ui/AiChatComposer", () => ({
	AiChatComposer: ({ onSend }: { onSend: () => void }) => (
		<button type="button" onClick={onSend}>Send</button>
	),
}));

const scope = "user:1:workspace:1:global";
const conversation = {
	id: "conversation-a", workspace_id: "workspace-1", scope: "GLOBAL", page_id: null,
	title: "Release checklist", status: "ACTIVE",
	created_at: "2026-10-18T10:00:00Z", updated_at: "2026-10-18T10:00:00Z",
} as AiConversation;

const calls: string[] = [];
const hook = {
	prepareUnifiedAskSubmission: vi.fn((instruction: string) => {
		calls.push("reset");
		useAiChatStore.getState().newChat(scope);
		useAiChatStore.getState().setInput(scope, instruction);
		return true;
	}),
	sendMessage: vi.fn(async () => { calls.push("send"); }),
	selectHistoryConversation: vi.fn(() => true),
};

describe("Ask AI home", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		calls.length = 0;
		useAiChatStore.setState({ threads: {} });
		useAiChatStore.getState().setInput(scope, "Thêm checklist vào page Release");
		const query = { isPending: false, isError: false, hasNextPage: false, isFetchingNextPage: false };
		vi.mocked(useAiChat).mockImplementation(() => ({
			...hook,
			chatScope: scope, currentWorkspaceId: "workspace-1", isPending: false,
			conversations: [conversation],
			conversationsQuery: query, workspacePageConversationsQuery: query,
		}) as unknown as ReturnType<typeof useAiChat>);
	});

		it("queues a fresh chat, keeps the typed text and navigates before any request", async () => {
		await act(async () => {
			render(<AiChatHome />);
		});
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Send" }));
		});

			expect(calls).toEqual(["reset"]);
			expect(hook.prepareUnifiedAskSubmission).toHaveBeenCalledWith("Thêm checklist vào page Release");
			expect(hook.sendMessage).not.toHaveBeenCalled();
		expect(useAiChatStore.getState().threads[scope]?.input).toBe("Thêm checklist vào page Release");
		expect(push).toHaveBeenCalledWith("/dashboard/ai/chat");
	});

	it("opens a recent chat on the chat page", () => {
		render(<AiChatHome />);
		fireEvent.click(screen.getByRole("button", { name: /Release checklist/ }));

		expect(hook.selectHistoryConversation).toHaveBeenCalledWith(conversation.id);
		expect(push).toHaveBeenCalledWith("/dashboard/ai/chat");
	});
});
