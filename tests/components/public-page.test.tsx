import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicSitePage } from "@/entities/public-site/model/public-site.types";
import { PublicPage } from "@/widgets/public-page/ui/PublicPage";

vi.mock("@/widgets/page-block/ui/read-only-page-block-renderer", () => ({ ReadOnlyPageBlockRenderer: () => null }));
vi.mock("@/widgets/public-page/ui/PublicPageEditor", () => ({
	PublicPageEditor: ({ pageId }: { pageId: string }) => <div data-testid='public-page-editor'>{pageId}</div>,
}));

const nestedPage: PublicSitePage = {
	subdomain: "asss", path: "/about",
	breadcrumbs: [{ page_id: "home", title: "Page 1", path: "/" }, { page_id: "about", title: "About", path: "/about" }],
	page: { id: "about", title: "About", slug: "about", icon: null, cover_url: null, updated_at: "2026-09-30" },
	blocks: [],
	capabilities: { updates_enabled: false, authenticated: false, can_update: false },
};

describe("public nested page", () => {
	it("renders breadcrumbs and title when blocks are empty", () => {
		render(<PublicPage publicSite={nestedPage} />);
		expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("href", "/");
		expect(screen.getByText("About", { selector: '[aria-current="page"]' })).toBeInTheDocument();
	});

	it("edits in place for members who may update the page", () => {
		render(
			<PublicPage
				publicSite={{
					...nestedPage,
					capabilities: { updates_enabled: true, authenticated: true, can_update: true },
				}}
			/>,
		);
		expect(screen.getByTestId("public-page-editor")).toHaveTextContent("about");
		expect(screen.getByText("Editing")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Open in app" })).toHaveAttribute("href", "/page/about");
	});

	it("stays read-only for viewers without edit permission", () => {
		render(
			<QueryClientProvider client={new QueryClient()}>
				<PublicPage
					publicSite={{
						...nestedPage,
						capabilities: { updates_enabled: true, authenticated: true, can_update: false },
					}}
				/>
			</QueryClientProvider>,
		);
		expect(screen.queryByTestId("public-page-editor")).not.toBeInTheDocument();
		expect(screen.queryByText("Editing")).not.toBeInTheDocument();
	});
});
