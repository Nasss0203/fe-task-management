import { describe, expect, it } from "vitest";

import { buildPageBreadcrumbs } from "@/entities/page/lib/build-page-breadcrumbs";

const page = (id: string, parent: string | null) => ({
	id,
	title: id.toUpperCase(),
	parent_page_id: parent,
	teamspace_id: null,
});

describe("buildPageBreadcrumbs", () => {
	it("shows workspace, teamspace and linked parent pages before the current page", () => {
		const pages = [page("a", null), page("b", "a"), page("c", "b")];

		expect(
			buildPageBreadcrumbs(pages[2], pages, { workspaceName: "Acme", teamspaceName: "Design" }),
		).toEqual([
			{ label: "Acme" },
			{ label: "Design" },
			{ label: "A", href: "/page/a" },
			{ label: "B", href: "/page/b" },
			{ label: "C" },
		]);
	});

	it("collapses a long chain of parents and stops at parents it cannot see", () => {
		const pages = [page("a", "hidden"), page("b", "a"), page("c", "b"), page("d", "c"), page("e", "d")];

		expect(buildPageBreadcrumbs(pages[4], pages).map((crumb) => crumb.label)).toEqual([
			"A",
			"…",
			"C",
			"D",
			"E",
		]);
	});

	it("does not loop on a broken parent cycle", () => {
		const pages = [page("a", "b"), page("b", "a")];

		expect(buildPageBreadcrumbs(pages[0], pages).map((crumb) => crumb.label)).toEqual(["B", "A"]);
	});
});
