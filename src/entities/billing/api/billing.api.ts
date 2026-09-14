import apiClient from "@/shared/api/api-client";

import type {
	BillingApiResponse,
	BillingCheckout,
	BillingPlansResponse,
	CreateBillingCheckoutInput,
	WorkspaceSubscription,
} from "../model/billing.types";

export async function getBillingPlans(): Promise<BillingPlansResponse> {
	const response =
		await apiClient.get<BillingApiResponse<BillingPlansResponse>>(
			"/billing/plans",
		);

	return response.data.data;
}

export async function getWorkspaceSubscription(
	workspaceId: string,
	signal?: AbortSignal,
): Promise<WorkspaceSubscription> {
	const response = await apiClient.get<
		BillingApiResponse<WorkspaceSubscription>
	>(`/billing/workspaces/${workspaceId}/subscription`, { signal });

	return response.data.data;
}

export async function createBillingCheckout(
	input: CreateBillingCheckoutInput,
): Promise<BillingCheckout> {
	const response = await apiClient.post<BillingApiResponse<BillingCheckout>>(
		"/billing/checkout",
		input,
		{
			timeout: 30_000,
		},
	);

	return response.data.data;
}

/**
 * Chỉ cho phép các trang checkout sandbox đang sử dụng.
 * Không thay đổi nội dung checkoutFields đã được backend ký.
 */
export function navigateToBillingCheckout(checkout: BillingCheckout): void {
	const url = new URL(checkout.checkoutUrl);

	const validStripe =
		checkout.provider === "STRIPE" &&
		checkout.checkoutMethod === "GET" &&
		url.hostname === "checkout.stripe.com";

	const validSepay =
		checkout.provider === "SEPAY" &&
		checkout.checkoutMethod === "POST" &&
		url.hostname === "pay-sandbox.sepay.vn";

	if (
		url.protocol !== "https:" ||
		url.username ||
		url.password ||
		url.port ||
		(!validStripe && !validSepay)
	) {
		throw new Error("Địa chỉ checkout không hợp lệ.");
	}

	if (checkout.checkoutMethod === "GET") {
		window.location.assign(checkout.checkoutUrl);
		return;
	}

	const form = document.createElement("form");
	form.method = "POST";
	form.action = checkout.checkoutUrl;
	form.style.display = "none";

	for (const [name, value] of Object.entries(checkout.checkoutFields)) {
		const input = document.createElement("input");

		input.type = "hidden";
		input.name = name;
		input.value = String(value);

		form.appendChild(input);
	}

	document.body.appendChild(form);

	try {
		HTMLFormElement.prototype.submit.call(form);
	} finally {
		form.remove();
	}
}
