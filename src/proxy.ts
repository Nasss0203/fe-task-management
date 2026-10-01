import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	getPublicSiteSubdomain,
	normalizeHostname,
} from "@/shared/lib/public-site-host";

const STATIC_ASSET_PATTERN = /\.[^/]+$/;

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
