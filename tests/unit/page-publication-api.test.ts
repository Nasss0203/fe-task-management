import { afterEach, describe, expect, it, vi } from "vitest";
import instance from "@/shared/api/api-client";
import { pagePublicationApi } from "@/entities/page-publication/api/page-publication.api";

describe("published-site management API", () => {
	afterEach(() => vi.restoreAllMocks());
	it("unwraps workspace sites and forwards cancellation", async () => {
		const sites = [{ id: "site-1", subdomain: "asss" }];
		const get = vi.spyOn(instance, "get").mockResolvedValue({ data: { data: sites } });
		const signal = new AbortController().signal;
		expect(await pagePublicationApi.listWorkspacePublishedSites("workspace-1", signal)).toBe(sites);
		expect(get).toHaveBeenCalledWith("/workspaces/workspace-1/published-sites", { signal });
	});
	it("posts page/path to the selected site and unwraps publication response", async () => {
		const publication = { site_id: "site-1", page_id: "about", subdomain: "asss", path: "/about", published_at: "2026-09-29T00:00:00Z" };
		const post = vi.spyOn(instance, "post").mockResolvedValue({ data: { data: publication } });
		const payload = { page_id: "about", path: "/about" };
		expect(await pagePublicationApi.publishPageToSite("site-1", payload)).toBe(publication);
		expect(post).toHaveBeenCalledWith("/published-sites/site-1/publications", payload);
	});
});
