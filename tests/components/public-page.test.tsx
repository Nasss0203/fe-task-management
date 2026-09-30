import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicSitePage } from "@/entities/public-site/model/public-site.types";
import { PublicPage } from "@/widgets/public-page/ui/PublicPage";

vi.mock("@/widgets/page-block/ui/read-only-page-block-renderer", () => ({ ReadOnlyPageBlockRenderer: () => null }));

const nestedPage: PublicSitePage = {
	subdomain: "asss", path: "/about",
	breadcrumbs: [{ page_id: "home", title: "Page 1", path: "/" }, { page_id: "about", title: "About", path: "/about" }],
	page: { id: "about", title: "About", slug: "about", icon: null, cover_url: null, updated_at: "2026-09-30" },
	blocks: [],
};

describe("public nested page", () => {
	it("renders breadcrumbs and title when blocks are empty", () => {
		render(<PublicPage publicSite={nestedPage} />);
		expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("href", "/");
		expect(screen.getByText("About", { selector: '[aria-current="page"]' })).toBeInTheDocument();
	});
});
