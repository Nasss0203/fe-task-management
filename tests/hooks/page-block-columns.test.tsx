import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreatePageBlockColumns } from "@/entities/page-block/model/page-block.mutations";
import { makePageBlock } from "../utils/page-block-fixture";
import { createWrapper } from "../utils/test-utils";

const http = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

let created = 0;

beforeEach(() => {
	vi.resetAllMocks();
	created = 0;
	http.post.mockImplementation(async (url: string) =>
		url === "/pageBlock"
			? { data: { data: makePageBlock({ id: `new-${++created}` }) } }
			: { data: { data: makePageBlock({ id: "row" }) } },
	);
});

describe("useCreatePageBlockColumns", () => {
	it("adds an empty block per missing column, then sets them side by side", async () => {
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCreatePageBlockColumns(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({
				pageId: "page-1",
				parentBlockId: null,
				afterBlockId: "a",
				count: 3,
			});
		});

		const creates = http.post.mock.calls.filter(([url]) => url === "/pageBlock");
		expect(creates.map(([, body]) => body.after_block_id)).toEqual(["a", "new-1", "new-2"]);
		expect(http.post).toHaveBeenLastCalledWith(
			"/pageBlock/columns",
			{ page_id: "page-1", block_ids: ["new-1", "new-2", "new-3"] },
			expect.anything(),
		);
	});

	it("turns an existing block into the first column", async () => {
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => useCreatePageBlockColumns(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({
				pageId: "page-1",
				parentBlockId: null,
				blockId: "a",
				count: 2,
			});
		});

		expect(http.post).toHaveBeenCalledTimes(2);
		expect(http.post).toHaveBeenLastCalledWith(
			"/pageBlock/columns",
			{ page_id: "page-1", block_ids: ["a", "new-1"] },
			expect.anything(),
		);
	});
});
