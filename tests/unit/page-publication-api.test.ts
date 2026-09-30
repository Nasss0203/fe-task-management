import { afterEach, describe, expect, it, vi } from "vitest";
import instance from "@/shared/api/api-client";
import { pagePublicationApi } from "@/entities/page-publication/api/page-publication.api";

describe("page-publication API", () => {
	afterEach(() => vi.restoreAllMocks());

	it("publishes root page without subdomain in payload and unwraps response", async () => {
		const publication = {
			site_id: "site-1",
			page_id: "page-1",
			subdomain: "asss",
			path: "/",
			published_at: "2026-09-30T00:00:00Z",
		};
		const post = vi.spyOn(instance, "post").mockResolvedValue({ data: { data: publication } });
		const payload = { include_descendants: true };

		const result = await pagePublicationApi.publishPage("page-1", payload);

		expect(result).toBe(publication);
		expect(post).toHaveBeenCalledWith("/page/page-1/publication", payload);
	});

	it("lists page publications and forwards cancellation", async () => {
		const get = vi.spyOn(instance, "get").mockResolvedValue({ data: { data: [] } });
		const signal = new AbortController().signal;

		const result = await pagePublicationApi.listPagePublications("about", signal);

		expect(result).toEqual([]);
		expect(get).toHaveBeenCalledWith("/page/about/publications", { signal });
	});

	it("gets singular page publication detail", async () => {
		const status = { published: true, site_id: "site-1", subdomain: "asss", path: "/" };
		const get = vi.spyOn(instance, "get").mockResolvedValue({ data: { data: status } });
		const signal = new AbortController().signal;

		const result = await pagePublicationApi.getPagePublication("page-1", signal);

		expect(result).toBe(status);
		expect(get).toHaveBeenCalledWith("/page/page-1/publication", { signal });
	});

	it("updates settings and targets unpublish and republish by site", async () => {
		const patch = vi.spyOn(instance, "patch").mockResolvedValue({ data: { data: {} } });
		const del = vi.spyOn(instance, "delete").mockResolvedValue({ data: { data: {} } });
		const post = vi.spyOn(instance, "post").mockResolvedValue({ data: { data: {} } });

		await pagePublicationApi.updatePublicationSettings("about", "site-1", {
			include_descendants: true,
		});
		await pagePublicationApi.unpublishPage("about", "site-1");
		await pagePublicationApi.republishPage("about", "site-1");

		expect(patch).toHaveBeenCalledWith(
			"/page/about/publication/settings",
			{ include_descendants: true },
			{ params: { site_id: "site-1" } },
		);
		expect(del).toHaveBeenCalledWith("/page/about/publication", {
			params: { site_id: "site-1" },
		});
		expect(post).toHaveBeenCalledWith(
			"/page/about/publication/republish",
			undefined,
			{ params: { site_id: "site-1" } },
		);
	});

	it("sends only child visibility intent", async () => {
		const response = { published: false };
		const patch = vi.spyOn(instance, "patch").mockResolvedValue({ data: { data: response } });
		expect(await pagePublicationApi.updatePageVisibility("about", false)).toBe(response);
		expect(patch).toHaveBeenCalledWith(
			"/page/about/publication/visibility", { published: false },
		);
	});
});
