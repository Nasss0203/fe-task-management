import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";

import { templateApi } from "@/entities/template/api/template.api";
import { templateKeys } from "@/entities/template/model/template.queries";
import type {
	PageTemplate,
	TemplateListingDto,
	TemplateVersion,
} from "@/entities/template/model/template.types";
import { TemplateMarketplaceShell } from "@/widgets/dashboard-templates/detail/ui/template-marketplace-shell";
import { TemplateDetailPage } from "@/widgets/dashboard-templates/detail/ui/template-detail-page";

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn() }),
	useSearchParams: () => mockSearchParams,
}));
vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "user-creator" } }),
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

const mockTemplate: PageTemplate = {
	id: "tpl-123",
	source_page_id: null,
	workspace_id: "ws-456",
	name: "Engineering System",
	description: "System engineering templates",
	icon: "🛠️",
	cover_url: null,
	created_by: "user-creator",
	status: "PUBLISHED",
	visibility: "PUBLIC",
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-05T00:00:00.000Z",
};

const mockDraftListing: TemplateListingDto = {
	id: "listing-1",
	template_id: "tpl-123",
	offer_type: "FREE",
	status: "DRAFT",
	created_by: "user-creator",
	published_at: null,
	created_at: "2026-10-05T10:00:00.000Z",
	updated_at: "2026-10-05T10:00:00.000Z",
};

const mockPublishedListing: TemplateListingDto = {
	...mockDraftListing,
	status: "PUBLISHED",
	published_at: "2026-10-06T12:00:00.000Z",
};

const mockVersions: TemplateVersion[] = [
	{
		id: "ver-1",
		template_id: "tpl-123",
		version_number: 1,
		status: "PUBLISHED",
		created_by: "user-creator",
		published_at: "2026-10-05T00:00:00.000Z",
		created_at: "2026-10-05T00:00:00.000Z",
		updated_at: "2026-10-05T00:00:00.000Z",
	},
];

function createAxiosError(status: number, message: string) {
	return new AxiosError(message, `ERR_${status}`, undefined, undefined, {
		status,
		statusText: status === 404 ? "Not Found" : "Forbidden",
		data: { message },
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

const clients: QueryClient[] = [];
function setup() {
	const client = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0 },
			mutations: { retry: false },
		},
	});
	clients.push(client);
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return { client, wrapper };
}

beforeEach(() => {
	vi.restoreAllMocks();
	mockToastSuccess.mockReset();
	mockToastError.mockReset();
});

afterEach(() => {
	clients.splice(0).forEach((c) => c.clear());
	vi.restoreAllMocks();
});

describe("One-click Marketplace publishing", () => {
	async function renderShell(
		options: { missing?: boolean; private?: boolean; live?: boolean } = {},
	) {
		vi.spyOn(templateApi, "getListing").mockImplementation(() =>
			options.missing
				? Promise.reject(createAxiosError(404, "Listing not found"))
				: Promise.resolve(
						options.live
							? { ...mockPublishedListing, published_version_id: "ver-1" }
							: mockDraftListing,
					),
		);
		const draft = {
			...mockVersions[0],
			id: "ver-2",
			version_number: 2,
			status: "DRAFT" as const,
			published_at: null,
		};
		const { wrapper, client } = setup();
		render(
			<TemplateMarketplaceShell
				template={{
					...mockTemplate,
					visibility: options.private ? "PRIVATE" : "PUBLIC",
				}}
				versions={[...mockVersions, draft]}
				selectedVersionId="ver-2"
			/>,
			{ wrapper },
		);
		await screen.findByText(
			options.live ? "Live on Marketplace" : "Publish your template",
		);
		return { client };
	}
	it.each([true, false])(
		"missing listing=%s allows direct publication without prerequisites",
		async (missing) => {
			await renderShell({ missing, private: true });
			expect(
				screen.getByRole("button", { name: "Publish to Marketplace" }),
			).toBeEnabled();
			expect(screen.queryByText("Create FREE Listing")).not.toBeInTheDocument();
			expect(
				screen.queryByText("Publication Checklist"),
			).not.toBeInTheDocument();
		},
	);
	it("dialog selects preview version, explains draft and PUBLIC, cancel makes no request", async () => {
		const publish = vi.spyOn(templateApi, "publishToMarketplace");
		await renderShell({ missing: true, private: true });
		await userEvent.click(
			screen.getByRole("button", { name: "Publish to Marketplace" }),
		);
		expect(screen.getByRole("radio", { name: /v2.*Draft/ })).toBeChecked();
		expect(
			screen.getByText("Your template will become publicly available."),
		).toBeInTheDocument();
		expect(
			screen.getByText("The selected draft version will be published."),
		).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(publish).not.toHaveBeenCalled();
	});
	it.each(["ver-1", "ver-2"])(
		"confirm sends only one publication request for %s and invalidates scoped caches",
		async (versionId) => {
			const result = {
				template: mockTemplate,
				version: { ...mockVersions[0], id: versionId },
				listing: { ...mockPublishedListing, published_version_id: versionId },
			};
			const publish = vi
				.spyOn(templateApi, "publishToMarketplace")
				.mockResolvedValue(result);
			const create = vi.spyOn(templateApi, "createListing");
			const legacyPublish = vi.spyOn(templateApi, "publishListing");
			const update = vi.spyOn(templateApi, "update");
			const versionPublish = vi.spyOn(templateApi, "publishVersion");
			const { client } = await renderShell();
			const invalidation = vi.spyOn(client, "invalidateQueries");
			await userEvent.click(
				screen.getByRole("button", { name: "Publish to Marketplace" }),
			);
			if (versionId === "ver-1")
				await userEvent.click(
					screen.getByRole("radio", { name: /v1.*Published/ }),
				);
			await userEvent.click(
				screen.getByRole("button", { name: "Confirm & Publish" }),
			);
			await waitFor(() =>
				expect(publish).toHaveBeenCalledExactlyOnceWith(mockTemplate.id, {
					version_id: versionId,
					offer_type: "FREE",
				}),
			);
			expect(create).not.toHaveBeenCalled();
			expect(legacyPublish).not.toHaveBeenCalled();
			expect(update).not.toHaveBeenCalled();
			expect(versionPublish).not.toHaveBeenCalled();
			expect(invalidation).toHaveBeenCalledWith({
				queryKey: templateKeys.detail(mockTemplate.id),
			});
			expect(invalidation).toHaveBeenCalledWith({
				queryKey: templateKeys.publicLists(),
			});
			expect(invalidation).toHaveBeenCalledWith({
				queryKey: templateKeys.publicDetail(mockTemplate.id),
			});
		},
	);
	it("pending blocks double submit; errors keep dialog open without fake live state and allow retry", async () => {
		let reject!: (error: Error) => void;
		const publish = vi
			.spyOn(templateApi, "publishToMarketplace")
			.mockImplementationOnce(
				() =>
					new Promise((_, r) => {
						reject = r;
					}),
			)
			.mockRejectedValue(new Error("network"));
		await renderShell();
		await userEvent.click(
			screen.getByRole("button", { name: "Publish to Marketplace" }),
		);
		const button = screen.getByRole("button", { name: "Confirm & Publish" });
		await userEvent.dblClick(button);
		expect(publish).toHaveBeenCalledTimes(1);
		expect(button).toBeDisabled();
		expect(
			screen.getByText("Publishing to Marketplace..."),
		).toBeInTheDocument();
		reject(new Error("network"));
		await screen.findByRole("alert");
		expect(screen.queryByText("Live on Marketplace")).not.toBeInTheDocument();
		await userEvent.click(button);
		await waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
	});
	it("shows Live after backend confirms the selected published version", async () => {
		await renderShell();
		const result = { template: mockTemplate, version: mockVersions[0], listing: { ...mockPublishedListing, published_version_id: "ver-1" } };
		vi.spyOn(templateApi, "publishToMarketplace").mockImplementation(async () => {
			vi.mocked(templateApi.getListing).mockResolvedValue(result.listing);
			return result;
		});
		await userEvent.click(screen.getByRole("button", { name: "Publish to Marketplace" }));
		await userEvent.click(screen.getByRole("radio", { name: /v1.*Published/ }));
		await userEvent.click(screen.getByRole("button", { name: "Confirm & Publish" }));
		await screen.findByText("Live on Marketplace");
		expect(screen.getByText("v1")).toBeInTheDocument();
	});
	it("uses backend's pinned version even when a newer version exists, and links to public detail", async () => {
		await renderShell({ live: true });
		expect(screen.getByText("v1")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "View on Marketplace" }),
		).toHaveAttribute("href", "/templates/tpl-123");
	});
	it("unpublish requires confirmation and returns to Not published", async () => {
		const unpublish = vi
			.spyOn(templateApi, "unpublishListing")
			.mockResolvedValue(mockDraftListing);
		await renderShell({ live: true });
		await userEvent.click(screen.getByRole("button", { name: "Unpublish" }));
		await userEvent.click(
			within(screen.getByRole("alertdialog")).getByRole("button", {
				name: "Cancel",
			}),
		);
		expect(unpublish).not.toHaveBeenCalled();
		vi.mocked(templateApi.getListing).mockResolvedValue(mockDraftListing);
		await userEvent.click(screen.getByRole("button", { name: "Unpublish" }));
		await userEvent.click(
			within(screen.getByRole("alertdialog")).getByRole("button", {
				name: "Unpublish",
			}),
		);
		await screen.findByText("Not published");
		expect(unpublish).toHaveBeenCalledExactlyOnceWith(mockTemplate.id);
	});
	it("403 does not masquerade as a missing listing", async () => {
		vi.spyOn(templateApi, "getListing").mockRejectedValue(
			createAxiosError(403, "Forbidden"),
		);
		const { wrapper } = setup();
		render(
			<TemplateMarketplaceShell
				template={mockTemplate}
				versions={mockVersions}
			/>,
			{ wrapper },
		);
		await screen.findByRole("alert");
		expect(
			screen.queryByRole("button", { name: "Publish to Marketplace" }),
		).not.toBeInTheDocument();
	});
	it("LIST-16: Dashboard Template Detail switches between Preview, Versions, and Marketplace tabs without breaking", async () => {
		mockSearchParams = new URLSearchParams();
		vi.spyOn(templateApi, "getById").mockResolvedValue(mockTemplate);
		vi.spyOn(templateApi, "listVersions").mockResolvedValue(mockVersions);
		vi.spyOn(templateApi, "getPreview").mockResolvedValue({
			template: mockTemplate,
			version: mockVersions[0],
			blocks: [],
			databases: [],
		});
		vi.spyOn(templateApi, "getListing").mockResolvedValue(mockDraftListing);

		const { wrapper } = setup();
		render(<TemplateDetailPage templateId={mockTemplate.id} />, { wrapper });

		// Initial tab is Preview
		expect(
			await screen.findByRole("heading", { name: mockTemplate.name }),
		).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /Preview/i })).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: /Versions/i })).toBeInTheDocument();
		expect(
			screen.getByRole("tab", { name: /Marketplace/i }),
		).toBeInTheDocument();

		// Click Marketplace tab
		await userEvent.click(screen.getByRole("tab", { name: /Marketplace/i }));
		expect(
			await screen.findByRole("heading", { name: "Publish your template" }),
		).toBeInTheDocument();

		// Click Versions tab
		await userEvent.click(screen.getByRole("tab", { name: /Versions/i }));
		expect(
			await screen.findByText(/Manage saved versions of this template/i),
		).toBeInTheDocument();
	});

	it("Not Published state renders two-column layout with preview card and Marketplace Details summary", async () => {
		await renderShell({ missing: true, private: true });
		expect(
			screen.getByRole("heading", { name: "Publish your template" }),
		).toBeInTheDocument();
		expect(
			screen.getByText("Share your template with the Taskmanly community."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Marketplace Details" }),
		).toBeInTheDocument();
		expect(screen.getByText("Not published")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Publish to Marketplace" }),
		).toBeInTheDocument();
	});

	it("Published state renders two-column layout with LIVE badge, View on Marketplace link, and summary", async () => {
		await renderShell({ live: true });
		expect(
			screen.getByRole("heading", { name: "Live on Marketplace" }),
		).toBeInTheDocument();
		expect(screen.getByText("LIVE")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "View on Marketplace" }),
		).toHaveAttribute("href", `/templates/${mockTemplate.id}`);
		expect(
			screen.getByRole("button", { name: "Unpublish" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Marketplace Details" }),
		).toBeInTheDocument();
		expect(screen.getByText("Published")).toBeInTheDocument();
	});

	it("UI-02: Published state eliminates duplicated metadata from Main Card", async () => {
		await renderShell({ live: true });
		// Main card should have the template identification
		expect(screen.getByText(mockTemplate.name)).toBeInTheDocument();
		expect(screen.getByText("Live on Marketplace")).toBeInTheDocument();
		expect(
			screen.getByText("Your template is publicly available on Taskmanly Marketplace."),
		).toBeInTheDocument();
		// Metadata is uniquely present in Marketplace Details summary card, not duplicated in Main Card
		expect(screen.getAllByText("Published Version")).toHaveLength(1);
		expect(screen.getAllByText("Free")).toHaveLength(1);
	});

	it("UI-08: Publish dialog displays become Public notice for PRIVATE templates", async () => {
		await renderShell({ missing: true, private: true });
		await userEvent.click(screen.getByRole("button", { name: "Publish to Marketplace" }));
		expect(screen.getByText("Your template will become Public.")).toBeInTheDocument();
		expect(screen.getByText("Anyone can discover it after publishing.")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
	});

	it("UI-09: Publish dialog displays remain Public notice for PUBLIC templates", async () => {
		await renderShell({ missing: true, private: false });
		await userEvent.click(screen.getByRole("button", { name: "Publish to Marketplace" }));
		expect(screen.getByText("Your template will remain Public.")).toBeInTheDocument();
		expect(screen.queryByText("Anyone can discover it after publishing.")).not.toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
	});

	it("UI-12: Unpublish dialog explains exact consequences and preserves safety", async () => {
		await renderShell({ live: true });
		await userEvent.click(screen.getByRole("button", { name: "Unpublish" }));
		const dialog = screen.getByRole("alertdialog");
		expect(
			within(dialog).getByRole("heading", { name: "Unpublish from Marketplace?" }),
		).toBeInTheDocument();
		expect(
			within(dialog).getByText("Your template will no longer appear in the public Marketplace."),
		).toBeInTheDocument();
		expect(within(dialog).getByText("This action will not:")).toBeInTheDocument();
		expect(
			within(dialog).getByText("Change your template's Public visibility."),
		).toBeInTheDocument();
		expect(within(dialog).getByText("Remove published versions.")).toBeInTheDocument();
		expect(
			within(dialog).getByText("Revoke existing template entitlements."),
		).toBeInTheDocument();
		await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
	});

	it("UI-15: Unpublish failure retains Live status and displays error alert", async () => {
		vi.spyOn(templateApi, "unpublishListing").mockRejectedValue(new Error("Unpublish failed"));
		await renderShell({ live: true });
		await userEvent.click(screen.getByRole("button", { name: "Unpublish" }));
		const dialog = screen.getByRole("alertdialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "Unpublish" }));
		expect(await screen.findByRole("alert")).toBeInTheDocument();
		expect(screen.getByText("Live on Marketplace")).toBeInTheDocument();
	});

	it("shows version change notice when selecting a version different from currently distributed version", async () => {
		const draft = {
			...mockVersions[0],
			id: "ver-2",
			version_number: 2,
			status: "DRAFT" as const,
			published_at: null,
		};
		vi.spyOn(templateApi, "getListing").mockResolvedValue({
			...mockDraftListing,
			published_version_id: "ver-1",
		});
		const { wrapper } = setup();
		render(
			<TemplateMarketplaceShell
				template={mockTemplate}
				versions={[...mockVersions, draft]}
				selectedVersionId="ver-1"
			/>,
			{ wrapper },
		);
		await userEvent.click(
			await screen.findByRole("button", { name: "Publish to Marketplace" }),
		);
		// Currently selected is ver-1, click ver-2
		await userEvent.click(screen.getByRole("radio", { name: /v2.*Draft/ }));
		expect(
			screen.getByText("The Marketplace version will change from v1 to v2."),
		).toBeInTheDocument();
	});
});


