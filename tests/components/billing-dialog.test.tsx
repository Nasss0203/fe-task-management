import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BillingPlansResponse } from "@/entities/billing/model/billing.types";
import { BillingDialog, useBillingDialog } from "@/features/workspace-billing";

const billingApi = vi.hoisted(() => ({
	getBillingPlans: vi.fn(),
	createBillingCheckout: vi.fn(),
	navigateToBillingCheckout: vi.fn(),
}));
vi.mock("@/entities/billing/api/billing.api", () => billingApi);
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const plans: BillingPlansResponse = {
	items: [
		{
			id: "plan-free",
			code: "FREE",
			name: "Free",
			description: "Starter",
			features: [],
			prices: [],
		},
		{
			id: "plan-plus",
			code: "PLUS",
			name: "Plus",
			description: "Growing teams",
			features: [
				{
					id: "f1",
					featureId: "f1",
					code: "MAX_MEMBERS",
					name: "Members",
					description: "",
					valueType: "NUMBER",
					value: 25,
				},
			],
			prices: [
				{ id: "plus-m-sepay", billingInterval: "MONTHLY", currency: "VND", amount: 99000, provider: "SEPAY" },
				{ id: "plus-y-stripe", billingInterval: "YEARLY", currency: "VND", amount: 990000, provider: "STRIPE" },
			],
		},
	],
};

function renderDialog() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<QueryClientProvider client={client}>
			<BillingDialog
				workspaceId='ws-1'
				workspaceName='Marketing'
				currentPlanCode='FREE'
			/>
		</QueryClientProvider>,
	);
}

beforeEach(() => {
	billingApi.getBillingPlans.mockResolvedValue(plans);
	billingApi.createBillingCheckout.mockResolvedValue({ checkoutUrl: "https://pay" });
	useBillingDialog.setState({ open: false });
});
afterEach(() => vi.clearAllMocks());

describe("BillingDialog", () => {
	it("loads plans only once opened and shows them in the dialog", async () => {
		renderDialog();
		expect(billingApi.getBillingPlans).not.toHaveBeenCalled();

		act(() => useBillingDialog.getState().setOpen(true));

		const dialog = await screen.findByRole("dialog");
		expect(within(dialog).getByText(/Marketing/)).toBeInTheDocument();
		const free = await within(dialog).findByRole("region", { name: "Free" });
		expect(within(free).getByText("Gói hiện tại")).toBeInTheDocument();
		expect(within(dialog).getByText("Tối đa 25 thành viên")).toBeInTheDocument();
	});

	it("checks out the chosen price for this workspace from inside the dialog", async () => {
		const user = userEvent.setup();
		renderDialog();
		act(() => useBillingDialog.getState().setOpen(true));
		const dialog = await screen.findByRole("dialog");

		await user.click(await within(dialog).findByRole("button", { name: /SePay/ }));

		await waitFor(() =>
			expect(billingApi.createBillingCheckout).toHaveBeenCalledWith({
				workspaceId: "ws-1",
				planPriceId: "plus-m-sepay",
			}),
		);
		expect(billingApi.navigateToBillingCheckout).toHaveBeenCalledWith({
			checkoutUrl: "https://pay",
		});
	});

	it("switches the billing interval", async () => {
		const user = userEvent.setup();
		renderDialog();
		act(() => useBillingDialog.getState().setOpen(true));
		const dialog = await screen.findByRole("dialog");

		await within(dialog).findByRole("button", { name: /SePay/ });
		await user.click(within(dialog).getByRole("button", { name: "Theo năm" }));

		expect(within(dialog).getByRole("button", { name: /Stripe test/ })).toBeInTheDocument();
		expect(within(dialog).queryByRole("button", { name: /SePay/ })).not.toBeInTheDocument();
	});

	it("opens from ?upgrade=1 and removes the param", async () => {
		window.history.replaceState(null, "", "/dashboard?upgrade=1&x=2");

		renderDialog();

		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(window.location.search).toBe("?x=2");
		window.history.replaceState(null, "", "/");
	});
});
