import { describe, expect, it } from "vitest";

import { getNotificationHref } from "@/entities/notification/lib/notification-navigation";

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
