import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { templateApi, templateKeys } from "@/entities/template";
import { WorkspaceTemplateLibraryPage } from "@/widgets/workspace-template-gallery";
import { publicTemplate } from "../fixtures/public-template";
import { claimedTemplate } from "../fixtures/claimed-template";

const navigation = vi.hoisted(() => ({
	push: vi.fn(),
	replace: vi.fn(),
	params: "tab=mine",
	userId: "user-a",
	workspaces: [{ id: "ws-1", name: "Engineering" }],
}));
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
	usePathname: () => "/dashboard/templates",
	useSearchParams: () => new URLSearchParams(navigation.params),
}));
vi.mock("@/features/auth", () => ({
	useUser: () => ({
		user: { id: navigation.userId, lastActiveWorkspaceId: "ws-1" },
		isAuthenticated: true,
		isBootstrapped: true,
	}),
}));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: navigation.workspaces, isLoading: false }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function usableVersion(id: string, version_number: number, is_current: boolean) {
	return {
		id,
		version_number,
		is_current,
		status: "PUBLISHED" as const,
		released_at: "2026-10-10T00:00:00.000Z",
	};
}

let client: QueryClient;
function setup() {
	client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return render(
		<QueryClientProvider client={client}>
			<WorkspaceTemplateLibraryPage />
		</QueryClientProvider>,
	);
}

beforeEach(() => {
	vi.restoreAllMocks();
	navigation.params = "tab=mine";
	navigation.userId = "user-a";
	navigation.push.mockClear();
	navigation.replace.mockClear();
	vi.spyOn(templateApi, "list").mockResolvedValue({
		items: [{ ...publicTemplate, name: "Created planning" }],
		nextCursor: null,
	});
	vi.spyOn(templateApi, "listMyClaimedTemplates").mockResolvedValue({
		items: [claimedTemplate],
		nextCursor: null,
	});
	vi.spyOn(templateApi, "getVersionThumbnail").mockResolvedValue({
		url: "https://example.com/old-thumb.png",
		mimeType: "image/png",
		width: 100,
		height: 100,
	});
	vi.spyOn(templateApi, "listUsableVersions").mockResolvedValue({
		items: [usableVersion("pinned-v1", 1, true)],
	});
	vi.spyOn(templateApi, "listMyPurchases").mockResolvedValue({
		items: [],
		nextCursor: null,
	});
	vi.spyOn(templateApi, "claimFreeTemplate");
	vi.spyOn(templateApi, "useTemplate").mockResolvedValue({
		pageId: "new-page",
	});
});
afterEach(() => {
	client?.clear();
	vi.restoreAllMocks();
});

describe("Workspace template library (claimed templates)", () => {
	it("renders skeletons while loading the claimed library", async () => {
		navigation.params = "tab=mine&library=claimed";
		let resolve!: (value: { items: typeof claimedTemplate[]; nextCursor: null }) => void;
		vi.mocked(templateApi.listMyClaimedTemplates).mockReturnValue(new Promise(done => { resolve = done; }));
		const { container } = setup();
		expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
		expect(screen.queryByText("Your library is empty")).not.toBeInTheDocument();
		resolve({ items: [claimedTemplate], nextCursor: null });
		await screen.findByRole("heading", { name: "Claimed planning" });
		expect(container.querySelector('[data-slot="skeleton"]')).not.toBeInTheDocument();
	});

	it("shows the empty state and retries initial errors", async () => {
		vi.mocked(templateApi.listMyClaimedTemplates)
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValue({ items: [], nextCursor: null });
		setup();
		await screen.findByText("Unable to load your library.");
		await userEvent.click(screen.getByRole("button", { name: "Try again" }));
		await screen.findByText("Your library is empty");
	});

	it("keeps unpublished templates, uses the supplied pin, and never claims again", async () => {
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [{ ...claimedTemplate, listing_status: "DRAFT" }],
			nextCursor: null,
		});
		setup();
		await screen.findByText("Unpublished · In your library");
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Use template" }),
		);
		await waitFor(() =>
			expect(templateApi.useTemplate).toHaveBeenCalledWith(
				"template-a",
				"pinned-v1",
				{ workspace_id: "ws-1" },
			),
		);
		expect(templateApi.claimFreeTemplate).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(navigation.push).toHaveBeenCalledWith("/page/new-page"),
		);
	});

	it("shows server authorization errors from the existing Use dialog", async () => {
		vi.mocked(templateApi.useTemplate).mockRejectedValue({
			isAxiosError: true,
			response: {
				status: 403,
				data: { message: "You do not have permission to use this template" },
			},
		});
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Use template" }),
		);
		await within(dialog).findByText(
			"You do not have permission to use this template",
		);
		expect(templateApi.claimFreeTemplate).not.toHaveBeenCalled();
	});

	it.each(["PRIVATE", "WORKSPACE"] as const)(
		"redacts %s metadata without looking up thumbnails or other APIs",
		async (visibility) => {
			navigation.params = "tab=mine&library=claimed";
			vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
				items: [
					{
						...claimedTemplate,
						visibility,
						name: null,
						description: "hidden",
						icon: "hidden icon",
						cover_url: "https://example.com/hidden.png",
					},
				],
				nextCursor: null,
			});
			const detail = vi.spyOn(templateApi, "getById"),
				publicDetail = vi.spyOn(templateApi, "getPublicById");
			setup();
			await screen.findByRole("heading", { name: "Restricted template" });
			expect(screen.queryByText("hidden")).not.toBeInTheDocument();
			expect(screen.queryByRole("img")).not.toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Details" })).toBeDisabled();
			expect(
				screen.getByRole("button", { name: "Use template" }),
			).toBeDisabled();
			expect(templateApi.list).not.toHaveBeenCalled();
			expect(templateApi.getVersionThumbnail).not.toHaveBeenCalled();
			expect(detail).not.toHaveBeenCalled();
			expect(publicDetail).not.toHaveBeenCalled();
		},
	);

	it.each(["archived", "no-version", "foreign-version"])(
		"disables unavailable Use for %s",
		async (scenario) => {
			navigation.params = "tab=mine&library=claimed";
			const item = { ...claimedTemplate };
			if (scenario === "archived") item.status = "ARCHIVED";
			else if (scenario === "no-version") item.published_version = null;
			else
				item.published_version = {
					...claimedTemplate.published_version!,
					template_id: "different-template",
				};
			vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
				items: [item],
				nextCursor: null,
			});
			setup();
			await screen.findByRole("heading", { name: "Claimed planning" });
			expect(
				screen.getByRole("button", { name: "Use template" }),
			).toBeDisabled();
			if (scenario === "archived")
				expect(screen.getByText("Archived · Unavailable")).toBeInTheDocument();
		},
	);

	it("loads cursor pages, deduplicates, retains cards when Load More fails and retries", async () => {
		navigation.params = "tab=mine&library=claimed";
		const second = {
			...claimedTemplate,
			entitlement_id: "ent-b",
			template_id: "template-b",
			name: "Second claimed",
			published_version: null,
		};
		vi.mocked(templateApi.listMyClaimedTemplates)
			.mockResolvedValueOnce({
				items: [claimedTemplate],
				nextCursor: "next-page",
			})
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce({
				items: [claimedTemplate, second],
				nextCursor: null,
			});
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Load more" }));
		await screen.findByText("Unable to load more templates.");
		expect(
			screen.getByRole("heading", { name: "Claimed planning" }),
		).toBeInTheDocument();
		// Load more stays available after a failed page, so it doubles as retry.
		await userEvent.click(screen.getByRole("button", { name: "Load more" }));
		await screen.findByRole("heading", { name: "Second claimed" });
		expect(templateApi.listMyClaimedTemplates).toHaveBeenLastCalledWith(
			{ limit: 20, cursor: "next-page" },
			expect.any(AbortSignal),
		);
		expect(
			screen.getAllByRole("heading", { name: "Claimed planning" }),
		).toHaveLength(1);
		expect(
			screen.queryByRole("button", { name: "Load more" }),
		).not.toBeInTheDocument();
	});

	it("isolates cached libraries between authenticated users", async () => {
		navigation.params = "tab=mine&library=claimed";
		const { rerender } = setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [],
			nextCursor: null,
		});
		navigation.userId = "user-b";
		rerender(
			<QueryClientProvider client={client}>
				<WorkspaceTemplateLibraryPage />
			</QueryClientProvider>,
		);
		expect(
			screen.queryByRole("heading", { name: "Claimed planning" }),
		).not.toBeInTheDocument();
		await screen.findByText("Your library is empty");
		expect(client.getQueryData(templateKeys.claimed("user-a"))).toBeDefined();
		expect(client.getQueryData(templateKeys.claimed("user-b"))).toBeDefined();
	});

	it("closes stale details after metadata becomes restricted on refetch", async () => {
		navigation.params = "tab=mine&library=claimed";
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [{ ...claimedTemplate, listing_status: "DRAFT" }],
			nextCursor: null,
		});
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Details" }));
		await screen.findByRole("dialog");
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [
				{
					...claimedTemplate,
					name: null,
					visibility: "PRIVATE",
					published_version: null,
				},
			],
			nextCursor: null,
		});
		await client.invalidateQueries({
			queryKey: templateKeys.claimed("user-a"),
		});
		await screen.findByRole("heading", { name: "Restricted template" });
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("NAV-01/02/03: navigates to consumer template detail for public published template when clicking title or details", async () => {
		navigation.params = "tab=mine&library=claimed";
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Details" }));
		expect(navigation.push).toHaveBeenCalledWith("/dashboard/templates/template-a");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("NAV-04: opens UseTemplateDialog without navigating to consumer detail when clicking Use template", async () => {
		navigation.params = "tab=mine&library=claimed";
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		expect(within(dialog).getByRole("heading", { name: "Use template" })).toBeInTheDocument();
		expect(navigation.push).not.toHaveBeenCalledWith("/dashboard/templates/template-a");
	});

	it("NAV-07/08: shows unpublished information dialog with working Use template action and does not navigate to public detail", async () => {
		navigation.params = "tab=mine&library=claimed";
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [{ ...claimedTemplate, listing_status: "DRAFT" }],
			nextCursor: null,
		});
		setup();
		await screen.findByText("Unpublished · In your library");
		await userEvent.click(screen.getByRole("button", { name: "Details" }));
		const dialog = await screen.findByRole("dialog");
		expect(
			within(dialog).getByText("This template is no longer listed on the public Marketplace."),
		).toBeInTheDocument();
		expect(
			within(dialog).getByText("You previously claimed this template."),
		).toBeInTheDocument();
		expect(navigation.push).not.toHaveBeenCalledWith("/dashboard/templates/template-a");

		// Clicking Use template from unpublished info dialog opens UseTemplateDialog
		await userEvent.click(within(dialog).getByRole("button", { name: "Use template" }));
		const useDialog = await screen.findByRole("dialog");
		expect(within(useDialog).getByRole("heading", { name: "Use template" })).toBeInTheDocument();
	});

	it("7.2F: a free claim uses its free release, not the newer paid published version", async () => {
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [
				{
					...claimedTemplate,
					published_version: {
						...claimedTemplate.published_version!,
						id: "paid-v4",
						version_number: 4,
					},
				},
			],
			nextCursor: null,
		});
		vi.mocked(templateApi.listUsableVersions).mockResolvedValue({
			items: [usableVersion("free-v1", 1, false)],
		});
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		// The card names the listing's latest release, not the one Use will pin.
		expect(screen.getByText("Latest v4")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		expect(within(dialog).queryByLabelText("Version to use")).not.toBeInTheDocument();
		await userEvent.click(within(dialog).getByRole("button", { name: "Use template" }));
		await waitFor(() =>
			expect(templateApi.useTemplate).toHaveBeenCalledWith("template-a", "free-v1", {
				workspace_id: "ws-1",
			}),
		);
	});

	it("7.2F: picks a usable release, defaulting to the latest", async () => {
		vi.mocked(templateApi.listUsableVersions).mockResolvedValue({
			items: [usableVersion("v2", 2, true), usableVersion("v1", 1, false)],
		});
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		const picker = within(dialog).getByLabelText("Version to use");
		expect(picker).toHaveTextContent("v2 · latest");
		await userEvent.click(picker);
		await userEvent.click(await screen.findByRole("option", { name: "v1" }));
		await userEvent.click(within(dialog).getByRole("button", { name: "Use template" }));
		await waitFor(() =>
			expect(templateApi.useTemplate).toHaveBeenCalledWith("template-a", "v1", {
				workspace_id: "ws-1",
			}),
		);
	});

	it("7.2F: explains when no release is usable and opens no dialog", async () => {
		vi.mocked(templateApi.listUsableVersions).mockResolvedValue({ items: [] });
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		await waitFor(() => expect(toast.error).toHaveBeenCalled());
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(templateApi.useTemplate).not.toHaveBeenCalled();
	});

	it("7.2F: labels each card by how it entered the library", async () => {
		vi.mocked(templateApi.listMyClaimedTemplates).mockResolvedValue({
			items: [
				{ ...claimedTemplate, source: "PAID_PURCHASE" },
				{
					...claimedTemplate,
					entitlement_id: "ent-b",
					template_id: "template-b",
					name: "Free planning",
				},
			],
			nextCursor: null,
		});
		setup();
		await screen.findByRole("heading", { name: "Free planning" });
		expect(screen.getByText("Purchased", { selector: '[data-slot="badge"]' })).toBeInTheDocument();
		expect(screen.getByText("Claimed", { selector: '[data-slot="badge"]' })).toBeInTheDocument();
	});

	it.each([
		["purchased", "PAID_PURCHASE", "Purchased"],
		["claimed", "FREE_CLAIM", "Claimed"],
	] as const)("7.2F: tab=%s filters the library by source", async (tab, source, label) => {
		navigation.params = "tab=" + tab;
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		expect(templateApi.listMyClaimedTemplates).toHaveBeenCalledWith(
			{ limit: 20, cursor: undefined, source },
			expect.any(AbortSignal),
		);
		expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(label);
	});

	it("7.2F: switching tabs keeps other query params in the URL", async () => {
		navigation.params = "tag=crm";
		setup();
		await screen.findByRole("heading", { name: "Claimed planning" });
		await userEvent.click(screen.getByRole("tab", { name: "Purchase history" }));
		expect(navigation.replace).toHaveBeenCalledWith(
			"/dashboard/templates?tag=crm&tab=history",
			{ scroll: false },
		);
	});

	it("7.2F: the Created tab lists own templates and opens them in Creator Studio", async () => {
		navigation.params = "tab=created";
		setup();
		await screen.findByRole("heading", { name: "Created planning" });
		expect(templateApi.list).toHaveBeenCalledWith(
			expect.objectContaining({ scope: "mine" }),
			expect.any(AbortSignal),
		);
		expect(templateApi.listMyClaimedTemplates).not.toHaveBeenCalled();
		expect(screen.getByText("Created", { selector: '[data-slot="badge"]' })).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Details" }));
		expect(navigation.push).toHaveBeenCalledWith("/creator/templates/" + publicTemplate.id);
	});

	it("7.2F: the purchase history tab shows orders with status, amount and version", async () => {
		navigation.params = "tab=history";
		vi.mocked(templateApi.listMyPurchases).mockResolvedValue({
			items: [
				{
					id: "purchase-1",
					orderCode: "TP0001",
					templateId: "template-a",
					templateName: "Claimed planning",
					templateIcon: "📋",
					versionNumber: 3,
					amount: 50000,
					currency: "VND",
					status: "PAID",
					createdAt: "2026-10-18T09:00:00.000Z",
					paidAt: "2026-10-18T09:02:00.000Z",
				},
				{
					id: "purchase-2",
					orderCode: "TP0002",
					templateId: "template-hidden",
					templateName: null,
					templateIcon: null,
					versionNumber: null,
					amount: 20000,
					currency: "VND",
					status: "EXPIRED",
					createdAt: "2026-10-17T09:00:00.000Z",
					paidAt: null,
				},
			],
			nextCursor: null,
		});
		setup();
		const link = await screen.findByRole("link", { name: "Claimed planning" });
		expect(link).toHaveAttribute("href", "/dashboard/templates/template-a");
		expect(screen.getByText("Paid")).toBeInTheDocument();
		expect(screen.getByText("Expired")).toBeInTheDocument();
		expect(screen.getByText("Unavailable template")).toBeInTheDocument();
		expect(screen.getByText(/v3 ·/)).toBeInTheDocument();
		expect(screen.getByText(/50\.000/)).toBeInTheDocument();
		expect(templateApi.listMyClaimedTemplates).not.toHaveBeenCalled();
	});

	it("7.2F: shows an empty purchase history", async () => {
		navigation.params = "tab=history";
		setup();
		await screen.findByText("No purchases yet");
	});
});
