import {
	getRewrittenUrl,
	isRewrite,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { proxy } from "@/proxy";

function runProxy(url: string, host: string) {
	return proxy(
		new NextRequest(url, {
			headers: {
				host,
			},
		}),
	);
}

describe("public site hostname proxy", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("rewrites a production subdomain and preserves path and query", () => {
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "task.com");

		const response = runProxy(
			"https://abcd.task.com/docs/start?x=1",
			"abcd.task.com",
		);

		expect(isRewrite(response)).toBe(true);
		expect(getRewrittenUrl(response)).toBe(
			"https://abcd.task.com/public/abcd/docs/start?x=1",
		);
	});

	it("rewrites a local subdomain without requiring production domain config", () => {
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "");

		const response = runProxy(
			"http://abcd.localhost:3000/",
			"abcd.localhost:3000",
		);

		expect(isRewrite(response)).toBe(true);
		expect(getRewrittenUrl(response)).toBe(
			"http://abcd.localhost:3000/public/abcd",
		);
	});
	it("rewrites a nested local public page to the matching catch-all route", () => {
		const response = runProxy("http://asss.localhost:3000/about", "asss.localhost:3000");
		expect(getRewrittenUrl(response)).toBe("http://asss.localhost:3000/public/asss/about");
	});

	it.each([
		["apex domain", "https://task.com/dashboard", "task.com"],
		["www", "https://www.task.com/", "www.task.com"],
		["api", "https://api.task.com/users", "api.task.com"],
		["nested subdomain", "https://a.b.task.com/", "a.b.task.com"],
		["localhost apex", "http://localhost:3000/dashboard", "localhost:3000"],
	])("does not rewrite the %s", (_case, url, host) => {
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "task.com");

		expect(isRewrite(runProxy(url, host))).toBe(false);
	});

	it.each([
		["internal public route", "https://abcd.task.com/public/abcd"],
		["Next.js asset", "https://abcd.task.com/_next/static/app.js"],
		["API route", "https://abcd.task.com/api/health"],
		["favicon", "https://abcd.task.com/favicon.ico"],
		["static file", "https://abcd.task.com/logo.svg"],
	])("does not rewrite an excluded %s", (_case, url) => {
		vi.stubEnv("NEXT_PUBLIC_APP_DOMAIN", "task.com");

		expect(isRewrite(runProxy(url, "abcd.task.com"))).toBe(false);
	});
});
