import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { templateApi } from "@/entities/template/api/template.api";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { PublicTemplateDetailPage } from "@/widgets/landing/templates";
import { WorkspaceTemplateGalleryPage } from "@/widgets/workspace-template-gallery";

import { publicTemplate } from "../fixtures/public-template";

const routerPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: routerPush, replace: vi.fn() }),
	usePathname: () => "/dashboard/templates",
	useSearchParams: () => mockSearchParams,
}));

let mockUser: { id: string; lastActiveWorkspaceId?: string } | null = null;
vi.mock("@/features/auth", () => ({
	useUser: () => ({
		user: mockUser,
		isBootstrapped: true,
		isAuthenticated: Boolean(mockUser),
	}),
}));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: [{ id: "ws-1", name: "Engineering" }] }),
}));

const paidTemplate: PublicTemplateListItem = {
	...publicTemplate,
	id: "paid-template",
	name: "Paid Planner",
	cover_url: "https://example.com/cover.png",
	offer_type: "PAID",
	price_amount: 99000,
	currency: "VND",
	preview_mode: "INTERACTIVE",
	categories: [{ id: "cat-1", name: "Productivity", slug: "productivity" }],
	version: { ...publicTemplate.version, id: "release-v2", template_id: "paid-template" },
};

function httpError(status: number) {
	return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
		status,
		statusText: String(status),
		data: {},
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

function renderWithClient(ui: ReactNode) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});
	return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
	mockUser = { id: "buyer-1", lastActiveWorkspaceId: "ws-1" };
	vi.spyOn(templateApi, "listPublicCategories").mockResolvedValue([
		{
			id: "cat-1",
			name: "Productivity",
			slug: "productivity",
			description: null,
			is_active: true,
			sort_order: 0,
			created_at: "",
			updated_at: "",
		},
	]);
	vi.spyOn(templateApi, "getVersionThumbnail").mockRejectedValue(httpError(404));
});

afterEach(() => {
	mockUser = null;
	vi.restoreAllMocks();
});

describe("Workspace template gallery", () => {
	it("lists only public marketplace templates and links to the workspace detail", async () => {
		const listPublic = vi
			.spyOn(templateApi, "listPublic")
			.mockResolvedValue({ items: [paidTemplate], nextCursor: null });
		const listPrivate = vi.spyOn(templateApi, "list");

		renderWithClient(<WorkspaceTemplateGalleryPage />);

		const card = await screen.findByRole("link", { name: /View template Paid Planner/ });
		expect(card).toHaveAttribute("href", "/dashboard/templates/paid-template");
		expect(within(card).getByText("99.000 ₫")).toBeInTheDocument();
		expect(within(card).getByText("Productivity")).toBeInTheDocument();
		expect(listPublic).toHaveBeenCalled();
		// No scope=mine / scope=workspace listing in the workspace gallery.
		expect(listPrivate).not.toHaveBeenCalled();
		expect(screen.queryByRole("tab", { name: /mine|library/i })).not.toBeInTheDocument();
	});

	it("filters by category on the backend", async () => {
		const listPublic = vi
			.spyOn(templateApi, "listPublic")
			.mockResolvedValue({ items: [], nextCursor: null });
		const user = userEvent.setup();

		renderWithClient(<WorkspaceTemplateGalleryPage />);
		await user.click(await screen.findByRole("button", { name: "Productivity" }));

		await waitFor(() =>
			expect(listPublic).toHaveBeenLastCalledWith(
				expect.objectContaining({ category: "productivity" }),
				expect.anything(),
			),
		);
		expect(
			await screen.findByText("Try another search keyword, category, price or tag."),
		).toBeInTheDocument();
	});

	it("filters by price on the backend", async () => {
		const listPublic = vi
			.spyOn(templateApi, "listPublic")
			.mockResolvedValue({ items: [], nextCursor: null });
		const user = userEvent.setup();

		renderWithClient(<WorkspaceTemplateGalleryPage />);
		await user.click(await screen.findByRole("button", { name: "Paid" }));

		await waitFor(() =>
			expect(listPublic).toHaveBeenLastCalledWith(
				expect.objectContaining({ offer_type: "PAID" }),
				expect.anything(),
			),
		);
	});

	it("filters by the ?tag= in the URL and ignores a malformed tag", async () => {
		const listPublic = vi
			.spyOn(templateApi, "listPublic")
			.mockResolvedValue({ items: [], nextCursor: null });

		mockSearchParams = new URLSearchParams("tag=CRM");
		const { unmount } = renderWithClient(<WorkspaceTemplateGalleryPage />);
		expect(await screen.findByText("#crm")).toBeInTheDocument();
		await waitFor(() =>
			expect(listPublic).toHaveBeenLastCalledWith(
				expect.objectContaining({ tag: "crm" }),
				expect.anything(),
			),
		);
		expect(
			screen.getByRole("button", { name: "Remove tag filter crm" }),
		).toBeInTheDocument();
		unmount();

		listPublic.mockClear();
		mockSearchParams = new URLSearchParams("tag=bad tag");
		renderWithClient(<WorkspaceTemplateGalleryPage />);
		await waitFor(() => expect(listPublic).toHaveBeenCalled());
		expect(listPublic.mock.calls[0][0]).not.toHaveProperty("tag");
		mockSearchParams = new URLSearchParams();
	});

	it("shows tags on cards and creator plus tag links on the detail page", async () => {
		vi.spyOn(templateApi, "listPublic").mockResolvedValue({
			items: [{ ...paidTemplate, tags: ["crm", "sales-ops"] }],
			nextCursor: null,
		});
		renderWithClient(<WorkspaceTemplateGalleryPage />);
		expect(await screen.findByText("#crm #sales-ops")).toBeInTheDocument();
	});

	it("falls back to the cover without retrying a hidden paid thumbnail", async () => {
		vi.spyOn(templateApi, "listPublic").mockResolvedValue({
			items: [paidTemplate],
			nextCursor: null,
		});

		renderWithClient(<WorkspaceTemplateGalleryPage />);

		const card = await screen.findByRole("link", { name: /View template Paid Planner/ });
		await waitFor(() =>
			expect(card.querySelector("[style*='cover.png']")).not.toBeNull(),
		);
		expect(templateApi.getVersionThumbnail).toHaveBeenCalledTimes(1);
	});
});

describe("Buyer template detail", () => {
	const renderDetail = (template: PublicTemplateListItem) => {
		vi.spyOn(templateApi, "getPublicById").mockResolvedValue(template);
		return renderWithClient(
			<PublicTemplateDetailPage
				templateId={template.id}
				basePath='/dashboard/templates'
			/>,
		);
	};

	it("links each tag to the filtered gallery and shows the creator byline", async () => {
		vi.spyOn(templateApi, "listUsableVersions").mockRejectedValue(httpError(403));
		renderDetail({
			...paidTemplate,
			tags: ["crm", "sales-ops"],
			creator: { username: "nam", avatar_url: null },
		});

		expect(await screen.findByRole("link", { name: "#crm" })).toHaveAttribute(
			"href",
			"/dashboard/templates?tag=crm",
		);
		expect(screen.getByRole("link", { name: "#sales-ops" })).toHaveAttribute(
			"href",
			"/dashboard/templates?tag=sales-ops",
		);
		expect(screen.getByText("nam")).toBeInTheDocument();
	});

	it("offers Buy with the price and the demo, but no creator actions, when not owned", async () => {
		vi.spyOn(templateApi, "listUsableVersions").mockRejectedValue(httpError(403));
		const privateDetail = vi.spyOn(templateApi, "getById");
		const privatePreview = vi.spyOn(templateApi, "getPreview");

		renderDetail(paidTemplate);

		expect(
			// Intl puts a non-breaking space before the currency sign.
			await screen.findByRole("button", { name: /Buy template — 99\.000\s₫/ }),
		).toBeEnabled();
		expect(screen.getByRole("link", { name: /Try the demo/ })).toHaveAttribute(
			"href",
			"/templates/paid-template/versions/release-v2/preview?back=%2Fdashboard%2Ftemplates%2Fpaid-template",
		);
		expect(screen.getByRole("link", { name: /Back to templates/ })).toHaveAttribute(
			"href",
			"/dashboard/templates",
		);
		for (const action of [/Edit details/, /Create version/, /Publish/, /Edit listing/]) {
			expect(screen.queryByRole("button", { name: action })).not.toBeInTheDocument();
		}
		expect(privateDetail).not.toHaveBeenCalled();
		expect(privatePreview).not.toHaveBeenCalled();
	});

	it("lets a buyer use the official release that is also the LIMITED demo", async () => {
		vi.spyOn(templateApi, "listUsableVersions").mockResolvedValue({
			items: [
				{ id: "release-v1", version_number: 1, status: "PUBLISHED", released_at: "", is_current: false },
				{ id: "release-v2", version_number: 2, status: "PUBLISHED", released_at: "", is_current: true },
			],
		});
		const claim = vi.spyOn(templateApi, "claimFreeTemplate");
		const useTemplate = vi
			.spyOn(templateApi, "useTemplate")
			.mockResolvedValue({ pageId: "new-page" });
		const user = userEvent.setup();

		renderDetail(paidTemplate);

		await user.click(await screen.findByRole("button", { name: /^Use template/ }));
		const dialog = await screen.findByRole("dialog");
		await user.click(within(dialog).getByRole("button", { name: /Use template/ }));

		await waitFor(() =>
			expect(useTemplate).toHaveBeenCalledWith("paid-template", "release-v2", {
				workspace_id: "ws-1",
			}),
		);
		expect(claim).not.toHaveBeenCalled();
		await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/page/new-page"));
	});

	it("has no interactive preview link for IMAGE listings", async () => {
		vi.spyOn(templateApi, "listUsableVersions").mockRejectedValue(httpError(403));

		renderDetail({ ...paidTemplate, preview_mode: "IMAGE" });

		await screen.findByRole("button", { name: /Buy template/ });
		expect(screen.queryByRole("link", { name: /Try the demo|Interactive preview/ })).not.toBeInTheDocument();
	});

	it("uses a FREE template in one call and refreshes the library", async () => {
		vi.spyOn(templateApi, "listMyClaimedTemplates").mockResolvedValue({
			items: [],
			nextCursor: null,
		});
		const usable = vi.spyOn(templateApi, "listUsableVersions");
		const claim = vi.spyOn(templateApi, "claimFreeTemplate");
		const use = vi.spyOn(templateApi, "useTemplate").mockResolvedValue({ pageId: "p" });
		const user = userEvent.setup();

		renderDetail({ ...publicTemplate, offer_type: "FREE" });

		expect(await screen.findByText("Free")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^Use template/ }));
		const dialog = await screen.findByRole("dialog");
		await user.click(within(dialog).getByRole("button", { name: /Use template/ }));

		await waitFor(() =>
			expect(use).toHaveBeenCalledWith("public-template", publicTemplate.version.id, {
				workspace_id: "ws-1",
			}),
		);
		// The backend claims on first use; the claimed library is refetched afterwards.
		expect(claim).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(templateApi.listMyClaimedTemplates).toHaveBeenCalledTimes(2),
		);
		expect(usable).not.toHaveBeenCalled();
	});
});
