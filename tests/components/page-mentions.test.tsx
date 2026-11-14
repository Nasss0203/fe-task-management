import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { ReadOnlyRichText } from "@/entities/page-block/ui/read-only-block-content";
import { PageBlockEditorProvider } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";
import { TextBlockEditor } from "@/widgets/page-block-renderer/ui/text-block-editor";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http, refreshAccessToken: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const PLAN = "33333333-3333-4333-8333-333333333333";
const SECRET = "44444444-4444-4444-8444-444444444444";

function textBlock(text: string): PageBlockNode {
	return {
		id: "block-1",
		page_id: "page-1",
		parent_block_id: null,
		row_id: null,
		type: PageBlockType.TEXT,
		title: null,
		position_x: null,
		position_y: null,
		width: null,
		height: null,
		order_index: 0,
		content: { text },
		style_config: {},
		data_config: {},
		created_by: "me",
		is_open: true,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		deleted_at: null,
		deleted_by: null,
		children: [],
	};
}

function renderEditor(block: PageBlockNode, shareToken?: string) {
	return renderWithClient(
		<PageBlockEditorProvider orderedBlockIds={[block.id]}>
			<TextBlockEditor block={block} shareToken={shareToken} />
		</PageBlockEditorProvider>,
	);
}

beforeEach(() => {
	vi.resetAllMocks();
	http.get.mockImplementation(async (url: string, config?: { params?: { q?: string; ids?: string } }) => {
		if (url === "/page/page-1") {
			return { data: { data: { id: "page-1", workspace_id: "ws-1", title: "Here" } } };
		}
		if (url === "/page/page-1/mention-candidates") return { data: { data: [] } };
		if (url === "/page/workspace/ws-1/search") {
			const pages = [
				{ pageId: "page-1", title: "Here", icon: null },
				{ pageId: PLAN, title: "Plan", icon: "📌" },
			];
			const search = (config?.params?.q ?? "").toLowerCase();
			return { data: { data: pages.filter((p) => p.title.toLowerCase().startsWith(search)) } };
		}
		if (url === "/page/workspace/ws-1/mention-titles") {
			const titles: Record<string, unknown> = {
				[PLAN]: { pageId: PLAN, title: "Plan Q4", icon: "📌" },
				[SECRET]: null,
			};
			const ids = (config?.params?.ids ?? "").split(",");
			return { data: { data: Object.fromEntries(ids.map((id) => [id, titles[id] ?? null])) } };
		}
		throw new Error("Unexpected GET " + url);
	});
	http.patch.mockImplementation(async (_url: string, input: { content: unknown }) => ({
		data: { data: { ...textBlock(""), content: input.content } },
	}));
});

describe("ReadOnlyRichText page mentions", () => {
	it("links a readable page by its current title", () => {
		renderWithClient(
			<ReadOnlyRichText
				text={`See @[page](page:${PLAN})`}
				pageTitles={{ [PLAN]: { pageId: PLAN, title: "Plan Q4", icon: null } }}
			/>,
		);

		expect(screen.getByRole("link", { name: "Plan Q4" })).toHaveAttribute("href", `/page/${PLAN}`);
		expect(screen.queryByText(/page:/)).toBeNull();
	});

	it("shows No access when the page cannot be read or titles are unavailable", () => {
		const { unmount } = renderWithClient(
			<ReadOnlyRichText text={`See @[page](page:${SECRET})`} pageTitles={{ [SECRET]: null }} />,
		);
		expect(screen.getByText("No access")).toBeInTheDocument();
		expect(screen.queryByRole("link")).toBeNull();
		unmount();

		renderWithClient(<ReadOnlyRichText text={`See @[page](page:${PLAN})`} />);
		expect(screen.getByText("No access")).toBeInTheDocument();
	});
});

describe("PageBlockList read-only page mentions", () => {
	it("shows readable titles to a member who can only view the page", async () => {
		renderWithClient(
			<PageBlockList
				pageId='page-1'
				canEdit={false}
				blocks={[textBlock(`See @[page](page:${PLAN}) and @[page](page:${SECRET})`)]}
			/>,
		);

		expect(await screen.findByRole("link", { name: /Plan Q4/ })).toHaveAttribute("href", `/page/${PLAN}`);
		expect(screen.getByText("No access")).toBeInTheDocument();
	});

	it("does not look titles up on a shared link", () => {
		renderWithClient(
			<PageBlockList
				pageId='page-1'
				canEdit={false}
				shareToken='share-token'
				blocks={[textBlock(`See @[page](page:${PLAN})`)]}
			/>,
		);

		expect(screen.getByText("No access")).toBeInTheDocument();
		expect(http.get).not.toHaveBeenCalledWith("/page/workspace/ws-1/mention-titles", expect.anything());
	});
});

describe("TextBlockEditor page mentions", () => {
	it("lists pages under People and saves the picked page without its title", async () => {
		const user = userEvent.setup();
		renderEditor(textBlock(""));

		const textarea = screen.getByRole("combobox");
		await user.type(textarea, "See @pl");

		await waitFor(() => {
			expect(screen.getByText("Pages")).toBeInTheDocument();
			expect(screen.getAllByRole("option")).toHaveLength(1);
			expect(screen.getByRole("option", { name: /Plan/ })).toHaveAttribute("aria-selected", "true");
		});

		await user.keyboard("{Enter}");
		expect(textarea).toHaveValue("See @Plan ");
		expect(screen.getByText("@Plan", { selector: "span" })).toHaveClass("text-ring");
		expect(textarea).toHaveClass("text-transparent");

		fireEvent.blur(textarea);
		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith(
				"/pageBlock/block-1",
				{ content: { text: `See @[page](page:${PLAN}) ` } },
				expect.anything(),
			),
		);
	});

	it("does not suggest the page being edited", async () => {
		const user = userEvent.setup();
		renderEditor(textBlock(""));

		await user.type(screen.getByRole("combobox"), "@he");

		await waitFor(() =>
			expect(http.get).toHaveBeenCalledWith(
				"/page/workspace/ws-1/search",
				expect.objectContaining({ params: { q: "he" } }),
			),
		);
		expect(screen.queryByRole("option", { name: /Here/ })).toBeNull();
	});

	it("shows the current title of a saved page mention and keeps the token unchanged", async () => {
		renderEditor(textBlock(`See @[page](page:${PLAN}) and @[page](page:${SECRET})`));

		expect(await screen.findByRole("link", { name: /Plan Q4/ })).toHaveAttribute("href", `/page/${PLAN}`);
		expect(screen.getByText("No access")).toBeInTheDocument();
		expect(screen.getByRole("combobox")).toHaveValue(`See @Plan Q4 and @[page](page:${SECRET})`);

		fireEvent.blur(screen.getByRole("combobox"));
		expect(http.patch).not.toHaveBeenCalled();
	});

	it("keeps two pages with the same title apart when the new one is picked before the old one", async () => {
		const OTHER = "55555555-5555-4555-8555-555555555555";
		const base = http.get.getMockImplementation();
		http.get.mockImplementation(async (url: string, config?: unknown) =>
			url === "/page/workspace/ws-1/search"
				? { data: { data: [{ pageId: OTHER, title: "Plan Q4", icon: null }] } }
				: base?.(url, config),
		);
		const user = userEvent.setup();
		renderEditor(textBlock(`x @[page](page:${PLAN})`));

		const textarea = screen.getByRole("combobox");
		await waitFor(() => expect(textarea).toHaveValue("x @Plan Q4"));
		await user.type(textarea, "@pl", { initialSelectionStart: 0, initialSelectionEnd: 0 });
		await user.click(await screen.findByRole("option", { name: /Plan Q4/ }));
		expect(textarea).toHaveValue("@Plan Q4 x @Plan Q4");

		fireEvent.blur(textarea);
		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith(
				"/pageBlock/block-1",
				{ content: { text: `@[page](page:${OTHER}) x @[page](page:${PLAN})` } },
				expect.anything(),
			),
		);
	});

	it("keeps every mention when the same page is picked again before it", async () => {
		const OTHER = "55555555-5555-4555-8555-555555555555";
		const base = http.get.getMockImplementation();
		http.get.mockImplementation(async (url: string, config?: { params?: { ids?: string } }) => {
			if (url === "/page/workspace/ws-1/search") {
				return { data: { data: [{ pageId: PLAN, title: "Plan Q4", icon: null }] } };
			}
			if (url === "/page/workspace/ws-1/mention-titles") {
				const ids = (config?.params?.ids ?? "").split(",");
				return {
					data: {
						data: Object.fromEntries(ids.map((id) => [id, { pageId: id, title: "Plan Q4", icon: null }])),
					},
				};
			}
			return base?.(url, config);
		});
		const user = userEvent.setup();
		renderEditor(textBlock(`x @[page](page:${PLAN}) y @[page](page:${OTHER})`));

		const textarea = screen.getByRole("combobox");
		await waitFor(() => expect(textarea).toHaveValue("x @Plan Q4 y @Plan Q4"));
		await user.type(textarea, "@pl", { initialSelectionStart: 0, initialSelectionEnd: 0 });
		await user.click(await screen.findByRole("option", { name: /Plan Q4/ }));

		fireEvent.blur(textarea);
		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith(
				"/pageBlock/block-1",
				{
					content: {
						text: `@[page](page:${PLAN}) x @[page](page:${PLAN}) y @[page](page:${OTHER})`,
					},
				},
				expect.anything(),
			),
		);
	});

	it("does not look titles up on a shared link", () => {
		renderEditor(textBlock(`See @[page](page:${PLAN})`), "share-token");

		expect(screen.getByText("No access")).toBeInTheDocument();
		expect(http.get).not.toHaveBeenCalled();
	});
});
