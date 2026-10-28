// Fixed base so parsing never depends on window and any other origin is rejected.
const INTERNAL_ORIGIN = "http://internal.invalid";

/**
 * Internal routes a notification may open. Anything else would 404 or leave the app.
 *
 * shortcut: actionUrls whose page does not exist yet are not listed, so clicking
 * only marks them read: /invite/workspace. Add it here once that page ships.
 */
const NAVIGABLE_PATHS = [
	/^\/dashboard(\/.*)?$/,
	/^\/page\/[^/]+$/,
	/^\/database\/[^/]+$/,
	/^\/teamspaces\/invitations$/,
];

export function getNotificationHref(actionUrl: string | null): string | null {
	if (!actionUrl?.startsWith("/")) {
		return null;
	}

	let url: URL;

	try {
		url = new URL(actionUrl, INTERNAL_ORIGIN);
	} catch {
		return null;
	}

	// Rejects protocol-relative ("//host", "/\host") targets.
	if (url.origin !== INTERNAL_ORIGIN) {
		return null;
	}

	if (!NAVIGABLE_PATHS.some((pattern) => pattern.test(url.pathname))) {
		return null;
	}

	return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Link tới block (`#block-…`) của chính trang đang mở: Next đổi hash bằng `pushState`
 * nên không có `hashchange`, trang không cuộn tới block. Tự đổi hash / phát sự kiện.
 * Trả về true nếu đã xử lý (bỏ điều hướng của Link).
 */
export function followSamePageHash(href: string): boolean {
	const target = new URL(href, window.location.href);

	if (
		!target.hash ||
		target.pathname !== window.location.pathname ||
		target.search !== window.location.search
	) {
		return false;
	}

	if (target.hash === window.location.hash) {
		// Cùng hash thì trình duyệt không phát hashchange
		window.dispatchEvent(new HashChangeEvent("hashchange"));
	} else {
		window.location.hash = target.hash;
	}

	return true;
}
