export function normalizePublicationPath(path?: string | null): string {
	const segments = (path ?? "").trim().split("/").filter(Boolean);
	return segments.length ? `/${segments.join("/")}` : "/";
}
