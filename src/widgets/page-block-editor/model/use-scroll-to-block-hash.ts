"use client";

import { useEffect } from "react";

// Viết đủ tên class ở đây để Tailwind sinh CSS
const HIGHLIGHT_CLASSES = ["bg-primary/10", "ring-1", "ring-primary/30"];

/**
 * Mở link "Copy link to block" (#block-<id>) thì cuộn tới block
 * và làm nổi nền ~2 giây. Block nằm trong Toggle đang đóng thì bỏ qua.
 */
export function useScrollToBlockHash(ready: boolean) {
	useEffect(() => {
		if (!ready) return;

		let timer: number | undefined;

		const scrollToHash = () => {
			const hash = window.location.hash;

			if (!hash.startsWith("#block-")) return;

			const element = document.getElementById(
				decodeURIComponent(hash.slice(1)),
			);

			if (!element) return;

			element.scrollIntoView({ block: "center", behavior: "smooth" });

			element.classList.add(...HIGHLIGHT_CLASSES);

			window.clearTimeout(timer);

			timer = window.setTimeout(() => {
				element.classList.remove(...HIGHLIGHT_CLASSES);
			}, 2000);
		};

		scrollToHash();

		// Dán link vào chính trang đang mở thì chỉ đổi hash, không tải lại
		window.addEventListener("hashchange", scrollToHash);

		return () => {
			window.removeEventListener("hashchange", scrollToHash);
			window.clearTimeout(timer);
		};
	}, [ready]);
}
