import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publicSiteApi } from "@/entities/public-site/api/public-site.api";
import { getMockPublicSiteNavigation } from "@/entities/public-site/api/public-site-navigation.mock";
import type { PublicSitePage } from "@/entities/public-site/model/public-site.types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { PublicPage } from "@/widgets/public-page/ui/PublicPage";

vi.mock("@/shared/hooks/use-mobile", () => ({
	useIsMobile: vi.fn(() => false),
}));

vi.mock("@/widgets/page-block/ui/read-only-page-block-renderer", () => ({
	ReadOnlyPageBlockRenderer: () => null,
}));

const mockPublicSite: PublicSitePage = {
	subdomain: "asss",
	path: "/docs/api",
	breadcrumbs: [
		{ page_id: "page-root", title: "Page 1", path: "/" },
		{ page_id: "page-docs", title: "Docs", path: "/docs" },
		{ page_id: "page-api", title: "API", path: "/docs/api" },
	],
	page: {
		id: "page-api",
		title: "API",
		slug: "api",
		icon: null,
		cover_url: null,
		updated_at: "2026-09-30",
	},
	blocks: [],
};

function renderWithClient(ui: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Public Navigation Sidebar", () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false);
		vi.spyOn(publicSiteApi, "getPublicSiteNavigation").mockImplementation(
			(subdomain, signal) => getMockPublicSiteNavigation(subdomain, signal),
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders nested page hierarchy and automatically expands ancestors of current page", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		// Wait for sidebar navigation to load
		expect(await screen.findByTestId("nav-item-page-root")).toBeInTheDocument();
		expect(screen.getByTestId("nav-item-page-about")).toHaveTextContent("About");
		expect(screen.getByTestId("nav-item-page-docs")).toHaveTextContent("Docs");
		expect(screen.getByTestId("nav-item-page-contact")).toHaveTextContent("Contact");

		// Since current path is /docs/api, Docs ancestor is auto-expanded, so API is visible
		const apiItem = screen.getByTestId("nav-item-page-api");
		expect(apiItem).toHaveTextContent("API");
		expect(apiItem).toHaveAttribute("aria-current", "page");
	});

	it("highlights current page based on path rather than title", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		const currentItem = await screen.findByTestId("nav-item-page-api");
		expect(currentItem).toHaveAttribute("aria-current", "page");

		// Non-current items do not have aria-current
		expect(screen.getByTestId("nav-item-page-root")).not.toHaveAttribute("aria-current");
		expect(screen.getByTestId("nav-item-page-about")).not.toHaveAttribute("aria-current");
		expect(screen.getByTestId("nav-item-page-docs")).not.toHaveAttribute("aria-current");
	});

	it("navigates root and child pages with same-site client links", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		const rootLink = await screen.findByTestId("nav-item-page-root");
		const aboutLink = screen.getByTestId("nav-item-page-about");
		const apiLink = screen.getByTestId("nav-item-page-api");

		// Sidebar links stay on the current public subdomain and use relative paths.
		expect(rootLink).toHaveAttribute("href", "/");
		expect(aboutLink).toHaveAttribute("href", "/about");
		expect(apiLink).toHaveAttribute("href", "/docs/api");
	});

	it("toggles desktop sidebar open and closed via navigation trigger", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		expect(await screen.findByTestId("public-desktop-sidebar")).toBeInTheDocument();

		// Click close button inside sidebar header
		const closeBtn = screen.getByRole("button", { name: "Close sidebar" });
		await userEvent.click(closeBtn);

		expect(screen.getByTestId("public-desktop-sidebar")).toHaveStyle({ width: "0px" });

		// Click toggle navigation button in header to reopen
		const toggleBtn = screen.getByRole("button", { name: "Toggle navigation" });
		await userEvent.click(toggleBtn);

		expect(await screen.findByTestId("public-desktop-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("public-desktop-sidebar")).toHaveStyle({ width: "224px" });
	});

	it("resizes the desktop sidebar within its bounds", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);
		const sidebar = await screen.findByTestId("public-desktop-sidebar");
		const handle = screen.getByTestId("public-sidebar-resize-handle");

		fireEvent.pointerDown(handle, { pointerId: 1, clientX: 224 });
		fireEvent.pointerMove(handle, { pointerId: 1, clientX: 300 });
		expect(sidebar).toHaveStyle({ width: "300px" });
		fireEvent.pointerUp(handle, { pointerId: 1, clientX: 300 });

		fireEvent.pointerDown(handle, { pointerId: 2, clientX: 300 });
		fireEvent.pointerMove(handle, { pointerId: 2, clientX: 500 });
		fireEvent.pointerUp(handle, { pointerId: 2, clientX: 500 });
		expect(sidebar).toHaveStyle({ width: "360px" });
	});

	it("collapses below the threshold and restores the previous width", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);
		const sidebar = await screen.findByTestId("public-desktop-sidebar");
		const handle = screen.getByTestId("public-sidebar-resize-handle");
		const toggle = screen.getByRole("button", { name: "Toggle navigation" });

		fireEvent.pointerDown(handle, { pointerId: 1, clientX: 224 });
		fireEvent.pointerMove(handle, { pointerId: 1, clientX: 300 });
		fireEvent.pointerUp(handle, { pointerId: 1, clientX: 300 });
		fireEvent.pointerDown(handle, { pointerId: 2, clientX: 300 });
		fireEvent.pointerMove(handle, { pointerId: 2, clientX: 100 });
		fireEvent.pointerUp(handle, { pointerId: 2, clientX: 100 });
		expect(sidebar).toHaveStyle({ width: "0px" });

		await userEvent.click(toggle);
		expect(sidebar).toHaveStyle({ width: "300px" });
	});

	it("renders mobile drawer via Sheet on mobile viewport and closes on item navigate", async () => {
		vi.mocked(useIsMobile).mockReturnValue(true);
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		// Desktop sidebar is not shown on mobile
		expect(screen.queryByTestId("public-desktop-sidebar")).not.toBeInTheDocument();

		// Click navigation trigger opens Sheet drawer
		const toggleBtn = screen.getByRole("button", { name: "Toggle navigation" });
		await userEvent.click(toggleBtn);

		expect(await screen.findByTestId("public-mobile-sheet")).toBeInTheDocument();

		// Clicking a navigation link closes the mobile drawer
		const aboutItem = screen.getByTestId("nav-item-page-about");
		await userEvent.click(aboutItem);

		await waitFor(() => {
			expect(screen.queryByTestId("public-mobile-sheet")).not.toBeInTheDocument();
		});
	});

	it("renders private parent normalized scenario under root without dependency on private parent", async () => {
		const privateParentSite: PublicSitePage = {
			...mockPublicSite,
			subdomain: "private-parent-site",
			path: "/internal-docs/api",
		};

		renderWithClient(<PublicPage publicSite={privateParentSite} />);

		expect(await screen.findByTestId("nav-item-page-root")).toBeInTheDocument();
		// API is rendered under root, without internal-docs
		const apiItem = screen.getByTestId("nav-item-api");
		expect(apiItem).toHaveTextContent("API");
		expect(screen.queryByText("Internal Docs")).not.toBeInTheDocument();

		expect(apiItem).toHaveAttribute("href", "/internal-docs/api");
		expect(apiItem).toHaveAttribute("aria-current", "page");
	});

	it("does not crash public page content when navigation query fails", async () => {
		vi.spyOn(publicSiteApi, "getPublicSiteNavigation").mockRejectedValueOnce(
			new Error("Network Error"),
		);

		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		// Navigation shows error alert
		expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load pages");

		// Crucial: page content still renders completely!
		expect(screen.getByRole("heading", { name: "API" })).toBeInTheDocument();
		expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
	});

	it("allows manual collapse and expand of parent nodes", async () => {
		renderWithClient(<PublicPage publicSite={mockPublicSite} />);

		expect(await screen.findByTestId("nav-item-page-api")).toBeInTheDocument();

		// Docs is expanded; click collapse button for Docs
		const collapseDocsBtn = screen.getByRole("button", { name: "Collapse Docs" });
		await userEvent.click(collapseDocsBtn);

		// Now API is hidden
		expect(screen.queryByTestId("nav-item-page-api")).not.toBeInTheDocument();

		// Click expand Docs
		const expandDocsBtn = screen.getByRole("button", { name: "Expand Docs" });
		await userEvent.click(expandDocsBtn);

		// API is visible again
		expect(await screen.findByTestId("nav-item-page-api")).toBeInTheDocument();
	});
});
