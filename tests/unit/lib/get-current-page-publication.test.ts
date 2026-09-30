import { describe, expect, it } from "vitest";
import { getCurrentPagePublication } from "@/entities/page-publication/lib/get-current-page-publication";
import type { PagePublication } from "@/entities/page-publication/model/page-publication.types";

const directRoot: PagePublication = {
	id: "pub-1",
	page_id: "page-1",
	site_id: "site-1",
	subdomain: "asss",
	parent_publication_id: null,
	path: "/",
	publication_type: "DIRECT",
	visibility_override: null,
	include_descendants: true,
	published: true,
	published_at: "2026-09-30T00:00:00Z",
	unpublished_at: null,
};

const directHistoricalChild: PagePublication = {
	id: "pub-old",
	page_id: "child-1",
	site_id: "site-old",
	subdomain: "abc",
	parent_publication_id: null,
	path: "/",
	publication_type: "DIRECT",
	visibility_override: null,
	include_descendants: false,
	published: false,
	published_at: "2026-09-01T00:00:00Z",
	unpublished_at: "2026-09-10T00:00:00Z",
};

const inheritedChild: PagePublication = {
	id: "pub-2",
	page_id: "child-1",
	site_id: "site-1",
	subdomain: "asss",
	parent_publication_id: "pub-1",
	path: "/about",
	publication_type: "INHERITED",
	visibility_override: null,
	include_descendants: true,
	published: true,
	published_at: "2026-09-30T00:00:00Z",
	unpublished_at: null,
};

describe("getCurrentPagePublication", () => {
	it("returns active DIRECT publication for root page matching publicSubdomain", () => {
		const result = getCurrentPagePublication({
			isRootPage: true,
			publicSubdomain: "asss",
			publications: [directRoot],
		});
		expect(result).toBe(directRoot);
	});

	it("returns null for root page with no publications", () => {
		const result = getCurrentPagePublication({
			isRootPage: true,
			publicSubdomain: "asss",
			publications: [],
		});
		expect(result).toBeNull();
	});

	it("returns unpublished DIRECT publication for root page when no active one exists", () => {
		const unpublishedRoot = { ...directRoot, published: false };
		const result = getCurrentPagePublication({
			isRootPage: true,
			publicSubdomain: "asss",
			publications: [unpublishedRoot],
		});
		expect(result).toBe(unpublishedRoot);
	});

	it("returns active INHERITED publication for child page", () => {
		const result = getCurrentPagePublication({
			isRootPage: false,
			publicSubdomain: null,
			publications: [inheritedChild],
		});
		expect(result).toBe(inheritedChild);
	});

	it("returns private INHERITED publication for a child toggle", () => {
		const privateChild = { ...inheritedChild, published: false, visibility_override: "UNPUBLISHED" as const };
		expect(getCurrentPagePublication({
			isRootPage: false,
			publicSubdomain: null,
			publications: [privateChild],
		})).toBe(privateChild);
	});

	it("ignores historical DIRECT publication for child page and returns active INHERITED", () => {
		const result = getCurrentPagePublication({
			isRootPage: false,
			publicSubdomain: null,
			publications: [directHistoricalChild, inheritedChild],
		});
		expect(result).toBe(inheritedChild);
	});

	it("returns null for child page with only historical DIRECT publication and no active INHERITED", () => {
		const result = getCurrentPagePublication({
			isRootPage: false,
			publicSubdomain: null,
			publications: [directHistoricalChild],
		});
		expect(result).toBeNull();
	});

	it("returns null for child page with no publications", () => {
		const result = getCurrentPagePublication({
			isRootPage: false,
			publicSubdomain: null,
			publications: [],
		});
		expect(result).toBeNull();
	});
});
