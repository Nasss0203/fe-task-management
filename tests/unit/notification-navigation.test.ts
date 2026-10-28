import { afterEach, describe, expect, it, vi } from "vitest";

import {
	followSamePageHash,
	getNotificationHref,
} from "@/entities/notification/lib/notification-navigation";

describe("getNotificationHref", () => {
	it("keeps known internal routes with query and hash", () => {
		expect(getNotificationHref("/page/abc?block=1#top")).toBe(
			"/page/abc?block=1#top",
		);
		expect(getNotificationHref("/dashboard")).toBe("/dashboard");
		expect(getNotificationHref("/database/xyz")).toBe("/database/xyz");
		expect(getNotificationHref("/teamspaces/invitations")).toBe(
			"/teamspaces/invitations",
		);
	});

	it("rejects external and protocol-relative targets", () => {
		expect(getNotificationHref(null)).toBeNull();
		expect(getNotificationHref("https://evil.example/page/a")).toBeNull();
		expect(getNotificationHref("javascript:alert(1)")).toBeNull();
		expect(getNotificationHref("//evil.example/page/a")).toBeNull();
		expect(getNotificationHref("/\\evil.example/page/a")).toBeNull();
	});

	it("rejects internal routes that have no page yet", () => {
		expect(getNotificationHref("/teamspaces/other")).toBeNull();
		expect(getNotificationHref("/invite/workspace?token=t")).toBeNull();
	});
});

describe("followSamePageHash", () => {
	afterEach(() => {
		window.history.replaceState(null, "", "/");
	});

	it("leaves links to another page to the router", () => {
		window.history.replaceState(null, "", "/page/a");

		expect(followSamePageHash("/page/b#block-1")).toBe(false);
		expect(followSamePageHash("/page/a?row=r1")).toBe(false);
	});

	it("sets the hash on the open page so the block scrolls into view", () => {
		window.history.replaceState(null, "", "/page/a");

		expect(followSamePageHash("/page/a#block-1")).toBe(true);
		expect(window.location.hash).toBe("#block-1");
	});

	it("fires hashchange again when the same block is already in the URL", () => {
		window.history.replaceState(null, "", "/page/a#block-1");
		const listener = vi.fn();
		window.addEventListener("hashchange", listener);

		expect(followSamePageHash("/page/a#block-1")).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);

		window.removeEventListener("hashchange", listener);
	});
});
