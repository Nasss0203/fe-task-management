import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { ReadOnlyRichText } from "@/entities/page-block/ui/read-only-block-content";
import { PageBlockEditorProvider } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { HeadingBlockEditor } from "@/widgets/page-block-renderer/ui/heading-block-editor";
import { TextBlockEditor } from "@/widgets/page-block-renderer/ui/text-block-editor";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const LAN = "11111111-1111-4111-8111-111111111111";
const MINH = "22222222-2222-4222-8222-222222222222";

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
	http.get.mockImplementation(async (url: string, config?: { params?: { q?: string } }) => {
		if (url === "/page/page-1/mention-candidates") {
			const users = [
				{ id: LAN, username: "Lan", email: "lan@x", avatar_url: null },
				{ id: MINH, username: "Minh", email: "minh@x", avatar_url: null },
			];
			const search = (config?.params?.q ?? "").toLowerCase();
			return { data: { data: users.filter((u) => u.username.toLowerCase().startsWith(search)) } };
		}
		throw new Error("Unexpected GET " + url);
	});
	http.patch.mockImplementation(async (_url: string, input: { content: unknown }) => ({
		data: { data: { ...textBlock(""), content: input.content } },
	}));
});

describe("ReadOnlyRichText mentions", () => {
	it("shows a mention token as a highlighted name, also inside bold", () => {
		renderWithClient(<ReadOnlyRichText text={`Hi @[Lan](user:${LAN}) and **@[Minh](user:${MINH})**`} />);

		expect(screen.getByText("@Lan")).toHaveClass("text-ring");
		const minh = screen.getByText("@Minh");
		expect(minh).toHaveClass("text-ring");
		expect(minh.closest("strong")).not.toBeNull();
		expect(screen.queryByText(/user:/)).toBeNull();
	});
});

describe("TextBlockEditor mentions", () => {
	it("shows saved mentions as @Name while editing and as a chip otherwise", async () => {
		renderEditor(textBlock(`Ask @[Lan](user:${LAN}) today`));

		const textarea = screen.getByRole("combobox");
		expect(textarea).toHaveValue("Ask @Lan today");
		expect(screen.getByText("@Lan", { selector: "span" })).toHaveClass("text-ring");
	});

	it("suggests people after @ and saves the pick as a token", async () => {
		const user = userEvent.setup();
		renderEditor(textBlock(""));

		const textarea = screen.getByRole("combobox");
		await user.type(textarea, "Hi @mi");

		await waitFor(() => {
			expect(screen.getAllByRole("option")).toHaveLength(1);
			expect(screen.getByRole("option", { name: /Minh/ })).toHaveAttribute("aria-selected", "true");
		});

		await user.keyboard("{Enter}");
		expect(textarea).toHaveValue("Hi @Minh ");
		expect(screen.queryByRole("listbox")).toBeNull();
		expect(http.post).not.toHaveBeenCalled();

		await user.type(textarea, "please");
		fireEvent.blur(textarea);

		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith(
				"/pageBlock/block-1",
				{ content: { text: `Hi @[Minh](user:${MINH}) please` } },
				expect.anything(),
			),
		);
	});

	it("keeps Enter splitting the block when no suggestion is open", async () => {
		const user = userEvent.setup();
		http.post.mockResolvedValue({ data: { data: { ...textBlock(""), id: "block-2" } } });
		renderEditor(textBlock(`Ask @[Lan](user:${LAN})`));

		const textarea = screen.getByRole("combobox");
		await user.click(textarea);
		await user.keyboard("{End}{Enter}");

		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith(
				"/pageBlock/block-1",
				{ content: { text: `Ask @[Lan](user:${LAN})` } },
				expect.anything(),
			),
		);
	});

	it("does not look people up on a shared link", async () => {
		const user = userEvent.setup();
		renderEditor(textBlock(""), "share-token");

		await user.type(screen.getByRole("textbox"), "Hi @la");

		expect(screen.queryByRole("listbox")).toBeNull();
		expect(http.get).not.toHaveBeenCalled();
	});
});

describe("HeadingBlockEditor mentions", () => {
	it("keeps a saved mention highlighted after the heading is focused", async () => {
		const user = userEvent.setup();
		const block = {
			...textBlock(`Plan @[Lan](user:${LAN})`),
			type: PageBlockType.HEADER,
			style_config: { level: 1 },
		};
		renderWithClient(
			<PageBlockEditorProvider orderedBlockIds={[block.id]}>
				<HeadingBlockEditor block={block} />
			</PageBlockEditorProvider>,
		);

		const chip = screen.getByText("@Lan", { selector: "span" });
		expect(chip).toHaveClass("text-ring");
		expect(screen.getByRole("combobox")).toHaveValue("Plan @Lan");

		await user.click(chip);
		expect(screen.getByRole("combobox")).toHaveFocus();
		expect(screen.getByRole("combobox")).toHaveClass("text-transparent");
		expect(screen.getByText("@Lan", { selector: "span" })).toHaveClass("text-ring");
	});

	it("suggests people after @ and saves the pick as a token", async () => {
		const user = userEvent.setup();
		const block = { ...textBlock(""), type: PageBlockType.HEADER, style_config: { level: 1 } };
		renderWithClient(
			<PageBlockEditorProvider orderedBlockIds={[block.id]}>
				<HeadingBlockEditor block={block} />
			</PageBlockEditorProvider>,
		);

		const input = screen.getByRole("combobox");
		await user.type(input, "Plan @mi");
		await waitFor(() => {
			expect(screen.getAllByRole("option")).toHaveLength(1);
			expect(screen.getByRole("option", { name: /Minh/ })).toHaveAttribute("aria-selected", "true");
		});

		await user.keyboard("{Enter}");
		expect(input).toHaveValue("Plan @Minh ");
		expect(http.post).not.toHaveBeenCalled();

		fireEvent.blur(input);
		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith(
				"/pageBlock/block-1",
				{ content: { text: `Plan @[Minh](user:${MINH}) ` } },
				expect.anything(),
			),
		);
	});
});
