import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AiChat } from "@/widgets/ai-chat/ui/AiChat";
import { useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";

const state = vi.hoisted(() => ({ send: vi.fn(), unified: vi.fn(), reset: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock("@/widgets/ai-chat/model/use-ai-chat", () => ({
  useAiChat: () => ({
    chatScope: "guard-test", currentWorkspaceId: "workspace-1", selectedConversationId: null,
    sendMessage: state.send, sendUnifiedAsk: state.unified, startNewChat: state.reset,
	consumeUnifiedAskSubmission: () => Promise.resolve(false),
    isPending: false, pendingStage: null, conversationsQuery: {}, messagesQuery: {}, generationsQuery: {},
  }),
}));
vi.mock("@/widgets/ai-chat/ui/AiChatComposer", () => ({
  AiChatComposer: ({ onSend }: { onSend: () => void }) => <button onClick={onSend}>Send composer</button>,
}));
vi.mock("@/widgets/ai-chat/ui/AiChatHeader", () => ({
  AiChatHeader: ({ onNewChat }: { onNewChat: () => void }) => <button onClick={onNewChat}>Reset chat</button>,
}));
vi.mock("@/widgets/ai-chat/ui/AiChatEmptyState", () => ({ AiChatEmptyState: () => null }));
vi.mock("@/widgets/ai-chat/ui/AiModificationActionDialog", () => ({ AiModificationActionDialog: () => null }));

beforeEach(() => { vi.resetAllMocks(); useAiChatStore.setState({ threads: {} }); });
describe("Unified Ask Composer activation", () => {
  it("routes Composer Send through Unified Ask without a capability", () => {
    useAiChatStore.getState().setInput("guard-test", "Write a summary");
    render(<AiChat />);
    fireEvent.click(screen.getByRole("button", { name: "Send composer" }));
    expect(state.unified).toHaveBeenCalledWith({ instruction: "Write a summary" });
    expect(state.send).not.toHaveBeenCalled();
  });
  it("does not navigate when hook reset is refused", () => {
    state.reset.mockReturnValue(false);
    render(<AiChat showHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Reset chat" }));
    expect(state.reset).toHaveBeenCalledTimes(1);
    expect(state.push).not.toHaveBeenCalled();
  });
  it("navigates after a successful hook reset", () => {
    state.reset.mockReturnValue(true);
    render(<AiChat showHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Reset chat" }));
    expect(state.push).toHaveBeenCalledWith("/dashboard/ai");
  });
});

