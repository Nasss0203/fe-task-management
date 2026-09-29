import { normalizePublicationPath } from "./normalize-publication-path";

interface BuildPublicSiteUrlOptions {
	subdomain: string;
	path?: string | null;
}

export function buildPublicSiteUrl({
	subdomain,
	path,
}: BuildPublicSiteUrlOptions): string {
	const publicationPath = normalizePublicationPath(path);
	const normalizedPath = publicationPath === "/" ? "" : publicationPath;
	const fallbackPath = `/public/${encodeURIComponent(subdomain)}${normalizedPath}`;
	const location = typeof window === "undefined" ? null : window.location;

	if (
		location &&
		(location.hostname === "localhost" || location.hostname.endsWith(".localhost"))
	) {
		const port = location.port ? `:${location.port}` : "";
		return `http://${subdomain}.localhost${port}${normalizedPath}`;
	}

	const domain = process.env.NEXT_PUBLIC_APP_DOMAIN
		?.trim()
		.toLowerCase()
		.replace(/:\d+$/, "")
		.replace(/\.$/, "");

	if (domain && !domain.includes("/") && !domain.includes(":")) {
		return `https://${subdomain}.${domain}${normalizedPath}`;
	}

	return location ? `${location.origin}${fallbackPath}` : fallbackPath;
}
