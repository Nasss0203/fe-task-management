import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageBlockRowProvider } from "@/entities/page-block/model/page-block-row-scope";
import {
	useCreatePageBlock,
	useDeletePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { makePageBlock } from "../utils/page-block-fixture";
import { createWrapper } from "../utils/test-utils";

const http = vi.hoisted(() => ({ post: vi.fn(), delete: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const block = makePageBlock();
const pageId = block.page_id;

function setup(rowId: string | null) {
	const { wrapper: Base, queryClient } = createWrapper();
	const wrapper = ({ children }: { children: ReactNode }) => (
		<Base>
			<PageBlockRowProvider value={rowId}>{children}</PageBlockRowProvider>
		</Base>
	);
	const pageKey = pageBlockKeys.byPage(pageId);
	const rowKey = pageBlockKeys.byRow("row-1");
	queryClient.setQueryData(pageKey, [block]);
	queryClient.setQueryData(rowKey, [block]);
	const stale = () => ({
		page: queryClient.getQueryState(pageKey)?.isInvalidated,
		row: queryClient.getQueryState(rowKey)?.isInvalidated,
	});
	return { wrapper, stale };
}

beforeEach(() => {
	vi.resetAllMocks();
	http.post.mockResolvedValue({ data: { data: block } });
	http.delete.mockResolvedValue(undefined);
});

describe("block writes inside a task", () => {
	it("creates the block in the task and refreshes only the task's content", async () => {
		const { wrapper, stale } = setup("row-1");
		const { result } = renderHook(() => useCreatePageBlock(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({ pageId, type: PageBlockType.TEXT });
		});

		expect(http.post).toHaveBeenCalledWith(
			"/pageBlock",
			expect.objectContaining({ page_id: pageId, row_id: "row-1" }),
			expect.anything(),
		);
		expect(stale()).toEqual({ page: false, row: true });
	});

	it("keeps page content writes on the page", async () => {
		const { wrapper, stale } = setup(null);
		const { result } = renderHook(() => useDeletePageBlock(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({ pageId, blockId: block.id });
		});

		expect(stale()).toEqual({ page: true, row: false });
	});
});
