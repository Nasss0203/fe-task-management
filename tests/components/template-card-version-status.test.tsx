import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { AuthenticatedTemplateCard } from "@/widgets/dashboard-templates/ui/authenticated-template-card";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

const template: PageTemplate = {
	id: "template-id",
	source_page_id: null,
	workspace_id: "workspace-id",
	name: "Database Snapshot",
	description: null,
	icon: null,
	cover_url: null,
	created_by: "creator-id",
	status: "DRAFT",
	visibility: "PUBLIC",
	created_at: "2026-10-01T00:00:00Z",
	updated_at: "2026-10-01T00:00:00Z",
};

const version: TemplateVersion = {
	id: "version-id",
	template_id: template.id,
	version_number: 1,
	status: "PUBLISHED",
	created_by: template.created_by,
	published_at: "2026-10-01T00:00:00Z",
	created_at: template.created_at,
	updated_at: template.updated_at,
};

describe("Template card version status", () => {
	it.each([
		["PUBLIC", "PUBLISHED", "Public", "Published"],
		["PUBLIC", "DRAFT", "Public", "Draft"],
		["PRIVATE", "DRAFT", "Private", "Draft"],
	] as const)("renders %s / %s independently", (visibility, status, visibilityLabel, statusLabel) => {
		render(<AuthenticatedTemplateCard template={{ ...template, visibility, version: { ...version, status } }} />);
		expect(screen.getByText(visibilityLabel)).toBeInTheDocument();
		expect(screen.getByText(statusLabel)).toBeInTheDocument();
		expect(screen.queryByText(status === "DRAFT" ? "Published" : "Draft")).not.toBeInTheDocument();
	});

	it("represents the latest draft even when the template is published", () => {
		render(<AuthenticatedTemplateCard template={{ ...template, status: "PUBLISHED", version: { ...version, id: "draft-v2", version_number: 2, status: "DRAFT" } }} />);
		expect(screen.getByText("Draft")).toBeInTheDocument();
		expect(screen.getByText("v2")).toBeInTheDocument();
		expect(screen.queryByText("Published")).not.toBeInTheDocument();
	});

	it.each([null, undefined])("does not infer Draft for a missing version (%s)", (missingVersion) => {
		render(<AuthenticatedTemplateCard template={{ ...template, version: missingVersion }} />);
		expect(screen.queryByText("Draft")).not.toBeInTheDocument();
		expect(screen.queryByText("Published")).not.toBeInTheDocument();
		expect(screen.queryByText("v1")).not.toBeInTheDocument();
	});
});
