import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { templateApi } from "@/entities/template/api/template.api";
import type {
	PageTemplate,
	TemplateListingDto,
	TemplateVersion,
} from "@/entities/template/model/template.types";
import { CreatorListingEditorPage } from "@/widgets/creator-templates";

const template: PageTemplate = {
	id: "tpl-1",
	source_page_id: null,
	workspace_id: "ws-1",
	name: "Roadmap",
	description: "Plan quarters",
	icon: null,
	cover_url: null,
	created_by: "user-1",
	status: "PUBLISHED",
	visibility: "PUBLIC",
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-01T00:00:00.000Z",
};

const versions: TemplateVersion[] = [2, 1].map((n) => ({
	id: `ver-${n}`,
	template_id: "tpl-1",
	version_number: n,
	status: "PUBLISHED",
	created_by: "user-1",
	published_at: "2026-10-02T00:00:00.000Z",
	created_at: "2026-10-02T00:00:00.000Z",
	updated_at: "2026-10-02T00:00:00.000Z",
}));

const listing: TemplateListingDto = {
	id: "l-1",
	template_id: "tpl-1",
	offer_type: "FREE",
	price_amount: 0,
	currency: "VND",
	preview_mode: "INTERACTIVE",
	demo_version_id: null,
	status: "PUBLISHED",
	published_version_id: "ver-2",
	category_ids: [],
	categories: [],
	created_by: "user-1",
	published_at: "2026-10-02T00:00:00.000Z",
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-02T00:00:00.000Z",
};

function renderEditor() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={client}>
			<CreatorListingEditorPage templateId='tpl-1' />
		</QueryClientProvider>,
	);
}

beforeEach(() => {
	vi.spyOn(templateApi, "getById").mockResolvedValue(template);
	vi.spyOn(templateApi, "listVersions").mockResolvedValue(versions);
	vi.spyOn(templateApi, "getListing").mockResolvedValue(listing);
	vi.spyOn(templateApi, "listPublicCategories").mockResolvedValue([]);
	vi.spyOn(templateApi, "getVersionThumbnail").mockRejectedValue(new Error("none"));
});

afterEach(() => vi.restoreAllMocks());

describe("CreatorListingEditorPage", () => {
	it("saves a paid price through PATCH listing only", async () => {
		const updateListing = vi
			.spyOn(templateApi, "updateListing")
			.mockResolvedValue({ ...listing, offer_type: "PAID", price_amount: 99000 });
		const updateTemplate = vi.spyOn(templateApi, "update");
		const user = userEvent.setup();

		renderEditor();

		await user.click(await screen.findByRole("radio", { name: /Paid/ }));
		await user.click(screen.getByRole("radio", { name: /Screenshot/ }));
		await user.type(screen.getByLabelText("Price"), "99k000");

		expect(screen.getByLabelText("Price")).toHaveValue("99000");
		expect(screen.getByText("You have unsaved changes")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Save changes" }));

		await waitFor(() =>
			expect(updateListing).toHaveBeenCalledWith("tpl-1", {
				offer_type: "PAID",
				price_amount: 99000,
				currency: "VND",
				preview_mode: "IMAGE",
			}),
		);
		expect(updateTemplate).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(screen.queryByText("You have unsaved changes")).not.toBeInTheDocument(),
		);
	});

	it("blocks saving a paid listing without a price", async () => {
		const updateListing = vi.spyOn(templateApi, "updateListing");
		const user = userEvent.setup();

		renderEditor();

		await user.click(await screen.findByRole("radio", { name: /Paid/ }));
		await user.click(screen.getByRole("radio", { name: /Screenshot/ }));
		await user.click(screen.getByRole("button", { name: "Save changes" }));

		expect(
			await screen.findByText("Enter a price greater than 0."),
		).toBeInTheDocument();
		expect(updateListing).not.toHaveBeenCalled();
	});

	it("disables release while there are unsaved changes", async () => {
		const user = userEvent.setup();

		renderEditor();

		const release = await screen.findByRole("button", { name: /Release v2/ });
		expect(release).toBeEnabled();

		await user.type(screen.getByLabelText("Name"), " v2");

		expect(release).toBeDisabled();
		expect(
			screen.getByText("Save your changes before releasing."),
		).toBeInTheDocument();
	});
	it("saves a same-version LIMITED demo and previews it through the backend", async () => {
		const snapshot = {
			template,
			version: versions[0],
			databases: [],
			blocks: [
				{ id: "b-intro", type: "TEXT", parent_block_id: null, order_index: 0, content: { text: "Intro section" } },
				{ id: "b-secret", type: "TEXT", parent_block_id: null, order_index: 1, content: { text: "Paid section" } },
			],
		} as never;
		vi.spyOn(templateApi, "getPreview").mockResolvedValue(snapshot);
		const previewDemo = vi
			.spyOn(templateApi, "previewDemo")
			.mockResolvedValue({
				...(snapshot as object),
				blocks: [(snapshot as { blocks: unknown[] }).blocks[0]],
				demoScope: "LIMITED",
				hiddenContent: { blocks: 1, rows: 0 },
			} as never);
		const updateListing = vi
			.spyOn(templateApi, "updateListing")
			.mockResolvedValue({ ...listing, offer_type: "PAID", price_amount: 99000 });
		const user = userEvent.setup();

		renderEditor();

		await user.click(await screen.findByRole("radio", { name: /Paid/ }));
		await user.type(screen.getByLabelText("Price"), "99000");
		await user.click(screen.getByRole("radio", { name: /Limited preview/ }));
		await user.click(await screen.findByRole("button", { name: /Choose content/ }));
		const editor = await screen.findByRole("dialog");
		// The canvas shows the whole template; clicking a block toggles it.
		const secretBlock = await within(editor).findAllByRole("button", {
			name: /^Show /,
		});
		expect(secretBlock).toHaveLength(2);
		await user.click(within(editor).getByRole("checkbox", { name: /Show Text: Intro section/ }));
		// Ticking in the outline flips the matching canvas block to "shown".
		expect(within(editor).getAllByRole("button", { name: /^Hide / })).toHaveLength(1);
		await user.click(within(editor).getByRole("tab", { name: /Visitor view/ }));

		await waitFor(() =>
			expect(previewDemo).toHaveBeenCalledWith(
				"tpl-1",
				{
					demo_version_id: "ver-2",
					demo_config: {
						schema: 1,
						scope: "LIMITED",
						block_ids: ["b-intro"],
						databases: {},
					},
				},
				expect.anything(),
			),
		);
		expect(await screen.findByText(/1 block · 0 rows hidden/)).toBeInTheDocument();
		await user.click(within(editor).getByRole("button", { name: "Done" }));
		expect(screen.getByText(/1 of 2 blocks/)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Save changes" }));

		await waitFor(() =>
			expect(updateListing).toHaveBeenCalledWith("tpl-1", {
				offer_type: "PAID",
				price_amount: 99000,
				currency: "VND",
				preview_mode: "INTERACTIVE",
				demo_version_id: "ver-2",
				demo_config: {
					schema: 1,
					scope: "LIMITED",
					block_ids: ["b-intro"],
					databases: {},
				},
			}),
		);
	});

	it("blocks saving a LIMITED demo with nothing visible", async () => {
		vi.spyOn(templateApi, "getPreview").mockResolvedValue({
			template,
			version: versions[0],
			blocks: [],
			databases: [],
		} as never);
		const updateListing = vi.spyOn(templateApi, "updateListing");
		const user = userEvent.setup();

		renderEditor();

		await user.click(await screen.findByRole("radio", { name: /Paid/ }));
		await user.type(screen.getByLabelText("Price"), "99000");
		await user.click(screen.getByRole("radio", { name: /Limited preview/ }));
		await user.click(screen.getByRole("button", { name: "Save changes" }));

		expect(
			await screen.findByText("Choose at least one block to show in the demo."),
		).toBeInTheDocument();
		expect(updateListing).not.toHaveBeenCalled();
	});
	it("edits tags and sends them with the release", async () => {
		vi.spyOn(templateApi, "getListing").mockResolvedValue({
			...listing,
			tags: ["crm"],
		});
		const publish = vi
			.spyOn(templateApi, "publishToMarketplace")
			.mockResolvedValue({ template, version: versions[0], listing } as never);
		const user = userEvent.setup();

		renderEditor();

		expect(await screen.findByText("#crm")).toBeInTheDocument();
		const input = screen.getByLabelText("Tags");
		await user.type(input, "x{Enter}");
		expect(
			screen.getByText("Use 2–32 letters, numbers or dashes."),
		).toBeInTheDocument();
		await user.clear(input);
		await user.type(input, " Sales Ops {Enter}crm{Enter}");
		expect(screen.getByText("#sales-ops")).toBeInTheDocument();
		expect(screen.getAllByText("#crm")).toHaveLength(1);
		expect(screen.getByText("Applied when you release")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /Release v2/ }));
		const dialog = await screen.findByRole("alertdialog").catch(() =>
			screen.findByRole("dialog"),
		);
		await user.click(within(dialog).getByRole("button", { name: "Release" }));

		await waitFor(() =>
			expect(publish).toHaveBeenCalledWith(
				"tpl-1",
				expect.objectContaining({
					version_id: "ver-2",
					tags: ["crm", "sales-ops"],
				}),
			),
		);
	});

	describe("releasing the first version", () => {
		const paidSeparateDemo = (demoVersionId: string) => ({
			...listing,
			offer_type: "PAID" as const,
			price_amount: 99000,
			status: "DRAFT" as const,
			published_version_id: null,
			demo_version_id: demoVersionId,
			demo_config: null,
		});

		it("preselects a sellable version instead of the separate demo", async () => {
			vi.spyOn(templateApi, "getListing").mockResolvedValue(paidSeparateDemo("ver-2"));

			renderEditor();

			expect(
				await screen.findByRole("button", { name: /Release v1/ }),
			).toBeEnabled();
		});

		it("explains how to release v1 when it is the only version and the full demo", async () => {
			vi.spyOn(templateApi, "listVersions").mockResolvedValue([versions[1]]);
			vi.spyOn(templateApi, "getListing").mockResolvedValue(paidSeparateDemo("ver-1"));

			renderEditor();

			expect(await screen.findByRole("button", { name: /Release v1/ })).toBeDisabled();
			expect(
				screen.getByText(/v1 is set as your separate demo.*Limited preview/),
			).toBeInTheDocument();
			expect(
				screen.getByText(/This is your only published version/),
			).toBeInTheDocument();
		});

		it("starts a new paid demo as a limited preview of the only version", async () => {
			vi.spyOn(templateApi, "listVersions").mockResolvedValue([versions[1]]);
			vi.spyOn(templateApi, "getListing").mockResolvedValue({
				...listing,
				status: "DRAFT",
				published_version_id: null,
			});
			vi.spyOn(templateApi, "getPreview").mockResolvedValue({
				template,
				version: versions[1],
				blocks: [],
				databases: [],
			} as never);
			const user = userEvent.setup();

			renderEditor();

			await user.click(await screen.findByRole("radio", { name: /Paid/ }));
			expect(screen.getByRole("radio", { name: /Limited preview/ })).toBeChecked();
			expect(screen.getByLabelText("Version to preview")).toHaveTextContent("v1");
		});
	});
	it("toggles blocks by clicking them on the full-template canvas", async () => {
		vi.spyOn(templateApi, "getPreview").mockResolvedValue({
			template,
			version: versions[0],
			databases: [],
			blocks: [
				{ id: "b-1", type: "TEXT", parent_block_id: null, order_index: 0, content: { text: "First" } },
				{ id: "b-2", type: "TEXT", parent_block_id: null, order_index: 1, content: { text: "Second" } },
			],
		} as never);
		const user = userEvent.setup();

		renderEditor();

		await user.click(await screen.findByRole("radio", { name: /Paid/ }));
		await user.click(screen.getByRole("radio", { name: /Limited preview/ }));
		await user.click(await screen.findByRole("button", { name: /Choose content/ }));
		const editor = await screen.findByRole("dialog");

		const [first] = await within(editor).findAllByRole("button", { name: /^Show / });
		await user.click(first);

		expect(within(editor).getByRole("checkbox", { name: /Show Text: First/ })).toBeChecked();
		expect(within(editor).getByRole("checkbox", { name: /Show Text: Second/ })).not.toBeChecked();
		await user.click(within(editor).getByRole("button", { name: /^Hide / }));
		expect(within(editor).getByRole("checkbox", { name: /Show Text: First/ })).not.toBeChecked();
	});
	it("selects and clears all toggleable database columns at once", async () => {
		const prop = (id: string, name: string, type: string) => ({
			id,
			template_database_id: "db-1",
			name,
			type,
			is_default: false,
			is_hideable: true,
			position: "a",
			options: [],
		});
		vi.spyOn(templateApi, "getPreview").mockResolvedValue({
			template,
			version: versions[0],
			blocks: [
				{
					id: "b-db",
					type: "DATABASE_VIEW",
					parent_block_id: null,
					order_index: 0,
					content: {},
					data_config: { database_id: "db-1", view_id: "view-1" },
				},
			],
			databases: [
				{
					id: "db-1",
					version_id: "ver-2",
					name: "Tasks",
					properties: [
						prop("p-title", "Name", "TITLE"),
						prop("p-status", "Status", "STATUS"),
						prop("p-owner", "Assignee", "PERSON"),
					],
					rows: [],
					views: [{ id: "view-1", template_database_id: "db-1", name: "Table", type: "TABLE", position: "a", properties: [] }],
				},
			],
		} as never);
		const user = userEvent.setup();

		renderEditor();

		await user.click(await screen.findByRole("radio", { name: /Paid/ }));
		await user.click(screen.getByRole("radio", { name: /Limited preview/ }));
		await user.click(await screen.findByRole("button", { name: /Choose content/ }));
		const editor = await screen.findByRole("dialog");
		await user.click(await within(editor).findByRole("checkbox", { name: /Show Database: Tasks/ }));

		const status = within(editor).getByRole("button", { name: "Status" });
		expect(status).toHaveAttribute("aria-pressed", "false");

		await user.click(within(editor).getByRole("button", { name: "Select all columns" }));
		expect(status).toHaveAttribute("aria-pressed", "true");
		// Private columns stay off; the title column stays on.
		expect(within(editor).getByRole("button", { name: /Assignee/ })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
		expect(within(editor).getByRole("button", { name: "Name" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);

		await user.click(within(editor).getByRole("button", { name: "Clear columns" }));
		expect(status).toHaveAttribute("aria-pressed", "false");
	});
});
