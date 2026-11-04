import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollToBlockHash } from "@/widgets/page-block-editor/model/use-scroll-to-block-hash";

describe("useScrollToBlockHash", () => {
	let scrollIntoView: ReturnType<typeof vi.fn<HTMLElement["scrollIntoView"]>>;

	beforeEach(() => {
		vi.useFakeTimers();
		// tests/setup.ts đã gán scrollIntoView trên HTMLElement, nên mock đúng chỗ đó
		scrollIntoView = vi.fn<HTMLElement["scrollIntoView"]>();
		HTMLElement.prototype.scrollIntoView = scrollIntoView;
		document.body.innerHTML = '<div id="block-a"></div><div id="block-b"></div>';
		window.location.hash = "#block-a";
	});

	afterEach(() => {
		vi.useRealTimers();
		document.body.innerHTML = "";
		window.location.hash = "";
	});

	it("scrolls to the linked block and highlights it for 2 seconds", () => {
		renderHook(() => useScrollToBlockHash(true));

		const block = document.getElementById("block-a")!;

		expect(scrollIntoView).toHaveBeenCalledTimes(1);
		expect(block).toHaveClass("bg-primary/10");

		vi.advanceTimersByTime(2000);

		expect(block).not.toHaveClass("bg-primary/10");
	});

	it("waits until blocks are ready", () => {
		const { rerender } = renderHook(({ ready }) => useScrollToBlockHash(ready), {
			initialProps: { ready: false },
		});

		expect(scrollIntoView).not.toHaveBeenCalled();

		rerender({ ready: true });

		expect(scrollIntoView).toHaveBeenCalledTimes(1);
	});

	it("ignores hashes that are not block links", () => {
		window.location.hash = "#comments";

		renderHook(() => useScrollToBlockHash(true));

		expect(scrollIntoView).not.toHaveBeenCalled();
	});

	it("follows hash changes on the same page", () => {
		renderHook(() => useScrollToBlockHash(true));

		window.location.hash = "#block-b";
		window.dispatchEvent(new HashChangeEvent("hashchange"));

		expect(document.getElementById("block-b")).toHaveClass("bg-primary/10");
	});
});
