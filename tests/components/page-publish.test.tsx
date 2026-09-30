import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pagePublicationApi } from "@/entities/page-publication/api/page-publication.api";
import type { PagePublication } from "@/entities/page-publication/model/page-publication.types";
import { PagePublishTab } from "@/features/page-publish/ui/PagePublishTab";

vi.mock("@/entities/page/api/page.api", () => ({
	pageApi: {
		getById: vi.fn(async (id: string) => {
			if (id === "home") {
				return {
					id: "home",
					workspace_id: "workspace-1",
					parent_page_id: null,
					public_subdomain: "asss",
					title: "Page 1",
				};
			}
			return {
				id: "about",
				workspace_id: "workspace-1",
				parent_page_id: "home",
				public_subdomain: null,
				title: "About",
			};
		}),
	},
}));

const rootDirectPublished: PagePublication = {
	id: "pub-1",
	page_id: "home",
	site_id: "site-1",
	subdomain: "asss",
	parent_publication_id: null,
	path: "/",
	publication_type: "DIRECT",
	include_descendants: true,
	published: true,
	published_at: "2026-09-29T00:00:00Z",
	unpublished_at: null,
};

const inheritedChildPublished: PagePublication = {
	id: "pub-2",
	page_id: "about",
	site_id: "site-1",
	subdomain: "asss",
	parent_publication_id: "pub-1",
	path: "/about",
	publication_type: "INHERITED",
	include_descendants: true,
	published: true,
	published_at: "2026-09-29T00:00:00Z",
	unpublished_at: null,
};

const historicalChildDirectUnpublished: PagePublication = {
	id: "pub-old",
	page_id: "about",
	site_id: "site-old",
	subdomain: "abc",
	parent_publication_id: null,
	path: "/",
	publication_type: "DIRECT",
	include_descendants: false,
	published: false,
	published_at: "2026-09-01T00:00:00Z",
	unpublished_at: "2026-09-10T00:00:00Z",
};

let records: PagePublication[];

function mount(pageId: string) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	render(
		<QueryClientProvider client={client}>
			<PagePublishTab pageId={pageId} />
		</QueryClientProvider>,
	);
	return client;
}

describe("PagePublishTab", () => {
	beforeEach(() => {
		records = [];
		vi.spyOn(pagePublicationApi, "listPagePublications").mockImplementation(async () => records);
		vi.spyOn(pagePublicationApi, "publishPage").mockResolvedValue({
			site_id: "site-1",
			page_id: "home",
			subdomain: "asss",
			path: "/",
			published_at: "2026-09-30T00:00:00Z",
		});
		vi.spyOn(pagePublicationApi, "updatePublicationSettings").mockImplementation(
			async (_pageId, _siteId, payload) => {
				records = [{ ...rootDirectPublished, include_descendants: payload.include_descendants }];
				return records[0];
			},
		);
		vi.spyOn(pagePublicationApi, "unpublishPage").mockImplementation(async () => ({
			site_id: "site-1",
			page_id: "home",
			subdomain: "asss",
			path: "/",
			published: false,
			unpublished_at: "2026-09-30T00:00:00Z",
		}));
		vi.spyOn(pagePublicationApi, "republishPage").mockImplementation(async () => ({
			site_id: "site-1",
			page_id: "home",
			subdomain: "asss",
			path: "/",
			published_at: "2026-09-30T00:00:00Z",
		}));
	});

	afterEach(() => vi.restoreAllMocks());

	it("renders Root private with site URL, subpages switch, and Publish button (sends only include_descendants)", async () => {
		records = [];
		mount("home");

		expect(await screen.findByText(/asss\.localhost:3000/)).toBeInTheDocument();
		expect(screen.getByText("Site address")).toBeInTheDocument();

		const checkbox = screen.getByRole("checkbox", { name: "Publish subpages" });
		expect(checkbox).toBeInTheDocument();
		expect(checkbox).toBeChecked();

		const publishBtn = screen.getByRole("button", { name: "Publish" });
		expect(publishBtn).toBeInTheDocument();

		await userEvent.click(publishBtn);

		await waitFor(() => {
			expect(pagePublicationApi.publishPage).toHaveBeenCalledWith("home", {
				include_descendants: true,
			});
		});

		// Verify request body does NOT contain subdomain, path, or site_id
		const callArgs = vi.mocked(pagePublicationApi.publishPage).mock.calls[0];
		expect(callArgs[0]).toBe("home");
		expect(callArgs[1]).toEqual({ include_descendants: true });
		expect(callArgs[1]).not.toHaveProperty("subdomain");
		expect(callArgs[1]).not.toHaveProperty("path");
		expect(callArgs[1]).not.toHaveProperty("site_id");
	});

	it("renders Root public with root URL, subpages switch, Unpublish, and View site", async () => {
		records = [rootDirectPublished];
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
		mount("home");

		expect(await screen.findByText(/asss\.localhost:3000/)).toBeInTheDocument();
		expect(screen.queryByText("Site address")).not.toBeInTheDocument();
		expect(screen.queryByText(/DIRECT/i)).not.toBeInTheDocument();

		const checkbox = screen.getByRole("checkbox", { name: "Publish subpages" });
		expect(checkbox).toBeChecked();

		const unpublishBtn = screen.getByRole("button", { name: "Unpublish" });
		const viewSiteBtn = screen.getByRole("button", { name: /View site/i });
		expect(unpublishBtn).toBeInTheDocument();
		expect(viewSiteBtn).toBeInTheDocument();

		// View site opens root URL
		await userEvent.click(viewSiteBtn);
		expect(openSpy).toHaveBeenCalledWith(
			expect.stringMatching(/http:\/\/asss\.localhost:3000\/?$/),
			"_blank",
			"noopener,noreferrer",
		);

		// Unpublish opens confirmation and calls API on confirm
		await userEvent.click(unpublishBtn);
		const confirmBtn = await screen.findByRole("button", { name: "Unpublish" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(pagePublicationApi.unpublishPage).toHaveBeenCalledWith("home", "site-1");
		});
	});

	it("toggles root descendants setting via PATCH with correct boolean", async () => {
		records = [rootDirectPublished];
		mount("home");

		const checkbox = await screen.findByRole("checkbox", { name: "Publish subpages" });
		expect(checkbox).toBeChecked();

		await userEvent.click(checkbox);

		await waitFor(() => {
			expect(pagePublicationApi.updatePublicationSettings).toHaveBeenCalledWith(
				"home",
				"site-1",
				{ include_descendants: false },
			);
		});
	});

	it("renders Child inherited with /about URL, 'Published via parent page', and View site (NO publish, NO selector, NO switch)", async () => {
		records = [inheritedChildPublished];
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
		mount("about");

		expect(await screen.findByText(/asss\.localhost:3000\/about/)).toBeInTheDocument();
		expect(screen.getByText("Published via parent page")).toBeInTheDocument();

		const viewSiteBtn = screen.getByRole("button", { name: /View site/i });
		expect(viewSiteBtn).toBeInTheDocument();

		await userEvent.click(viewSiteBtn);
		expect(openSpy).toHaveBeenCalledWith(
			expect.stringMatching(/http:\/\/asss\.localhost:3000\/about$/),
			"_blank",
			"noopener,noreferrer",
		);

		// Verification that forbidden child controls are absent
		expect(screen.queryByRole("button", { name: /^Publish$/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Unpublish" })).not.toBeInTheDocument();
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
		expect(screen.queryByLabelText(/Site address/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/New site/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Existing site/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Publish somewhere else/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/INHERITED/i)).not.toBeInTheDocument();
	});

	it("renders Child private when child is not published with explanation and NO publish button", async () => {
		records = [];
		mount("about");

		expect(await screen.findByText("This page is not currently public.")).toBeInTheDocument();
		expect(
			screen.getByText("Child pages are published through their parent page."),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Publish the parent page with subpages enabled to make this page public.",
			),
		).toBeInTheDocument();

		expect(screen.queryByRole("button", { name: /Publish/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Create site/i })).not.toBeInTheDocument();
	});

	it("ignores historical child DIRECT publication and renders only active inherited publication", async () => {
		records = [historicalChildDirectUnpublished, inheritedChildPublished];
		mount("about");

		expect(await screen.findByText(/asss\.localhost:3000\/about/)).toBeInTheDocument();
		expect(screen.getByText("Published via parent page")).toBeInTheDocument();

		// Does not render historical "abc" site
		expect(screen.queryByText(/abc/)).not.toBeInTheDocument();
		// Does not offer republish
		expect(screen.queryByRole("button", { name: /Republish/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^Publish$/i })).not.toBeInTheDocument();
	});

	it("ignores historical child DIRECT publication when child has no active inherited publication", async () => {
		records = [historicalChildDirectUnpublished];
		mount("about");

		expect(await screen.findByText("This page is not currently public.")).toBeInTheDocument();
		expect(
			screen.getByText("Child pages are published through their parent page."),
		).toBeInTheDocument();

		expect(screen.queryByText(/abc/)).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Republish/i })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /^Publish$/i })).not.toBeInTheDocument();
	});

	it("copies the public link to clipboard and provides feedback", async () => {
		records = [inheritedChildPublished];
		const writeTextMock = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, {
			clipboard: {
				writeText: writeTextMock,
			},
		});

		mount("about");

		const copyBtn = await screen.findByRole("button", { name: "Copy link" });
		await userEvent.click(copyBtn);

		expect(writeTextMock).toHaveBeenCalledWith(
			expect.stringMatching(/http:\/\/asss\.localhost:3000\/about$/),
		);
		expect(await screen.findByText("Copied")).toBeInTheDocument();
	});
});
