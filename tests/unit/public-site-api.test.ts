import { describe, expect, it, vi } from "vitest";
import { publicSiteApi } from "@/entities/public-site/api/public-site.api";
import publicApiClient from "@/shared/api/public-api-client";

describe("public site API", () => {
	it("requests a nested path with its leading slash and the path query key", async () => {
		const payload = { subdomain: "asss", path: "/about", breadcrumbs: [], page: { id: "about", title: "About" }, blocks: [] };
		const get = vi.spyOn(publicApiClient, "get").mockResolvedValue({ data: { statusCode: 200, data: payload } });
		const signal = new AbortController().signal;
		expect(await publicSiteApi.getPublicPage("asss", "/about", signal)).toBe(payload);
		expect(get).toHaveBeenCalledWith("/public/sites/asss", { params: { path: "/about" }, signal });
		vi.restoreAllMocks();
	});
});
