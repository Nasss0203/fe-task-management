import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set(["api", "www"]);
const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const STATIC_ASSET_PATTERN = /\.[^/]+$/;

function normalizeHostname(host: string): string {
	return host.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

function getConfiguredRootDomain(): string | null {
	const value = process.env.NEXT_PUBLIC_APP_DOMAIN;

	if (!value) return null;

	const domain = normalizeHostname(value);

	if (!domain || domain.includes("/") || domain.includes(":")) {
		return null;
	}

	return domain;
}

function getPublicSiteSubdomain(hostname: string): string | null {
	let candidate: string | null = null;

	if (hostname.endsWith(".localhost")) {
		candidate = hostname.slice(0, -".localhost".length);
	} else {
		const rootDomain = getConfiguredRootDomain();

		if (!rootDomain || hostname === rootDomain) {
			return null;
		}

		const rootDomainSuffix = `.${rootDomain}`;

		if (!hostname.endsWith(rootDomainSuffix)) {
			return null;
		}

		candidate = hostname.slice(0, -rootDomainSuffix.length);
	}

	if (
		!candidate ||
		candidate.includes(".") ||
		!SUBDOMAIN_PATTERN.test(candidate) ||
		RESERVED_SUBDOMAINS.has(candidate)
	) {
		return null;
	}

	return candidate;
}

function isExcludedPath(pathname: string): boolean {
	return (
		pathname === "/public" ||
		pathname.startsWith("/public/") ||
		pathname === "/api" ||
		pathname.startsWith("/api/") ||
		pathname === "/_next" ||
		pathname.startsWith("/_next/") ||
		pathname === "/favicon.ico" ||
		pathname === "/robots.txt" ||
		pathname === "/sitemap.xml" ||
		STATIC_ASSET_PATTERN.test(pathname)
	);
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (isExcludedPath(pathname)) {
		return NextResponse.next();
	}

	const hostname = normalizeHostname(
		request.headers.get("host") ?? request.nextUrl.host,
	);
	const subdomain = getPublicSiteSubdomain(hostname);

	if (!subdomain) {
		return NextResponse.next();
	}

	const rewriteUrl = request.nextUrl.clone();
	const publicSiteRoot = `/public/${encodeURIComponent(subdomain)}`;

	rewriteUrl.pathname =
		pathname === "/" ? publicSiteRoot : `${publicSiteRoot}${pathname}`;

	return NextResponse.rewrite(rewriteUrl);
}

export const config = {
	matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
