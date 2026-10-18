/**
 * Returns `path` only when it is a same-origin relative path ("/templates/x"),
 * otherwise `fallback`. Rejects absolute URLs, protocol-relative "//host",
 * backslash tricks ("/\\host") and control characters (open-redirect guard).
 */
export function getSafeRedirectPath(
	path: string | null | undefined,
	fallback = "/",
): string {
	if (
		typeof path !== "string" ||
		!path.startsWith("/") ||
		path.startsWith("//") ||
		path.includes("\\") ||
		/[\u0000-\u001f]/.test(path)
	) {
		return fallback;
	}

	return path;
}
