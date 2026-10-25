import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	aiHistorySelectionKey,
	saveSelectedAiConversation,
} from "@/widgets/ai-chat/model/ai-history-selection";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { HeaderWorkspaceContainer } from "@/widgets/workspace-sidebar/ui/header-workspace-container";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
	usePathname: () => "/dashboard/ai/chat",
	useParams: () => ({}),
	useRouter: () => ({ push }),
}));
vi.mock("@/entities/page/model/page.queries", () => ({ usePage: () => ({ data: undefined }) }));
vi.mock("@/entities/template", () => ({ usePublicTemplate: () => ({ data: undefined }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: [{ id: "workspace-a" }] }),
	useWorkspace: () => ({ data: { name: "Test workspace" } }),
}));
vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "user-a", lastActiveWorkspaceId: "workspace-a" } }),
}));
vi.mock("@/entities/ai-assistant/model/ai-assistant.queries", () => ({
	useAiHistoryConversations: (_userId: string, filters: { scope: string } | null) => ({
		data: filters?.scope === "GLOBAL"
			? { pages: [{ items: [{ id: "conversation-from-server", title: "Thêm checklist" }] }] }
			: undefined,
	}),
}));
vi.mock("@/widgets/workspace-sidebar/ui/header-workspace", () => ({
	HeaderWorkspace: ({ rightAction, customBreadcrumbs }: {
		rightAction: React.ReactNode;
		customBreadcrumbs?: { label: string }[];
	}) => (
		<div>
			<nav aria-label="breadcrumb">{customBreadcrumbs?.map((crumb) => crumb.label).join(" / ")}</nav>
			{rightAction}
		</div>
	),
}));

describe("Phase 4 Dashboard header New Chat", () => {
	const key = aiHistorySelectionKey("user-a", "workspace-a");
	const scope = getAiChatScope(undefined, "workspace-a", "user-a");
	beforeEach(() => {
		localStorage.clear();
		push.mockClear();
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
		expect(push).toHaveBeenCalledWith("/dashboard/ai");
	});

	it("shows the selected chat title in the breadcrumb", () => {
		saveSelectedAiConversation(key, "conversation-from-server");
		render(<HeaderWorkspaceContainer />);
		expect(screen.getByRole("navigation", { name: "breadcrumb" }).textContent)
			.toBe("Test workspace / Ask AI / Thêm checklist");
	});

	it("does not allow New Chat while a request in that workspace is pending", () => {
		saveSelectedAiConversation(key, "conversation-from-server");
		useAiChatStore.getState().beginRequest(scope, "request-1", "planning-modification");
		render(<HeaderWorkspaceContainer />);
		const button = screen.getByRole("button", { name: "New chat" });
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(localStorage.getItem(key!)).toBe("conversation-from-server");
		expect(push).not.toHaveBeenCalled();
	});

	it.each(["confirm", "discard"] as const)("preserves storage/store during %s preflight", (type) => {
		saveSelectedAiConversation(key, "conversation-from-server");
		useAiChatStore.getState().setConversation(scope, "conversation-from-server", "workspace-a");
		useAiChatStore.getState().acquireOperation({ type, generationId: "draft-1", userId: "user-a", workspaceId: "workspace-a",
			pageId: null, chatScope: scope, epoch: 0 });
		render(<HeaderWorkspaceContainer />);
		const button = screen.getByRole("button", { name: "New chat" });
		expect(button).toBeDisabled();
		fireEvent.click(button);
		expect(localStorage.getItem(key!)).toBe("conversation-from-server");
		expect(useAiChatStore.getState().threads[scope].conversationId).toBe("conversation-from-server");
		expect(push).not.toHaveBeenCalled();
	});
});
