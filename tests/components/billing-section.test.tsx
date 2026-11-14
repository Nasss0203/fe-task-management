import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
	WorkspaceEntitlements,
	WorkspaceSubscription,
} from "@/entities/billing/model/billing.types";
import BillingSection from "@/features/workspace-settings/ui/sections/BillingSection";

const billingApi = vi.hoisted(() => ({
	getWorkspaceSubscription: vi.fn(),
	getBillingPlans: vi.fn(),
	getWorkspaceEntitlements: vi.fn(),
	getWorkspacePaymentOrders: vi.fn(),
	cancelWorkspaceSubscription: vi.fn(),
	resumeWorkspaceSubscription: vi.fn(),
}));
const getAccess = vi.hoisted(() => vi.fn());

vi.mock("@/entities/billing/api/billing.api", async (importOriginal) => ({
	...(await importOriginal<object>()),
	...billingApi,
}));
vi.mock("@/entities/workspace/api/workspace.api", async (importOriginal) => {
	const original = await importOriginal<{ workspaceApi: object }>();
	return { ...original, workspaceApi: { ...original.workspaceApi, getAccess } };
});
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const subscription = (
	overrides: Partial<WorkspaceSubscription> = {},
): WorkspaceSubscription => ({
	subscriptionId: "sub-1",
	workspaceId: "ws-1",
	plan: { id: "plan-plus", code: "PLUS", name: "Plus" },
	planPriceId: "price-1",
	provider: "SEPAY",
	status: "ACTIVE",
	currentPeriodStart: "2099-01-01T00:00:00.000Z",
	currentPeriodEnd: "2099-02-01T00:00:00.000Z",
	cancelAtPeriodEnd: false,
	accessEndsAt: "2099-02-04T00:00:00.000Z",
	...overrides,
});

const entitlements: WorkspaceEntitlements = {
	workspaceId: "ws-1",
	plan: { id: "plan-plus", code: "PLUS", name: "Plus" },
	periodStart: null,
	periodEnd: null,
	usagePeriod: { start: "2099-01-01T00:00:00.000Z", end: "2099-02-01T00:00:00.000Z" },
	features: [
		{ code: "MAX_MEMBERS", name: "Members", valueType: "NUMBER", limit: 25, usage: 3 },
		{ code: "MAX_TEAMSPACES", name: "Teamspaces", valueType: "NUMBER", limit: 5, usage: 4 },
		{ code: "MAX_STORAGE_MB", name: "Storage", valueType: "NUMBER", limit: 10240, usage: 1228.8 },
		{ code: "PUBLIC_PAGE", name: "Public page", valueType: "BOOLEAN", limit: true, usage: null },
		{ code: "AI_REQUESTS_MONTHLY", name: "AI requests", valueType: "NUMBER", limit: 500, usage: 0 },
	],
};

function renderSection({
	current = subscription(),
	canManage = true,
}: { current?: WorkspaceSubscription; canManage?: boolean } = {}) {
	billingApi.getWorkspaceSubscription.mockResolvedValue(current);
	billingApi.getBillingPlans.mockResolvedValue({ items: [] });
	billingApi.getWorkspaceEntitlements.mockResolvedValue(entitlements);
	billingApi.getWorkspacePaymentOrders.mockResolvedValue([]);
	getAccess.mockResolvedValue({
		workspace_id: "ws-1",
		membership_type: "MEMBER",
		roles: [],
		permissions: canManage ? ["workspace.read", "workspace.update"] : ["workspace.read"],
	});
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<QueryClientProvider client={client}>
			<BillingSection workspaceId='ws-1' />
		</QueryClientProvider>,
	);
}

afterEach(() => vi.clearAllMocks());

describe("BillingSection", () => {
	it("shows usage against each plan limit and hides AI requests", async () => {
		renderSection();

		expect(await screen.findByText("3 / 25")).toBeInTheDocument();
		expect(screen.getByText("1.2 GB / 10 GB")).toBeInTheDocument();
		expect(screen.getByText("Public pages: Included")).toBeInTheDocument();
		expect(screen.getByRole("progressbar", { name: "Members usage" })).toHaveAttribute(
			"data-level",
			"normal",
		);
		expect(screen.getByRole("progressbar", { name: "Teamspaces usage" })).toHaveAttribute(
			"data-level",
			"warning",
		);
		expect(screen.queryByText(/AI requests/)).not.toBeInTheDocument();
	});

	it("cancels the plan after confirmation", async () => {
		const user = userEvent.setup();
		billingApi.cancelWorkspaceSubscription.mockResolvedValue(
			subscription({ cancelAtPeriodEnd: true }),
		);
		renderSection();

		await user.click(await screen.findByRole("button", { name: "Cancel plan" }));
		const dialog = await screen.findByRole("alertdialog");
		billingApi.getWorkspaceSubscription.mockResolvedValue(
			subscription({ cancelAtPeriodEnd: true }),
		);
		await user.click(within(dialog).getByRole("button", { name: "Cancel plan" }));

		await waitFor(() =>
			expect(billingApi.cancelWorkspaceSubscription).toHaveBeenCalledWith("ws-1"),
		);
		expect(await screen.findByRole("button", { name: "Resume plan" })).toBeInTheDocument();
		expect(screen.getByText(/Plan ends on 1 Feb 2099/)).toBeInTheDocument();
	});

	it("resumes a plan scheduled for cancellation after confirmation", async () => {
		const user = userEvent.setup();
		billingApi.resumeWorkspaceSubscription.mockResolvedValue(subscription());
		renderSection({ current: subscription({ cancelAtPeriodEnd: true }) });

		await user.click(await screen.findByRole("button", { name: "Resume plan" }));
		const dialog = await screen.findByRole("alertdialog");
		await user.click(within(dialog).getByRole("button", { name: "Resume plan" }));

		await waitFor(() =>
			expect(billingApi.resumeWorkspaceSubscription).toHaveBeenCalledWith("ws-1"),
		);
	});

	it("tells the owner when the plan expired and when it moves to Free", async () => {
		renderSection({ current: subscription({ status: "PAST_DUE" }) });

		const alert = await screen.findByText(/Plan expired on 1 Feb 2099/);
		expect(alert).toHaveTextContent("Workspace moves to Free on 4 Feb 2099.");
		expect(screen.getByRole("button", { name: "Renew" })).toBeInTheDocument();
		expect(screen.getByText("Expired on")).toBeInTheDocument();
		expect(screen.queryByText("Renews on")).not.toBeInTheDocument();
	});

	it("hides plan actions and the expiry notice from members without workspace.update", async () => {
		renderSection({ current: subscription({ status: "PAST_DUE" }), canManage: false });

		expect(await screen.findByText("3 / 25")).toBeInTheDocument();
		await waitFor(() => expect(getAccess).toHaveBeenCalledWith("ws-1", expect.anything()));
		expect(screen.getByText("Past due")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Renew" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Cancel plan" })).not.toBeInTheDocument();
	});

	it("offers no cancel on the Free plan", async () => {
		renderSection({
			current: subscription({
				plan: { id: "plan-free", code: "FREE", name: "Free" },
				planPriceId: null,
				provider: null,
			}),
		});

		expect(await screen.findByText("3 / 25")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Cancel plan" })).not.toBeInTheDocument();
	});
});
