import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, cleanup, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { TemplateDetailHeader } from "@/widgets/dashboard-templates/detail/ui/template-detail-header";
import { TemplateManagementSidebar } from "@/widgets/dashboard-templates/detail/ui/template-management-sidebar";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "user-creator", username: "creator_user" } }),
}));
vi.mock("@/entities/page/model/page.queries", () => ({
	usePage: () => ({ data: { title: "Source Page Title" } }),
}));

afterEach(cleanup);

const baseTemplate: PageTemplate = {
	id: "tpl-101",
	source_page_id: "page-101",
	workspace_id: "ws-101",
	name: "Engineering Roadmap",
	description: "Production roadmap template",
	icon: "🚀",
	cover_url: null,
	created_by: "user-creator",
	status: "DRAFT",
	visibility: "PUBLIC",
	created_at: "2026-10-01T00:00:00Z",
	updated_at: "2026-10-05T00:00:00Z",
};

const version1: TemplateVersion = {
	id: "ver-1",
	template_id: baseTemplate.id,
	version_number: 1,
	status: "PUBLISHED",
	created_by: baseTemplate.created_by,
	published_at: "2026-10-02T00:00:00Z",
	created_at: "2026-10-01T00:00:00Z",
	updated_at: "2026-10-02T00:00:00Z",
};

const version1Draft: TemplateVersion = {
	...version1,
	status: "DRAFT",
	published_at: null,
};

const version2Draft: TemplateVersion = {
	id: "ver-2",
	template_id: baseTemplate.id,
	version_number: 2,
	status: "DRAFT",
	created_by: baseTemplate.created_by,
	published_at: null,
	created_at: "2026-10-06T00:00:00Z",
	updated_at: "2026-10-06T00:00:00Z",
};

const createQueryClient = () =>
	new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});

function renderWithClient(ui: React.ReactElement) {
	const queryClient = createQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
	);
}

describe("Template Detail Status & Lifecycle Presentation", () => {
	describe("Header Status Presentation", () => {
		it("ST-01: PageTemplate DRAFT + v1 DRAFT -> Header displays v1 Draft", () => {
			render(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={version1Draft}
				/>,
			);

			expect(screen.getByText("v1 Draft")).toBeInTheDocument();
			expect(screen.getByText("Public")).toBeInTheDocument();
			// PageTemplate status DRAFT should NOT be rendered as a standalone Draft badge
			expect(screen.queryByText(/^Draft$/)).not.toBeInTheDocument();
		});

		it("ST-02: PageTemplate DRAFT + v1 PUBLISHED -> Header displays v1 Published without misleading Draft badge", () => {
			render(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={version1}
				/>,
			);

			expect(screen.getByText("v1 Published")).toBeInTheDocument();
			expect(screen.getByText("Public")).toBeInTheDocument();
			// Must NOT render Draft badge even though template.status is DRAFT
			expect(screen.queryByText("Draft")).not.toBeInTheDocument();
			expect(screen.queryByText("v1 Draft")).not.toBeInTheDocument();
		});

		it("ST-04: Select v2 DRAFT -> Header displays v2 Draft", () => {
			render(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={version2Draft}
				/>,
			);

			expect(screen.getByText("v2 Draft")).toBeInTheDocument();
			expect(screen.queryByText("v1 Published")).not.toBeInTheDocument();
		});

		it("ST-05: Switch to v1 PUBLISHED -> Header displays v1 Published", () => {
			const { rerender } = render(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={version2Draft}
				/>,
			);

			expect(screen.getByText("v2 Draft")).toBeInTheDocument();

			rerender(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={version1}
				/>,
			);

			expect(screen.getByText("v1 Published")).toBeInTheDocument();
			expect(screen.queryByText("v2 Draft")).not.toBeInTheDocument();
		});

		it("ST-06: Template ARCHIVED -> Header displays Archived badge and hides version draft/published badge", () => {
			const archivedTemplate: PageTemplate = {
				...baseTemplate,
				status: "ARCHIVED",
			};

			render(
				<TemplateDetailHeader
					template={archivedTemplate}
					selectedVersion={version1}
				/>,
			);

			expect(screen.getByText("Archived")).toBeInTheDocument();
			expect(screen.getByText("Public")).toBeInTheDocument();
			expect(screen.queryByText("v1 Published")).not.toBeInTheDocument();
			expect(screen.queryByText("Draft")).not.toBeInTheDocument();
		});

		it.each([
			["PRIVATE", "Private"],
			["WORKSPACE", "Workspace"],
			["PUBLIC", "Public"],
		] as const)(
			"ST-07/08/09: Template visibility %s -> Visibility badge renders %s independently",
			(visibility, expectedLabel) => {
				render(
					<TemplateDetailHeader
						template={{ ...baseTemplate, visibility }}
						selectedVersion={version1}
					/>,
				);

				expect(screen.getByText(expectedLabel)).toBeInTheDocument();
				expect(screen.getByText("v1 Published")).toBeInTheDocument();
			},
		);

		it("ST-10: Template without version (loading or none) -> Does not show fake Published badge", () => {
			render(
				<TemplateDetailHeader
					template={{ ...baseTemplate, version: null }}
					selectedVersion={null}
				/>,
			);

			expect(screen.getByText("Public")).toBeInTheDocument();
			expect(screen.queryByText(/Published/i)).not.toBeInTheDocument();
			expect(screen.queryByText(/Draft/i)).not.toBeInTheDocument();
		});
	});

	describe("Sidebar Status Presentation", () => {
		const noop = () => {};

		it("ST-03: PageTemplate DRAFT + v1 PUBLISHED -> Sidebar removes misleading Status: Draft row and shows Selected version: v1 · Published", () => {
			renderWithClient(
				<TemplateManagementSidebar
					template={baseTemplate}
					versions={[version1]}
					selectedVersionId={version1.id}
					onSelectVersion={noop}
					onOpenPublish={noop}
					onOpenUse={noop}
					onOpenEdit={noop}
					onOpenArchive={noop}
				/>,
			);

			// Must NOT have a definition term "Status" with value "Draft"
			expect(screen.queryByText("Status")).not.toBeInTheDocument();
			expect(screen.queryByText(/^Draft$/)).not.toBeInTheDocument();

			// Must show Selected version definition
			expect(screen.getByText("Selected version")).toBeInTheDocument();
			const versionRow = screen.getByText("Selected version").closest("div")!;
			expect(within(versionRow).getByText("v1")).toBeInTheDocument();
			expect(within(versionRow).getByText("Published")).toBeInTheDocument();
			expect(screen.getByText("Public")).toBeInTheDocument();
		});

		it("ST-04 & ST-05: Sidebar updates when switching between v2 DRAFT and v1 PUBLISHED", () => {
			const { rerender } = renderWithClient(
				<TemplateManagementSidebar
					template={baseTemplate}
					versions={[version2Draft, version1]}
					selectedVersionId={version2Draft.id}
					onSelectVersion={noop}
					onOpenPublish={noop}
					onOpenUse={noop}
					onOpenEdit={noop}
					onOpenArchive={noop}
				/>,
			);

			expect(screen.getByText("Selected version")).toBeInTheDocument();
			const rowV2 = screen.getByText("Selected version").closest("div")!;
			expect(within(rowV2).getByText("v2")).toBeInTheDocument();
			expect(within(rowV2).getByText("Draft")).toBeInTheDocument();
			expect(within(rowV2).queryByText("Published")).not.toBeInTheDocument();

			rerender(
				<QueryClientProvider client={createQueryClient()}>
					<TemplateManagementSidebar
						template={baseTemplate}
						versions={[version2Draft, version1]}
						selectedVersionId={version1.id}
						onSelectVersion={noop}
						onOpenPublish={noop}
						onOpenUse={noop}
						onOpenEdit={noop}
						onOpenArchive={noop}
					/>
				</QueryClientProvider>,
			);

			const rowV1 = screen.getByText("Selected version").closest("div")!;
			expect(within(rowV1).getByText("v1")).toBeInTheDocument();
			expect(within(rowV1).getByText("Published")).toBeInTheDocument();
			expect(within(rowV1).queryByText("Draft")).not.toBeInTheDocument();
		});

		it("ST-06: Archived Template in Sidebar -> Displays Lifecycle: Archived", () => {
			const archivedTemplate: PageTemplate = {
				...baseTemplate,
				status: "ARCHIVED",
			};

			renderWithClient(
				<TemplateManagementSidebar
					template={archivedTemplate}
					versions={[version1]}
					selectedVersionId={version1.id}
					onSelectVersion={noop}
					onOpenPublish={noop}
					onOpenUse={noop}
					onOpenEdit={noop}
					onOpenArchive={noop}
				/>,
			);

			expect(screen.getByText("Lifecycle")).toBeInTheDocument();
			expect(screen.getByText("Archived")).toBeInTheDocument();
			expect(screen.getByText("Public")).toBeInTheDocument();
			// Should still show selected version info
			expect(screen.getByText("Selected version")).toBeInTheDocument();
			const versionRow = screen.getByText("Selected version").closest("div")!;
			expect(within(versionRow).getByText("v1")).toBeInTheDocument();
		});

		it("ST-10: Template with no versions in Sidebar -> Shows None for Selected version without crashing", () => {
			renderWithClient(
				<TemplateManagementSidebar
					template={baseTemplate}
					versions={[]}
					onSelectVersion={noop}
					onOpenPublish={noop}
					onOpenUse={noop}
					onOpenEdit={noop}
					onOpenArchive={noop}
				/>,
			);

			expect(screen.getByText("Selected version")).toBeInTheDocument();
			expect(screen.getByText("None")).toBeInTheDocument();
			expect(screen.queryByText("Published")).not.toBeInTheDocument();
			expect(screen.queryByText("Draft")).not.toBeInTheDocument();
		});

		it("ST-13: Publish Version -> Header transitions from v2 Draft to v2 Published after publication", () => {
			const { rerender } = render(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={version2Draft}
				/>,
			);
			expect(screen.getByText("v2 Draft")).toBeInTheDocument();

			const publishedV2: TemplateVersion = {
				...version2Draft,
				status: "PUBLISHED",
				published_at: "2026-10-07T00:00:00Z",
			};

			rerender(
				<TemplateDetailHeader
					template={baseTemplate}
					selectedVersion={publishedV2}
				/>,
			);
			expect(screen.getByText("v2 Published")).toBeInTheDocument();
			expect(screen.queryByText("v2 Draft")).not.toBeInTheDocument();
		});
	});
});
