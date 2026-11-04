import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWrapInSection } from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { makePageBlock } from "../utils/page-block-fixture";
import { createWrapper } from "../utils/test-utils";

const http = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

beforeEach(() => {
	vi.resetAllMocks();
	http.post.mockResolvedValue({ data: { data: makePageBlock({ id: "section-1" }) } });
	http.patch.mockResolvedValue({ data: { data: makePageBlock() } });
});

describe("useWrapInSection", () => {
	it("adds a section right after the block, then moves the block into it", async () => {
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useWrapInSection(), { wrapper });

		let sectionId: string | undefined;
		await act(async () => {
			sectionId = await result.current.mutateAsync({
				blockId: "block-1",
				pageId: "page-1",
				parentBlockId: null,
			});
		});

		expect(http.post).toHaveBeenCalledWith(
			"/pageBlock",
			expect.objectContaining({
				type: PageBlockType.SECTION,
				after_block_id: "block-1",
				parent_block_id: null,
			}),
			expect.anything(),
		);
		expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1/move",
			{ target_parent_block_id: "section-1", target_order_index: 0 },
			expect.anything(),
		);
		expect(sectionId).toBe("section-1");
	});
});
