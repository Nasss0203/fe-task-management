import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PaymentResultPage from "@/app/(dashboard)/billing/payment-result/page";
import { billingKeys } from "@/entities/billing/model/billing.queries";
import {
	PaymentResultDialog,
	useBillingDialog,
} from "@/features/workspace-billing";

const paymentOrderId = "11111111-1111-4111-8111-111111111111";
const workspaceId = "22222222-2222-4222-8222-222222222222";
const postPaymentStatus = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/api-client", () => ({
	default: {
		post: postPaymentStatus,
	},
}));

// Like Next: useSearchParams follows the URL, including history.replaceState.
const urlListeners = vi.hoisted(() => new Set<() => void>());
function subscribeToUrl(listener: () => void) {
	urlListeners.add(listener);
	return () => urlListeners.delete(listener);
}
function setUrl(url: string) {
	window.history.replaceState(null, "", url);
	urlListeners.forEach((listener) => listener());
}
vi.mock("next/navigation", () => ({
	redirect,
	useSearchParams: () =>
		new URLSearchParams(
			useSyncExternalStore(subscribeToUrl, () => window.location.search),
		),
}));
const originalReplaceState = window.history.replaceState.bind(window.history);
window.history.replaceState = (...args: Parameters<History["replaceState"]>) => {
	originalReplaceState(...args);
	urlListeners.forEach((listener) => listener());
};

function paymentOrder(status: string) {
	return {
		data: {
			data: {
				paymentOrderId,
				workspaceId,
				planPriceId: "33333333-3333-4333-8333-333333333333",
				orderCode: "ORDER-PAID-1",
				provider: "SEPAY",
				amount: 99_000,
				currency: "VND",
				status,
				expiresAt: null,
			},
		},
	};
}

function renderDialog() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

	render(
		<QueryClientProvider client={queryClient}>
			<PaymentResultDialog />
		</QueryClientProvider>,
	);

	return { invalidateQueries };
}

describe("PaymentResultDialog", () => {
	beforeEach(() => {
		postPaymentStatus.mockReset();
		useBillingDialog.setState({ open: false });
		window.history.replaceState(
			null,
			"",
			`/dashboard?paymentResult=1&paymentOrderId=${paymentOrderId}&workspaceId=${workspaceId}&status=success&session_id=cs_test&tab=x`,
		);
	});
	afterEach(() => window.history.replaceState(null, "", "/"));

	it("stays closed without the payment result param", () => {
		window.history.replaceState(null, "", "/dashboard");
		renderDialog();

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(postPaymentStatus).not.toHaveBeenCalled();
	});

	it("invalidates the paid workspace subscription after payment succeeds", async () => {
		postPaymentStatus.mockResolvedValue(paymentOrder("PAID"));

		const { invalidateQueries } = renderDialog();

		const dialog = await screen.findByRole("dialog");
		expect(
			await within(dialog).findByText("Thanh toán thành công"),
		).toBeInTheDocument();
		await waitFor(() => {
			expect(invalidateQueries).toHaveBeenCalledWith({
				queryKey: billingKeys.workspaceSubscription(workspaceId),
			});
		});
	});

	it("removes the provider params when closed", async () => {
		postPaymentStatus.mockResolvedValue(paymentOrder("PAID"));
		renderDialog();

		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			await within(dialog).findByRole("button", { name: "Tiếp tục làm việc" }),
		);

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(window.location.search).toBe("?tab=x");
	});

	it("opens when the redirect lands after the layout mounted (no reload)", async () => {
		// /billing/payment-result renders inside the same layout, then redirects.
		window.history.replaceState(null, "", "/billing/payment-result");
		postPaymentStatus.mockResolvedValue(paymentOrder("PAID"));
		renderDialog();
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		act(() =>
			setUrl(
				`/dashboard?paymentResult=1&paymentOrderId=${paymentOrderId}&workspaceId=${workspaceId}&status=success`,
			),
		);

		const dialog = await screen.findByRole("dialog");
		expect(
			await within(dialog).findByText("Thanh toán thành công"),
		).toBeInTheDocument();
	});

	it("does not reopen after closing", async () => {
		postPaymentStatus.mockResolvedValue(paymentOrder("PAID"));
		renderDialog();

		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			await within(dialog).findByRole("button", { name: "Tiếp tục làm việc" }),
		);
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		await new Promise((done) => setTimeout(done, 50));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(postPaymentStatus).toHaveBeenCalledTimes(1);
	});

	it("after a cancelled checkout shows the backend status, not a success", async () => {
		setUrl(
			`/dashboard?paymentResult=1&paymentOrderId=${paymentOrderId}&workspaceId=${workspaceId}&status=cancelled`,
		);
		postPaymentStatus.mockResolvedValue(paymentOrder("PENDING"));
		renderDialog();

		const dialog = await screen.findByRole("dialog");
		expect(
			await within(dialog).findByText(/Bạn đã quay về từ bước thanh toán/),
		).toBeInTheDocument();
		expect(within(dialog).queryByText("Thanh toán thành công")).not.toBeInTheDocument();
	});

	it("reopens the billing dialog to choose a plan again", async () => {
		postPaymentStatus.mockResolvedValue(paymentOrder("FAILED"));
		renderDialog();

		const dialog = await screen.findByRole("dialog");
		await userEvent.click(
			await within(dialog).findByRole("button", {
				name: "Xem lại gói dịch vụ",
			}),
		);

		expect(useBillingDialog.getState().open).toBe(true);
	});
});

describe("PaymentResultPage", () => {
	it("forwards the provider params to the dashboard dialog", async () => {
		await PaymentResultPage({
			searchParams: Promise.resolve({ paymentOrderId, status: "success" }),
		});

		expect(redirect).toHaveBeenCalledWith(
			`/dashboard?paymentOrderId=${paymentOrderId}&status=success&paymentResult=1`,
		);
	});
});
