import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { templateApi } from "@/entities/template/api/template.api";
import type {
	PageTemplate,
	TemplateListingDto,
	TemplateVersion,
} from "@/entities/template/model/template.types";
import { CreatorTemplateTable } from "@/widgets/creator-templates";
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
			<CreatorTemplateTable
				templates={[{ ...template, version }]}
				isPending={false}
				isError={false}
				onRetry={vi.fn()}
				empty={null}
			/>,
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
