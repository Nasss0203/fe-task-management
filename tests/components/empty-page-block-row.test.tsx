import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { EmptyPageBlockRow } from "@/widgets/page-block-editor/ui/empty-page-block-row";
import { PageBlockEditorProvider } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http, refreshAccessToken: vi.fn() }));

// Menu lệnh (cmdk) cần ResizeObserver, jsdom không có
globalThis.ResizeObserver ??= class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;

beforeEach(() => {
	vi.resetAllMocks();
	http.post.mockImplementation(async (url: string, body: object) => {
		if (url.endsWith("/databases")) return { data: { data: { id: "db-1" } } };
		if (url.endsWith("/views")) return { data: { data: { id: "view-1" } } };
		return { data: { data: { id: "block-1", ...body } } };
	});
});

describe("EmptyPageBlockRow", () => {
	it("creates a database table as the first block of an empty page", async () => {
		const user = userEvent.setup();
		renderWithClient(
			<PageBlockEditorProvider orderedBlockIds={[]}>
				<EmptyPageBlockRow pageId='page-1' />
			</PageBlockEditorProvider>,
		);

		await user.click(screen.getByRole("button", { name: /Press/ }));
		await user.click(await screen.findByText("Table view"));

		// Tạo database, view, block đầu trang rồi gắn view vào block
		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith(
				"/pageBlock/block-1/database-views",
				{ database_id: "db-1", view_id: "view-1" },
				expect.anything(),
			),
		);
		expect(http.post).toHaveBeenCalledWith(
			"/pageBlock",
			expect.objectContaining({ page_id: "page-1", after_block_id: null, type: PageBlockType.DATABASE_VIEW }),
			expect.anything(),
		);
	});

	it("creates a board when Board view is picked", async () => {
		const user = userEvent.setup();
		renderWithClient(
			<PageBlockEditorProvider orderedBlockIds={[]}>
				<EmptyPageBlockRow pageId='page-1' />
			</PageBlockEditorProvider>,
		);

		await user.click(screen.getByRole("button", { name: /Press/ }));
		await user.click(await screen.findByText("Board view"));

		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith("/databases/db-1/views", { name: "Board", type: "BOARD" }),
		);
	});
});
