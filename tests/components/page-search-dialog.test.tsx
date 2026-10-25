import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const searchHook = vi.fn();

globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push }),
}));

vi.mock("@/entities/page/model/page.queries", () => ({
	usePageSearch: (...args: unknown[]) => searchHook(...args),
}));

import { PageSearchDialog, usePageSearchDialog } from "@/features/page-search";

describe("PageSearchDialog", () => {
	beforeEach(() => {
		push.mockReset();
		searchHook.mockReset();
		usePageSearchDialog.setState({ open: false });
		searchHook.mockReturnValue({
			data: [
				{
					pageId: "page-1",
					title: "Kế hoạch sprint",
					icon: "🚀",
					teamspaceId: null,
					parentPageId: null,
					updatedAt: "2026-10-25T00:00:00.000Z",
					matchedIn: "content",
					snippet: "…Lên kế hoạch sprint…",
				},
			],
			isFetching: false,
			isError: false,
		});
	});

	it("opens with Ctrl+K, searches the workspace and opens the chosen page", () => {
		render(<PageSearchDialog workspaceId='ws-1' />);

		expect(screen.queryByPlaceholderText("Search pages and content…")).toBeNull();

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });

		expect(screen.getByPlaceholderText("Search pages and content…")).toBeInTheDocument();
		expect(searchHook).toHaveBeenLastCalledWith("ws-1", "", true);
		expect(screen.getByText("Recently edited")).toBeInTheDocument();
		expect(screen.getByText("…Lên kế hoạch sprint…")).toBeInTheDocument();

		fireEvent.click(screen.getByText("Kế hoạch sprint"));

		expect(push).toHaveBeenCalledWith("/page/page-1");
		expect(usePageSearchDialog.getState().open).toBe(false);
	});

	it("does not query while closed", () => {
		render(<PageSearchDialog workspaceId='ws-1' />);

		expect(searchHook).toHaveBeenLastCalledWith("ws-1", "", false);
	});
});
