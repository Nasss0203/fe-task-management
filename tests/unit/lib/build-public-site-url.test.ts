import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPublicSiteUrl } from "@/entities/page-publication/lib/build-public-site-url";

function setLocation(origin: string) {
	vi.stubGlobal("window", { location: new URL(origin) });
}

describe("buildPublicSiteUrl", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it.each([
		[undefined, ""], [null, ""], ["/", ""],
		["/about", "/about"], ["about", "/about"],
		["/docs/", "/docs"], ["//docs//start//", "/docs/start"],
	])("normalizes localhost path %s", (path, suffix) => {
		setLocation("http://localhost:3000");
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "task.com");
		expect(buildPublicSiteUrl({ subdomain: "asss", path })).toBe(`http://asss.localhost:3000${suffix}`);
	});

	it.each([
		["http://other.localhost:4200", "http://asss.localhost:4200/about"],
		["http://localhost", "http://asss.localhost/about"],
	])("uses the current local port from %s", (origin, expected) => {
		setLocation(origin);
		expect(buildPublicSiteUrl({ subdomain: "asss", path: "/about" })).toBe(expected);
	});

	it.each([["/", ""], ["/about", "/about"]])("uses HTTPS for production path %s", (path, suffix) => {
		setLocation("http://example.com:8080");
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "task.com");
		expect(buildPublicSiteUrl({ subdomain: "asss", path })).toBe(`https://asss.task.com${suffix}`);
	});

	it("falls back to the current origin when domain is absent", () => {
		setLocation("https://example.com");
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "");
		expect(buildPublicSiteUrl({ subdomain: "asss", path: "/about" })).toBe("https://example.com/public/asss/about");
	});

	it("is safe without window", () => {
		vi.stubGlobal("window", undefined);
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "");
		expect(buildPublicSiteUrl({ subdomain: "asss", path: "/" })).toBe("/public/asss");
	});
});
