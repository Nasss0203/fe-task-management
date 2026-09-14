import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceSubscription } from "@/entities/billing/model/billing.types";
import type { Workspace } from "@/entities/workspace/model/workspace.types";
import { SidebarProvider } from "@/widgets/workspace-sidebar/ui/sidebar";
import { TeamSwitcher } from "@/widgets/workspace-sidebar/ui/team-switcher";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/shared/hooks/use-mobile", () => ({
	useIsMobile: () => false,
}));

vi.mock("@/features/workspace-settings", () => ({
	SettingsDialog: () => null,
	useSettingsDialog: (
		selector: (state: { setOpen: (open: boolean) => void }) => unknown,
	) => selector({ setOpen: vi.fn() }),
}));

const workspace: Workspace = {
	id: "workspace-1",
	name: "Product Workspace",
	slug: "product-workspace",
	layoutMode: "default",
	createdAt: "2026-09-12T00:00:00.000Z",
	updatedAt: "2026-09-12T00:00:00.000Z",
	deletedAt: null,
	deletedBy: null,
	createdBy: "user-1",
};

function createSubscription(
	code: "FREE" | "PLUS",
	name: "Free" | "Plus",
): WorkspaceSubscription {
	const isFree = code === "FREE";

	return {
		subscriptionId: isFree ? null : "subscription-1",
		workspaceId: workspace.id,
		plan: {
			id: isFree ? "plan-free" : "plan-plus",
			code,
			name,
		},
		planPriceId: isFree ? null : "price-plus-monthly",
		provider: isFree ? null : "SEPAY",
		status: "ACTIVE",
		currentPeriodStart: null,
		currentPeriodEnd: null,
		cancelAtPeriodEnd: false,
	};
}

function renderTeamSwitcher(subscription: WorkspaceSubscription) {
	return render(
		<SidebarProvider>
			<TeamSwitcher
				workspaces={[workspace]}
				currentWorkspaceId={workspace.id}
				subscription={subscription}
				user={{ email: "owner@example.com" }}
			/>
		</SidebarProvider>,
	);
}

async function openWorkspaceMenu() {
	const user = userEvent.setup();
	await user.click(screen.getByRole("button", { name: /Product Workspace/i }));
}

describe("TeamSwitcher subscription presentation", () => {
	beforeEach(() => {
		routerPush.mockClear();
	});

	it("shows Free Plan and the Upgrade action for the FREE plan", async () => {
		renderTeamSwitcher(createSubscription("FREE", "Free"));

		await openWorkspaceMenu();

		expect(await screen.findByText("Free Plan")).toBeInTheDocument();
		expect(
			screen.getByRole("menuitem", { name: /Upgrade/i }),
		).toBeInTheDocument();
	});

	it("shows Plus Plan and hides the Upgrade action for the PLUS plan", async () => {
		renderTeamSwitcher(createSubscription("PLUS", "Plus"));

		await openWorkspaceMenu();

		expect(await screen.findByText("Plus Plan")).toBeInTheDocument();
		expect(
			screen.queryByRole("menuitem", { name: /Upgrade/i }),
		).not.toBeInTheDocument();
	});
});
