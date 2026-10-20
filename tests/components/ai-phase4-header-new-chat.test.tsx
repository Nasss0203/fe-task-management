import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	aiHistorySelectionKey,
	saveSelectedAiConversation,
} from "@/widgets/ai-chat/model/ai-history-selection";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { HeaderWorkspaceContainer } from "@/widgets/workspace-sidebar/ui/header-workspace-container";

vi.mock("next/navigation", () => ({
	usePathname: () => "/dashboard/ai",
	useParams: () => ({}),
}));
vi.mock("@/entities/page/model/page.queries", () => ({ usePage: () => ({ data: undefined }) }));
vi.mock("@/entities/template", () => ({ useTemplateDetail: () => ({ data: undefined }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: [{ id: "workspace-a" }] }),
	useWorkspace: () => ({ data: { name: "Test workspace" } }),
}));
vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "user-a", lastActiveWorkspaceId: "workspace-a" } }),
}));
vi.mock("@/widgets/workspace-sidebar/ui/header-workspace", () => ({
	HeaderWorkspace: ({ rightAction }: { rightAction: React.ReactNode }) => <div>{rightAction}</div>,
}));

describe("Phase 4 Dashboard header New Chat", () => {
	const key = aiHistorySelectionKey("user-a", "workspace-a");
	const scope = getAiChatScope(undefined, "workspace-a", "user-a");
	beforeEach(() => {
		localStorage.clear();
		useAiChatStore.setState({ threads: {} });
	});

	it("remains enabled after F5 when a saved conversation exists but no messages have loaded", () => {
		saveSelectedAiConversation(key, "conversation-from-server");
		render(<HeaderWorkspaceContainer />);
		const button = screen.getByRole("button", { name: "New chat" });
		expect(button).toBeEnabled();
		fireEvent.click(button);
		expect(localStorage.getItem(key!)).toBe("");
		expect(button).toBeDisabled();
	});

	it("does not allow New Chat while a request in that workspace is pending", () => {
		saveSelectedAiConversation(key, "conversation-from-server");
		useAiChatStore.getState().beginRequest(scope, "request-1", "planning-modification");
		render(<HeaderWorkspaceContainer />);
		const button = screen.getByRole("button", { name: "New chat" });
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(localStorage.getItem(key!)).toBe("conversation-from-server");
	});
});
