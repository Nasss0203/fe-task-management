import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { templateApi } from "@/entities/template/api/template.api";
import type {
	PageTemplate,
	TemplateListingDto,
	TemplateVersion,
} from "@/entities/template/model/template.types";
import {
	CreatorTemplatesPage,
	CreatorTemplateTable,
} from "@/widgets/creator-templates";
import { TemplateMarketplaceSummary } from "@/widgets/creator-templates/ui/template-marketplace-summary";
import { getTemplateDisplayStatus } from "@/widgets/creator-templates/ui/template-meta";

const template: PageTemplate = {
	id: "tpl-1",
	source_page_id: "page-1",
	workspace_id: "ws-1",
	name: "Roadmap",
	description: "Plan quarters",
	icon: null,
	cover_url: null,
	created_by: "user-1",
	status: "PUBLISHED",
	visibility: "PUBLIC",
	created_at: "2026-10-01T00:00:00.000Z",
	updated_at: "2026-10-05T00:00:00.000Z",
};

const version: TemplateVersion = {
	id: "ver-2",
	template_id: "tpl-1",
	version_number: 2,
	status: "PUBLISHED",
	created_by: "user-1",
	published_at: "2026-10-05T00:00:00.000Z",
	created_at: "2026-10-05T00:00:00.000Z",
	updated_at: "2026-10-05T00:00:00.000Z",
};

const listing: TemplateListingDto = {
	id: "listing-1",
	template_id: "tpl-1",
	offer_type: "FREE",
	status: "PUBLISHED",
	published_version_id: "ver-2",
	created_by: "user-1",
	published_at: "2026-10-06T00:00:00.000Z",
	created_at: "2026-10-05T00:00:00.000Z",
	updated_at: "2026-10-06T00:00:00.000Z",
};

function withQueryClient(children: ReactNode) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

afterEach(() => vi.restoreAllMocks());

describe("CreatorTemplateTable", () => {
	it("links each row to the Creator Studio management page", () => {
		render(
			withQueryClient(
				<CreatorTemplateTable
					templates={[{ ...template, version }]}
					isPending={false}
					isError={false}
					onRetry={vi.fn()}
					empty={null}
				/>,
			),
		);

		expect(screen.getByRole("link", { name: /Roadmap/ })).toHaveAttribute(
			"href",
			"/creator/templates/tpl-1",
		);
	});
});

describe("template status", () => {
	it("follows the newest version, since template.status stays DRAFT", () => {
		render(
			withQueryClient(
				<CreatorTemplateTable
					templates={[
						{ ...template, status: "DRAFT", version },
						{
							...template,
							id: "tpl-2",
							name: "Draft only",
							status: "DRAFT",
							version: { ...version, status: "DRAFT" },
						},
					]}
					isPending={false}
					isError={false}
					onRetry={vi.fn()}
					empty={null}
				/>,
			),
		);

		const [published, draft] = screen.getAllByRole("link");
		expect(within(published).getByText("Published")).toBeInTheDocument();
		expect(within(draft).getByText("Draft")).toBeInTheDocument();
	});

	it("keeps Archived regardless of versions", () => {
		expect(getTemplateDisplayStatus("ARCHIVED", true)).toBe("ARCHIVED");
		expect(getTemplateDisplayStatus("DRAFT", true)).toBe("PUBLISHED");
		expect(getTemplateDisplayStatus("DRAFT", false)).toBe("DRAFT");
	});
});

describe("TemplateMarketplaceSummary", () => {
	it("shows a live listing with its released version and public link", async () => {
		vi.spyOn(templateApi, "getListing").mockResolvedValue(listing);

		render(
			withQueryClient(
				<TemplateMarketplaceSummary template={template} versions={[version]} />,
			),
		);

		expect(await screen.findByText("Live")).toBeInTheDocument();
		expect(screen.getByText("v2")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /View public page/ }),
		).toHaveAttribute("href", "/templates/tpl-1");
	});

	it("treats a 404 listing as not listed, without a public link", async () => {
		vi.spyOn(templateApi, "getListing").mockRejectedValue(
			new AxiosError("Not found", "404", undefined, undefined, {
				status: 404,
				statusText: "Not Found",
				headers: {},
				config: { headers: new AxiosHeaders() },
				data: {},
			}),
		);

		render(
			withQueryClient(
				<TemplateMarketplaceSummary template={template} versions={[version]} />,
			),
		);

		expect(await screen.findByText("Not listed")).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: /View public page/ }),
		).not.toBeInTheDocument();
	});
});

describe("Creator template row actions", () => {
	function renderRow(row: PageTemplate) {
		return render(
			withQueryClient(
				<CreatorTemplateTable
					templates={[row]}
					isPending={false}
					isError={false}
					onRetry={vi.fn()}
					empty={null}
				/>,
			),
		);
	}

	it("changes visibility from the row without opening the template", async () => {
		const update = vi
			.spyOn(templateApi, "update")
			.mockResolvedValue({ ...template, visibility: "PRIVATE" });
		renderRow({ ...template, version });

		await userEvent.click(
			screen.getByRole("button", { name: "Actions for Roadmap" }),
		);
		expect(
			screen.getByRole("menuitemradio", { name: "Public" }),
		).toHaveAttribute("aria-checked", "true");
		await userEvent.click(screen.getByRole("menuitemradio", { name: "Private" }));

		await waitFor(() =>
			expect(update).toHaveBeenCalledWith("tpl-1", { visibility: "PRIVATE" }),
		);
	});

	it("offers Restore instead of visibility for archived templates", async () => {
		const restore = vi
			.spyOn(templateApi, "restore")
			.mockResolvedValue({ ...template, status: "DRAFT" });
		renderRow({ ...template, status: "ARCHIVED" });

		await userEvent.click(
			screen.getByRole("button", { name: "Actions for Roadmap" }),
		);
		expect(screen.queryByRole("menuitemradio")).not.toBeInTheDocument();
		await userEvent.click(screen.getByRole("menuitem", { name: "Restore" }));

		await waitFor(() => expect(restore).toHaveBeenCalledWith("tpl-1"));
	});

	it("asks for confirmation before archiving", async () => {
		const archive = vi.spyOn(templateApi, "archive");
		renderRow({ ...template, version });

		await userEvent.click(
			screen.getByRole("button", { name: "Actions for Roadmap" }),
		);
		await userEvent.click(screen.getByRole("menuitem", { name: "Archive" }));

		expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
		expect(archive).not.toHaveBeenCalled();
	});
});

describe("Creator templates pagination", () => {
	const pageOf = (from: number, count: number) =>
		Array.from({ length: count }, (_, index) => ({
			...template,
			id: `tpl-${from + index}`,
			name: `Template ${from + index}`,
			version: null,
		}));

	it("shows 10 templates per page with Previous and Next", async () => {
		const list = vi
			.spyOn(templateApi, "list")
			.mockResolvedValueOnce({ items: pageOf(1, 10), nextCursor: "cursor-2" })
			.mockResolvedValueOnce({ items: pageOf(11, 2), nextCursor: null });
		render(withQueryClient(<CreatorTemplatesPage />));

		await screen.findByText("Template 1");
		expect(screen.getAllByRole("listitem")).toHaveLength(10);
		expect(list).toHaveBeenCalledWith(
			expect.objectContaining({ scope: "mine", limit: 10 }),
			expect.any(AbortSignal),
		);
		expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();

		await userEvent.click(screen.getByRole("button", { name: /Next/ }));
		await screen.findByText("Template 11");
		expect(screen.queryByText("Template 1")).not.toBeInTheDocument();
		expect(screen.getByText("Page 2")).toBeInTheDocument();
		expect(list).toHaveBeenLastCalledWith(
			expect.objectContaining({ cursor: "cursor-2", limit: 10 }),
			expect.any(AbortSignal),
		);
		expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();

		await userEvent.click(screen.getByRole("button", { name: /Previous/ }));
		await screen.findByText("Template 1");
		expect(list).toHaveBeenCalledTimes(2);
	});

	it("hides pagination when everything fits on one page", async () => {
		vi.spyOn(templateApi, "list").mockResolvedValue({
			items: pageOf(1, 3),
			nextCursor: null,
		});
		render(withQueryClient(<CreatorTemplatesPage />));

		await screen.findByText("Template 1");
		expect(
			screen.queryByRole("navigation", { name: "Templates pagination" }),
		).not.toBeInTheDocument();
	});
});
