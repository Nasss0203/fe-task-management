import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PaymentResultPage from "@/app/(dashboard)/billing/payment-result/page";
import { billingKeys } from "@/entities/billing/model/billing.queries";

const paymentOrderId = "11111111-1111-4111-8111-111111111111";
const workspaceId = "22222222-2222-4222-8222-222222222222";
const postPaymentStatus = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/api-client", () => ({
	default: {
		post: postPaymentStatus,
	},
}));

vi.mock("next/navigation", () => ({
	useSearchParams: () =>
		new URLSearchParams({
			paymentOrderId,
			workspaceId,
			status: "success",
		}),
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

describe("PaymentResultPage subscription cache", () => {
	beforeEach(() => {
		postPaymentStatus.mockReset();
	});

	it("invalidates the paid workspace subscription after payment succeeds", async () => {
		postPaymentStatus.mockResolvedValue({
			data: {
				data: {
					paymentOrderId,
					workspaceId,
					planPriceId: "33333333-3333-4333-8333-333333333333",
					orderCode: "ORDER-PAID-1",
					provider: "SEPAY",
					amount: 99_000,
					currency: "VND",
					status: "PAID",
					expiresAt: null,
				},
			},
		});

		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
		const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

		render(
			<QueryClientProvider client={queryClient}>
				<PaymentResultPage />
			</QueryClientProvider>,
		);

		await waitFor(() => {
			expect(invalidateQueries).toHaveBeenCalledWith({
				queryKey: billingKeys.workspaceSubscription(workspaceId),
			});
		});
	});
});
