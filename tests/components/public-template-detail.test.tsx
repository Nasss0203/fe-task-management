import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	render,
	renderHook,
	screen,
	waitFor,
	act,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { templateApi } from "@/entities/template/api/template.api";
import {
	usePublicTemplate,
	useInfinitePublicTemplates,
	templateKeys,
} from "@/entities/template/model/template.queries";
import TemplatesSection from "@/widgets/landing/templates/ui/templates-section";
import { PublicTemplateDetailPage } from "@/widgets/landing/templates/ui/public-template-detail";
import { publicTemplate } from "../fixtures/public-template";
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	usePathname: () => "/templates/public-template",
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
const clients: QueryClient[] = [];
function setup() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});
	clients.push(client);
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return { client, wrapper };
}
function notFound() {
	return new AxiosError(
		"Request failed",
		"ERR_BAD_REQUEST",
		undefined,
		undefined,
		{
			status: 404,
			statusText: "Not Found",
			data: { message: "Private template" },
			headers: {},
			config: { headers: new AxiosHeaders() },
		},
	);
}
beforeEach(() => {
	mockUser = null;
	vi.spyOn(templateApi, "getPublicById").mockResolvedValue(publicTemplate);
	vi.spyOn(templateApi, "listPublic").mockResolvedValue({
		items: [],
		nextCursor: null,
	});
	vi.spyOn(templateApi, "getVersionThumbnail").mockResolvedValue({
		url: "https://example.com/thumbnail.png",
		mimeType: "image/png",
		width: 1440,
		height: 900,
	});
});
afterEach(() => {
	mockUser = null;
	clients.splice(0).forEach((c) => c.clear());
	vi.restoreAllMocks();
});
describe("dedicated public detail query", () => {
	it("fetches detail even when Gallery cache has an older item, never scans or paginates it", async () => {
		const { client, wrapper } = setup();
		client.setQueryData(templateKeys.publicList({ limit: 20 }), {
			pages: [
				{
					items: [
						{
							...publicTemplate,
							version: {
								...publicTemplate.version,
								id: "old-version",
								version_number: 1,
							},
						},
					],
					nextCursor: "next-page",
				},
			],
			pageParams: [undefined],
		});
		const { result } = renderHook(() => usePublicTemplate(publicTemplate.id), {
			wrapper,
		});
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.version.id).toBe("published-version-2");
		expect(templateApi.getPublicById).toHaveBeenCalledExactlyOnceWith(
			publicTemplate.id,
			expect.any(AbortSignal),
		);
		expect(templateApi.listPublic).not.toHaveBeenCalled();
		expect(
			client.getQueryData(templateKeys.publicDetail(publicTemplate.id)),
		).toEqual(publicTemplate);
		expect(templateKeys.publicDetail(publicTemplate.id)).not.toEqual(
			templateKeys.detail(publicTemplate.id),
		);
	});
	it.each([
		["", undefined],
		[publicTemplate.id, { enabled: false }],
	])("does not fetch when disabled (%s)", (id, options) => {
		const { wrapper } = setup();
		renderHook(() => usePublicTemplate(id, options), { wrapper });
		expect(templateApi.getPublicById).not.toHaveBeenCalled();
		expect(templateApi.listPublic).not.toHaveBeenCalled();
	});
	it("Gallery search and cursor pagination remain independent", async () => {
		vi.mocked(templateApi.listPublic).mockImplementation(async (params) =>
			params.cursor
				? { items: [{ ...publicTemplate, id: "second" }], nextCursor: null }
				: { items: [publicTemplate], nextCursor: "cursor-2" },
		);
		const { wrapper } = setup();
		const { result } = renderHook(
			() => useInfinitePublicTemplates({ search: "  Updated  ", limit: 1 }),
			{ wrapper },
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		await waitFor(() => expect(result.current.hasNextPage).toBe(true));
		await act(async () => {
			await result.current.fetchNextPage();
		});
		await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
		expect(templateApi.listPublic).toHaveBeenNthCalledWith(
			1,
			{ search: "Updated", limit: 1, cursor: undefined },
			expect.any(AbortSignal),
		);
		expect(templateApi.listPublic).toHaveBeenNthCalledWith(
			2,
			{ search: "Updated", limit: 1, cursor: "cursor-2" },
			expect.any(AbortSignal),
		);
		expect(templateApi.getPublicById).not.toHaveBeenCalled();
	});
});

it("Gallery cards, thumbnail, search and Load more keep using List", async () => {
	vi.mocked(templateApi.listPublic).mockImplementation(async (params) => {
		if (params.search) return { items: [], nextCursor: null };
		if (params.cursor)
			return {
				items: [
					{ ...publicTemplate, id: "second-card", name: "Second template" },
				],
				nextCursor: null,
			};
		return { items: [publicTemplate], nextCursor: "next-page" };
	});
	const { wrapper } = setup();
	const { container } = render(<TemplatesSection />, { wrapper });
	const card = await screen.findByRole("link", {
		name: "View template Database Snapshot Updated",
	});
	expect(card).toHaveAttribute("href", "/templates/public-template");
	await waitFor(() =>
		expect(
			container.querySelector('[style*="thumbnail.png"]'),
		).toBeInTheDocument(),
	);
	await userEvent.click(screen.getByRole("button", { name: "Load more" }));
	expect(
		await screen.findByRole("link", { name: "View template Second template" }),
	).toHaveAttribute("href", "/templates/second-card");
	await userEvent.type(
		screen.getByRole("searchbox", { name: "Search templates" }),
		"missing",
	);
	expect(await screen.findByText("No templates found")).toBeInTheDocument();
	expect(templateApi.listPublic).toHaveBeenCalledWith(
		expect.objectContaining({ search: "missing" }),
		expect.any(AbortSignal),
	);
	expect(templateApi.getPublicById).not.toHaveBeenCalled();
});
describe("public detail UI", () => {
	it("renders the DRAFT template with its PUBLISHED detail version and preserves CTA/preview URLs", async () => {
		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});
		expect(
			await screen.findByRole("heading", { name: publicTemplate.name }),
		).toBeInTheDocument();
		expect(screen.getByText("Version v2")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "About this template" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Preview" })).toHaveAttribute(
			"href",
			"/templates/public-template/versions/published-version-2/preview",
		);
		expect(screen.getByRole("link", { name: "Use template" })).toHaveAttribute(
			"href",
			"/sign-up",
		);
		expect(screen.getByText("Free")).toBeInTheDocument();
		const thumbnailLink = screen.getByRole("link", {
			name: `Interactive preview of ${publicTemplate.name}`,
		});
		expect(thumbnailLink).toHaveAttribute(
			"href",
			"/templates/public-template/versions/published-version-2/preview",
		);
		const thumbnailImg = await screen.findByRole("img", {
			name: publicTemplate.name,
		});
		expect(thumbnailImg).toHaveAttribute(
			"src",
			"https://example.com/thumbnail.png",
		);
		expect(templateApi.getVersionThumbnail).toHaveBeenCalledWith(
			publicTemplate.id,
			publicTemplate.version.id,
			expect.any(AbortSignal),
		);
		expect(templateApi.listPublic).not.toHaveBeenCalled();
	});
	it("renders fallback icon when thumbnail URL is unavailable", async () => {
		vi.mocked(templateApi.getVersionThumbnail).mockResolvedValue(null as any);
		const { wrapper } = setup();
		render(
			<PublicTemplateDetailPage templateId={publicTemplate.id} />,
			{ wrapper },
		);
		expect(
			await screen.findByRole("heading", { name: publicTemplate.name }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", {
				name: `Interactive preview of ${publicTemplate.name}`,
			}),
		).toBeInTheDocument();
		expect(screen.queryByRole("img", { name: publicTemplate.name })).not.toBeInTheDocument();
	});
	it("keeps its existing skeleton while detail is loading", () => {
		vi.mocked(templateApi.getPublicById).mockReturnValue(new Promise(() => {}));
		const { wrapper } = setup();
		const { container } = render(
			<PublicTemplateDetailPage templateId={publicTemplate.id} />,
			{ wrapper },
		);
		expect(
			container.querySelector('[data-slot="skeleton"]'),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: publicTemplate.name }),
		).not.toBeInTheDocument();
		expect(templateApi.listPublic).not.toHaveBeenCalled();
	});
	it("shows generic not-found UI for 404 without leaking backend reason", async () => {
		vi.mocked(templateApi.getPublicById).mockRejectedValue(notFound());
		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId='unknown' />, { wrapper });
		expect(
			await screen.findByRole("heading", { name: "Template not found" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Private template/)).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Try again" }),
		).not.toBeInTheDocument();
		expect(templateApi.listPublic).not.toHaveBeenCalled();
	});
	it("404 replaces stale cached detail after refetch", async () => {
		vi.mocked(templateApi.getPublicById).mockRejectedValue(notFound());
		const { client, wrapper } = setup();
		client.setQueryData(
			templateKeys.publicDetail(publicTemplate.id),
			publicTemplate,
		);
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});
		expect(
			await screen.findByRole("heading", { name: "Template not found" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: publicTemplate.name }),
		).not.toBeInTheDocument();
	});
	it("preserves retry UI for other errors and refetches only Detail", async () => {
		vi.mocked(templateApi.getPublicById)
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValue(publicTemplate);
		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Unable to load template details.",
		);
		await userEvent.click(screen.getByRole("button", { name: "Try again" }));
		expect(
			await screen.findByRole("heading", { name: publicTemplate.name }),
		).toBeInTheDocument();
		expect(templateApi.getPublicById).toHaveBeenCalledTimes(2);
		expect(templateApi.listPublic).not.toHaveBeenCalled();
	});

	it("shows Claimed badge and skips claiming when user already claimed the template", async () => {
		mockUser = { id: "user-claimed", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate").mockResolvedValue({ pageId: "page-1" });
		vi.spyOn(templateApi, "listMyClaimedTemplates").mockResolvedValue({
			items: [
				{
					entitlement_id: "ent-1",
					template_id: publicTemplate.id,
					source: "FREE_CLAIM",
					claimed_at: "2026-10-10T00:00:00.000Z",
					name: publicTemplate.name,
					description: publicTemplate.description,
					icon: publicTemplate.icon,
					cover_url: publicTemplate.cover_url,
					visibility: "PUBLIC",
					status: "PUBLISHED",
					listing_status: "PUBLISHED",
					published_version: publicTemplate.version,
				},
			],
			nextCursor: null,
		});

		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		expect(
			await screen.findByRole("heading", { name: publicTemplate.name }),
		).toBeInTheDocument();
		expect(await screen.findByText("Claimed")).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Use template" }),
		);

		await waitFor(() =>
			expect(useSpy).toHaveBeenCalledWith(
				publicTemplate.id,
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			),
		);
		// Already claimed: must NOT call claimFreeTemplate!
		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("uses an unclaimed FREE template directly; the backend claims it", async () => {
		mockUser = { id: "user-new", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate").mockResolvedValue({ pageId: "page-2" });
		vi.spyOn(templateApi, "listMyClaimedTemplates").mockResolvedValue({
			items: [],
			nextCursor: null,
		});

		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		expect(
			await screen.findByRole("heading", { name: publicTemplate.name }),
		).toBeInTheDocument();
		expect(screen.queryByText("Claimed")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Use template" }),
		);

		await waitFor(() =>
			expect(useSpy).toHaveBeenCalledWith(
				publicTemplate.id,
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			),
		);
		expect(claimSpy).not.toHaveBeenCalled();
	});
});
