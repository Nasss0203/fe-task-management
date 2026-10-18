import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { templateApi } from "@/entities/template/api/template.api";
import type {
	PageTemplate,
	TemplateEntitlementDto,
	UseTemplateResponse,
} from "@/entities/template/model/template.types";
import { PublicTemplateDetailPage } from "@/widgets/landing/templates/ui/public-template-detail";
import { UseTemplateDialog } from "@/features/template-use/ui/use-template-dialog";
import { publicTemplate } from "../fixtures/public-template";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => "/templates/free-template",
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
	toast: {
		success: (...args: unknown[]) => mockToastSuccess(...args),
		error: (...args: unknown[]) => mockToastError(...args),
	},
}));

let mockUser: { id: string; lastActiveWorkspaceId?: string } | null = null;
vi.mock("@/features/auth", () => ({
	useUser: () => ({
		user: mockUser,
		isBootstrapped: true,
		isAuthenticated: Boolean(mockUser),
	}),
}));

const mockWorkspaces = [
	{ id: "ws-1", name: "Engineering Team" },
	{ id: "ws-2", name: "Product Marketing" },
];
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: mockWorkspaces }),
}));

const mockEntitlement: TemplateEntitlementDto = {
	id: "ent-123",
	template_id: publicTemplate.id,
	user_id: "user-b",
	source: "FREE_CLAIM",
	created_at: "2026-10-10T12:00:00Z",
};

const mockUseResponse: UseTemplateResponse = {
	pageId: "page-cloned-456",
};

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
	mockPush.mockReset();
	mockToastSuccess.mockReset();
	mockToastError.mockReset();
	mockUser = null;

	vi.spyOn(templateApi, "getPublicById").mockResolvedValue(publicTemplate);
	vi.spyOn(templateApi, "getVersionThumbnail").mockResolvedValue({
		url: "https://example.com/thumbnail.png",
		mimeType: "image/png",
		width: 1440,
		height: 900,
	});
	vi.spyOn(templateApi, "claimFreeTemplate").mockResolvedValue(mockEntitlement);
	vi.spyOn(templateApi, "useTemplate").mockResolvedValue(mockUseResponse);
});

afterEach(() => {
	clients.splice(0).forEach((c) => c.clear());
	vi.restoreAllMocks();
});

describe("Use FREE Template Flow in Marketplace UI & Auto Claim Logic Fix", () => {
	it("UI-01: Guest user sees link to /sign-up and does not trigger Claim or Use", async () => {
		mockUser = null;
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		const useBtn = await screen.findByRole("link", { name: "Use template" });
		expect(useBtn).toHaveAttribute("href", "/sign-up");
		expect(claimSpy).not.toHaveBeenCalled();
		expect(useSpy).not.toHaveBeenCalled();
	});

	it("UI-02: Authenticated user clicks Use Template and opens workspace selection dialog", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		const useBtn = await screen.findByRole("button", { name: "Use template" });
		await userEvent.click(useBtn);

		const dialog = await screen.findByRole("dialog");
		expect(dialog).toBeInTheDocument();
		expect(within(dialog).getByRole("heading", { name: "Use template" })).toBeInTheDocument();
		expect(within(dialog).getByText("Engineering Team")).toBeInTheDocument();
	});

	it("UI-03: Cannot submit when no workspace is selected or available", async () => {
		mockUser = { id: "user-b" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={publicTemplate}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });

		expect(confirmBtn).toBeInTheDocument();
		expect(claimSpy).not.toHaveBeenCalled();
		expect(useSpy).not.toHaveBeenCalled();
	});

	it("FIX-01: Use calls only the Use endpoint; the backend claims FREE templates", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi
			.spyOn(templateApi, "useTemplate")
			.mockResolvedValue(mockUseResponse);

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={publicTemplate}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "Use template" }));

		await waitFor(() =>
			expect(useSpy).toHaveBeenCalledWith(
				publicTemplate.id,
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			),
		);
		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-02: uses template directly without claiming even if PUBLIC and user is not creator", async () => {
		// Public template where user is NOT the creator
		mockUser = { id: "user-different-from-creator", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={publicTemplate}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(useSpy).toHaveBeenCalledWith(
				publicTemplate.id,
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			);
		});

		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-03: the dialog never claims on the client", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={publicTemplate}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(useSpy).toHaveBeenCalledWith(
				publicTemplate.id,
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			);
		});

		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-04: PUBLIC Template without Marketplace Listing does NOT claim", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const publicTemplateWithoutListing: PageTemplate = {
			id: "pub-no-listing",
			source_page_id: null,
			workspace_id: "ws-source",
			name: "Public Non-Marketplace Template",
			description: "Public template without listing",
			icon: null,
			cover_url: null,
			created_by: "another-creator",
			status: "PUBLISHED",
			visibility: "PUBLIC",
			created_at: "2026-10-01T00:00:00Z",
			updated_at: "2026-10-01T00:00:00Z",
		};

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={publicTemplateWithoutListing}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(useSpy).toHaveBeenCalledWith(
				"pub-no-listing",
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			);
		});

		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-05: PRIVATE Template from Dashboard does NOT claim", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const privateTemplate: PageTemplate = {
			id: "private-tpl",
			source_page_id: null,
			workspace_id: "ws-source",
			name: "My Private Template",
			description: "Private template",
			icon: null,
			cover_url: null,
			created_by: "user-b",
			status: "DRAFT",
			visibility: "PRIVATE",
			created_at: "2026-10-01T00:00:00Z",
			updated_at: "2026-10-01T00:00:00Z",
		};

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={privateTemplate}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(useSpy).toHaveBeenCalledWith(
				"private-tpl",
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			);
		});

		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-06: WORKSPACE Template from Dashboard does NOT claim", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi.spyOn(templateApi, "useTemplate");

		const workspaceTemplate: PageTemplate = {
			id: "ws-tpl",
			source_page_id: null,
			workspace_id: "ws-1",
			name: "Workspace Shared Template",
			description: "Shared with team",
			icon: null,
			cover_url: null,
			created_by: "colleague-user",
			status: "PUBLISHED",
			visibility: "WORKSPACE",
			created_at: "2026-10-01T00:00:00Z",
			updated_at: "2026-10-01T00:00:00Z",
		};

		const { wrapper } = setup();
		render(
			<UseTemplateDialog
				template={workspaceTemplate}
				version={publicTemplate.version}
				open={true}
				onOpenChange={vi.fn()}
			/>,
			{ wrapper },
		);

		const dialog = screen.getByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(useSpy).toHaveBeenCalledWith(
				"ws-tpl",
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			);
		});

		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-07: PUBLIC Marketplace FREE flow via PublicTemplateDetailPage uses directly, without a client claim", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const claimSpy = vi.spyOn(templateApi, "claimFreeTemplate");
		const useSpy = vi
			.spyOn(templateApi, "useTemplate")
			.mockResolvedValue(mockUseResponse);

		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		await userEvent.click(await screen.findByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "Use template" }));

		await waitFor(() =>
			expect(useSpy).toHaveBeenCalledWith(
				publicTemplate.id,
				publicTemplate.version.id,
				{ workspace_id: "ws-1" },
			),
		);
		expect(claimSpy).not.toHaveBeenCalled();
	});

	it("FIX-08: Use failure shows the backend reason and does not navigate", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		vi.spyOn(templateApi, "useTemplate").mockRejectedValue({
			response: { status: 403, data: { message: "This template is not available on the marketplace" } },
			isAxiosError: true,
		});

		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		await userEvent.click(await screen.findByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "Use template" }));

		await waitFor(() => {
			expect(within(dialog).getByRole("alert")).toHaveTextContent(
				"This template is not available on the marketplace",
			);
			expect(mockToastError).toHaveBeenCalledWith(
				"This template is not available on the marketplace",
			);
		});
		expect(mockPush).not.toHaveBeenCalled();
	});

	it("FIX-09: Use success navigates to the newly created page with correct pageId", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };
		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		const ctaBtn = await screen.findByRole("button", { name: "Use template" });
		await userEvent.click(ctaBtn);

		const dialog = await screen.findByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });
		await userEvent.click(confirmBtn);

		await waitFor(() => {
			expect(mockToastSuccess).toHaveBeenCalledWith("Template added to workspace.");
			expect(mockPush).toHaveBeenCalledWith(`/page/${mockUseResponse.pageId}`);
		});
	});

	it("FIX-10: Double submission is prevented when confirm button is clicked rapidly", async () => {
		mockUser = { id: "user-b", lastActiveWorkspaceId: "ws-1" };

		let resolveUse!: (val: typeof mockUseResponse) => void;
		const useSpy = vi.spyOn(templateApi, "useTemplate").mockReturnValue(
			new Promise((resolve) => {
				resolveUse = resolve;
			}),
		);

		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		await userEvent.click(await screen.findByRole("button", { name: "Use template" }));
		const dialog = await screen.findByRole("dialog");
		const confirmBtn = within(dialog).getByRole("button", { name: "Use template" });

		await userEvent.click(confirmBtn);
		expect(within(dialog).getByText("Creating page...")).toBeInTheDocument();
		expect(confirmBtn).toBeDisabled();

		await userEvent.click(confirmBtn);
		expect(useSpy).toHaveBeenCalledTimes(1);

		resolveUse(mockUseResponse);
	});

	it("UI-11: Public template preview link is preserved and functioning", async () => {
		mockUser = { id: "user-b" };
		const { wrapper } = setup();
		render(<PublicTemplateDetailPage templateId={publicTemplate.id} />, {
			wrapper,
		});

		const previewLink = await screen.findByRole("link", { name: "Preview" });
		expect(previewLink).toHaveAttribute(
			"href",
			`/templates/${publicTemplate.id}/versions/${publicTemplate.version.id}/preview`,
		);
	});
});
