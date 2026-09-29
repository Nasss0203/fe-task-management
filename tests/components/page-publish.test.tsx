import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { pagePublicationApi } from "@/entities/page-publication/api/page-publication.api";
import { pagePublicationKeys } from "@/entities/page-publication/model/page-publication.queries";
import type { PagePublicationStatus } from "@/entities/page-publication/model/page-publication.types";
import { PagePublishTab } from "@/features/page-publish/ui/PagePublishTab";

vi.mock("@/entities/page/api/page.api", () => ({
	pageApi: { getById: vi.fn(async () => ({ workspace_id: "workspace-1" })) },
}));

const site = { id: "site-1", workspace_id: "workspace-1", root_page_id: "home", subdomain: "asss", disabled_at: null, created_at: "2026-09-29T00:00:00Z" };
const publication = { site_id: site.id, page_id: "about", subdomain: site.subdomain, path: "/about", published_at: "2026-09-29T00:00:00Z" };
let status: PagePublicationStatus;

function mount() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
	render(<QueryClientProvider client={client}><PagePublishTab pageId='about' /></QueryClientProvider>);
	return client;
}

async function chooseExistingSite() {
	await userEvent.click(await screen.findByRole("button", { name: "Add to existing site" }));
	const select = await screen.findByRole("combobox", { name: "Site" });
	fireEvent.pointerDown(select, { button: 0, ctrlKey: false, pointerType: "mouse" });
	fireEvent.keyDown(await screen.findByRole("option", { name: "asss" }), { key: "Enter" });
	await waitFor(() => expect(screen.queryByRole("option", { name: "asss" })).not.toBeInTheDocument());
}

describe("PagePublishTab", () => {
	beforeEach(() => {
		status = { published: false };
		vi.spyOn(pagePublicationApi, "getPagePublication").mockImplementation(async () => status);
		vi.spyOn(pagePublicationApi, "listWorkspacePublishedSites").mockResolvedValue([site]);
		vi.spyOn(pagePublicationApi, "publishPage").mockImplementation(async () => { status = { ...publication, path: "/", published: true }; return { ...publication, path: "/" }; });
		vi.spyOn(pagePublicationApi, "publishPageToSite").mockImplementation(async (_siteId, payload) => { status = { ...publication, path: payload.path, published: true }; return { ...publication, path: payload.path }; });
		vi.spyOn(pagePublicationApi, "republishPage").mockImplementation(async () => { status = { ...publication, published: true }; return publication; });
	});
	afterEach(() => vi.restoreAllMocks());

	it("creates a new root site and refetches published status", async () => {
		mount();
		await userEvent.type(await screen.findByLabelText("Site address"), "asss");
		await userEvent.click(screen.getByRole("button", { name: "Publish" }));
		expect(pagePublicationApi.publishPage).toHaveBeenCalledWith("about", { subdomain: "asss" });
		expect(await screen.findByText("Published", { exact: true })).toBeInTheDocument();
	});

	it("lists the page workspace sites, normalizes path, and invalidates related caches", async () => {
		const client = mount();
		const invalidate = vi.spyOn(client, "invalidateQueries");
		await chooseExistingSite();
		expect(pagePublicationApi.listWorkspacePublishedSites).toHaveBeenCalledWith("workspace-1", expect.any(AbortSignal));
		await userEvent.type(screen.getByLabelText("Path"), "about/");
		expect(screen.getByText(/Preview:.*asss.*\/about/)).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Publish" }));
		expect(pagePublicationApi.publishPageToSite).toHaveBeenCalledWith("site-1", { page_id: "about", path: "/about" });
		await screen.findByText("Published", { exact: true });
		for (const queryKey of [pagePublicationKeys.detail("about"), pagePublicationKeys.workspaceSites("workspace-1"), pagePublicationKeys.sitePublications("site-1")]) {
			expect(invalidate).toHaveBeenCalledWith({ queryKey });
		}
		expect(pagePublicationApi.publishPage).not.toHaveBeenCalled();
	});

	it("rejects root paths and preserves site/path after an inline backend conflict", async () => {
		vi.mocked(pagePublicationApi.publishPageToSite).mockRejectedValue(Object.assign(new AxiosError("Conflict"), { response: { status: 409, data: { message: "Path already exists." } } }));
		mount();
		await chooseExistingSite();
		await userEvent.type(screen.getByLabelText("Path"), "/");
		expect(screen.getByText("Root path is reserved for the site's home page.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
		await userEvent.clear(screen.getByLabelText("Path"));
		await userEvent.type(screen.getByLabelText("Path"), "/about");
		await userEvent.click(screen.getByRole("button", { name: "Publish" }));
		expect(await screen.findByText("Path already exists.")).toBeInTheDocument();
		expect(screen.getByLabelText("Path")).toHaveValue("/about");
		expect(screen.getByRole("combobox", { name: "Site" })).toHaveTextContent("asss");
	});

	it("keeps create mode when the workspace has no active sites", async () => {
		vi.mocked(pagePublicationApi.listWorkspacePublishedSites).mockResolvedValue([]);
		mount();
		await screen.findByText("No published sites yet. Create a new site first.");
		expect(screen.getByRole("button", { name: "Add to existing site" })).toBeDisabled();
		expect(screen.getByLabelText("Site address")).toBeInTheDocument();
	});

	it("keeps loading site-list state distinct from empty state", async () => {
		vi.mocked(pagePublicationApi.listWorkspacePublishedSites).mockReturnValue(new Promise(() => {}));
		const client = mount();
		await userEvent.click(await screen.findByRole("button", { name: "Add to existing site" }));
		expect(await screen.findByRole("status", { name: "Loading published sites" })).toBeInTheDocument();
		expect(screen.queryByText(/No published sites yet/)).not.toBeInTheDocument();
		client.clear();
	});

	it("shows a site-list error inline with retry", async () => {
		vi.mocked(pagePublicationApi.listWorkspacePublishedSites).mockRejectedValue(new Error("Network error"));
		mount();
		await userEvent.click(await screen.findByRole("button", { name: "Add to existing site" }));
		expect(await screen.findByText("Unable to load published sites.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
		expect(screen.queryByText(/No published sites yet/)).not.toBeInTheDocument();
	});

	it("republishes a previous nested publication without requesting a new site/path", async () => {
		status = { ...publication, published: false };
		mount();
		await userEvent.click(await screen.findByRole("button", { name: "Republish" }));
		await waitFor(() => expect(pagePublicationApi.republishPage).toHaveBeenCalledWith("about"));
		expect(await screen.findByText("Published", { exact: true })).toBeInTheDocument();
		expect(screen.queryByLabelText("Path")).not.toBeInTheDocument();
		expect(screen.getByText(/asss.*\/about/)).toBeInTheDocument();
		expect(pagePublicationApi.listWorkspacePublishedSites).not.toHaveBeenCalled();
	});
});
