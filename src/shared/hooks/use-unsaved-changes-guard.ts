"use client";

import { useEffect } from "react";

const MESSAGE = "You have unsaved changes. Leave this page?";

/**
 * Warns before leaving while `enabled`: tab close/reload, and in-app link clicks
 * (App Router has no route-change event, so clicks on <a> are intercepted).
 */
export function useUnsavedChangesGuard(enabled: boolean) {
	useEffect(() => {
		if (!enabled) return;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
		};

		const handleClick = (event: MouseEvent) => {
			if (event.defaultPrevented || event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
				return;
			}
			const anchor = (event.target as Element | null)?.closest("a[href]");
			if (!anchor || anchor.getAttribute("target") === "_blank") return;
			const url = new URL((anchor as HTMLAnchorElement).href);
			if (url.origin !== window.location.origin) return;
			if (url.pathname === window.location.pathname) return;

			if (!window.confirm(MESSAGE)) {
				event.preventDefault();
				event.stopPropagation();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		// Capture phase so the check runs before Next.js <Link> navigates.
		document.addEventListener("click", handleClick, true);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			document.removeEventListener("click", handleClick, true);
		};
	}, [enabled]);
}
