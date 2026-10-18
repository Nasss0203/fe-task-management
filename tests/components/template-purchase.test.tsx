import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { templateApi } from "@/entities/template/api/template.api";
import type {
	PublicTemplateListItem,
	TemplatePurchase,
	TemplatePurchaseStatus,
	UsableTemplateVersion,
} from "@/entities/template/model/template.types";
import { CheckoutResultView } from "@/features/template-purchase";
import { savePurchaseIntent } from "@/features/template-purchase/model/purchase-intent";
import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";
import { TemplateDetailActions } from "@/widgets/landing/templates/ui/template-detail-actions";
import CheckoutSuccessPage from "@/app/(landing)/marketplace/checkout/success/page";

import { publicTemplate } from "../fixtures/public-template";

const navigation = vi.hoisted(() => ({ navigateToCheckout: vi.fn() }));
vi.mock(
	"@/features/template-purchase/model/navigate-to-checkout",
	() => navigation,
);
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	usePathname: () => "/templates/public-template",
}));
let mockUser: { id: string; lastActiveWorkspaceId?: string } | null = null;
vi.mock("@/features/auth", () => ({
	useUser: () => ({
		user: mockUser,
		isBootstrapped: true,
		isAuthenticated: Boolean(mockUser),
	}),
}));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaces: () => ({ data: [{ id: "ws-1", name: "Engineering" }] }),
}));

const PURCHASE_ID = "11111111-1111-4111-8111-111111111111";
const paidTemplate: PublicTemplateListItem = {
	...publicTemplate,
	offer_type: "PAID",
	price_amount: 50000,
	currency: "VND",
};

function purchase(
	status: TemplatePurchaseStatus,
	id = PURCHASE_ID,
): TemplatePurchase {
	return {
		id,
		orderCode: "TP00",
		templateId: paidTemplate.id,
		listingId: "listing",
		publishedVersionId: "published-version-2",
		amount: 50000,
		currency: "VND",
		status,
		expiresAt: "2026-10-18T10:00:00.000Z",
		createdAt: "2026-10-18T09:00:00.000Z",
	};
}

function version(
	id: string,
	versionNumber: number,
	isCurrent: boolean,
): UsableTemplateVersion {
	return {
		id,
		version_number: versionNumber,
		status: "PUBLISHED",
		released_at: "2026-10-18T09:00:00.000Z",
		is_current: isCurrent,
	} as UsableTemplateVersion;
}

function apiError(status: number, message: string) {
	return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
		status,
		statusText: "",
		data: { message },
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

let client: QueryClient;
function wrapper({ children }: PropsWithChildren) {
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function renderActions(template: PublicTemplateListItem = paidTemplate) {
	return render(
		<TemplateDetailActions template={template} previewHref={null} />,
		{ wrapper },
	);
}

const buyButton = () =>
	screen.findByRole("button", { name: /Buy template — 50\.000/ });

beforeEach(() => {
	client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});
	mockUser = { id: "buyer", lastActiveWorkspaceId: "ws-1" };
	window.sessionStorage.clear();
	navigation.navigateToCheckout.mockReset();
	vi.spyOn(templateApi, "listUsableVersions").mockRejectedValue(
		apiError(403, "You do not have permission to use this template"),
	);
});

afterEach(() => {
	client.clear();
	vi.restoreAllMocks();
});

describe("template detail purchase actions", () => {
	it("FREE template keeps Use template", async () => {
		renderActions({ ...paidTemplate, offer_type: "FREE", price_amount: 0 });
		expect(
			await screen.findByRole("button", { name: "Use template" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Buy template/)).not.toBeInTheDocument();
	});

	it("signed-out user is sent to sign in and back to this template", async () => {
		mockUser = null;
		renderActions();
		expect(
			await screen.findByRole("link", { name: /Sign in to buy/ }),
		).toHaveAttribute("href", "/sign-in?next=%2Ftemplates%2Fpublic-template");
	});

	it("unpurchased PAID template buys through Stripe with an idempotency key", async () => {
		const create = vi
			.spyOn(templateApi, "createPurchase")
			.mockResolvedValue(purchase("PENDING"));
		const checkout = vi
			.spyOn(templateApi, "createPurchaseCheckout")
			.mockResolvedValue({ checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test", checkoutMethod: "GET" });

		renderActions();
		await userEvent.click(await buyButton());

		await waitFor(() =>
			expect(navigation.navigateToCheckout).toHaveBeenCalledWith(
				"https://checkout.stripe.com/c/pay/cs_test",
			),
		);
		expect(create).toHaveBeenCalledWith(paidTemplate.id, expect.any(String));
		expect(create.mock.calls[0][1]).toMatch(/^[0-9a-f-]{36}$/);
		expect(checkout).toHaveBeenCalledWith(PURCHASE_ID);
		expect(
			screen.getByRole("button", { name: /Redirecting to checkout/ }),
		).toBeDisabled();
		// No "coming soon" placeholder anymore.
		expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
	});

	it("a double click creates one purchase", async () => {
		let resolve!: (value: TemplatePurchase) => void;
		const create = vi
			.spyOn(templateApi, "createPurchase")
			.mockReturnValue(new Promise((done) => (resolve = done)));
		vi.spyOn(templateApi, "createPurchaseCheckout").mockResolvedValue({
			checkoutUrl: "https://checkout.stripe.com/x",
			checkoutMethod: "GET",
		});

		renderActions();
		const button = await buyButton();
		await userEvent.dblClick(button);
		resolve(purchase("PENDING"));

		await waitFor(() => expect(navigation.navigateToCheckout).toHaveBeenCalled());
		expect(create).toHaveBeenCalledTimes(1);
	});

	it("a retry after an unclear failure reuses the same idempotency key", async () => {
		const create = vi
			.spyOn(templateApi, "createPurchase")
			.mockRejectedValueOnce(new Error("Network Error"))
			.mockResolvedValueOnce(purchase("PENDING"));
		vi.spyOn(templateApi, "createPurchaseCheckout").mockResolvedValue({
			checkoutUrl: "https://checkout.stripe.com/x",
			checkoutMethod: "GET",
		});

		renderActions();
		await userEvent.click(await buyButton());
		await screen.findByRole("alert");
		await userEvent.click(await buyButton());

		await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
		expect(create.mock.calls[1][1]).toBe(create.mock.calls[0][1]);
	});

	it("an EXPIRED purchase for the stored key starts a new purchase with a new key", async () => {
		const create = vi
			.spyOn(templateApi, "createPurchase")
			.mockResolvedValueOnce(purchase("EXPIRED", "22222222-2222-4222-8222-222222222222"))
			.mockResolvedValueOnce(purchase("PENDING"));
		const checkout = vi
			.spyOn(templateApi, "createPurchaseCheckout")
			.mockResolvedValue({ checkoutUrl: "https://checkout.stripe.com/x", checkoutMethod: "GET" });

		renderActions();
		await userEvent.click(await buyButton());

		await waitFor(() => expect(checkout).toHaveBeenCalledWith(PURCHASE_ID));
		expect(create.mock.calls[1][1]).not.toBe(create.mock.calls[0][1]);
	});

	it("a purchase under reconciliation never opens a checkout", async () => {
		vi.spyOn(templateApi, "createPurchase").mockResolvedValue(
			purchase("RECONCILIATION_REQUIRED"),
		);
		const checkout = vi.spyOn(templateApi, "createPurchaseCheckout");

		renderActions();
		await userEvent.click(await buyButton());

		expect(await screen.findByRole("alert")).toHaveTextContent(/under review/);
		expect(checkout).not.toHaveBeenCalled();
		expect(navigation.navigateToCheckout).not.toHaveBeenCalled();
	});

	it("shows the backend reason when a new purchase is blocked by reconciliation", async () => {
		vi.spyOn(templateApi, "createPurchase").mockRejectedValue(
			apiError(409, "A previous payment for this template is being reconciled"),
		);

		renderActions();
		await userEvent.click(await buyButton());

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"A previous payment for this template is being reconciled",
		);
	});

	it("owner of the current release (PAID_PURCHASE or creator) sees Use, not Buy", async () => {
		vi.mocked(templateApi.listUsableVersions).mockResolvedValue({
			items: [version("v2", 2, true), version("v1", 1, false)],
		});

		renderActions();
		expect(
			await screen.findByRole("button", { name: "Use template" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Buy template/)).not.toBeInTheDocument();
	});

	it("FREE_CLAIM owner can buy the paid release and still use the free one", async () => {
		vi.mocked(templateApi.listUsableVersions).mockResolvedValue({
			items: [version("v1", 1, false)],
		});

		renderActions();
		expect(await buyButton()).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Use your free version" }),
		).toBeInTheDocument();
	});
});

describe("checkout return page", () => {
	function renderResult(
		outcome: "success" | "cancelled",
		purchaseId: string | null = PURCHASE_ID,
	) {
		return render(
			<CheckoutResultView purchaseId={purchaseId} outcome={outcome} />,
			{ wrapper },
		);
	}

	function storeIntent() {
		savePurchaseIntent({
			userId: "buyer",
			templateId: paidTemplate.id,
			idempotencyKey: "key-1",
			purchaseId: PURCHASE_ID,
			returnPath: "/dashboard/templates/public-template",
		});
	}

	it("success route renders the result view (no 404)", async () => {
		const element = await CheckoutSuccessPage({
			searchParams: Promise.resolve({ purchaseId: PURCHASE_ID, status: "success" }),
		});
		expect(element.props).toMatchObject({ purchaseId: PURCHASE_ID, outcome: "success" });
	});

	it("waits while the backend still reports PENDING", async () => {
		storeIntent();
		const create = vi
			.spyOn(templateApi, "createPurchase")
			.mockResolvedValue(purchase("PENDING"));

		renderResult("success");

		expect(
			await screen.findByRole("heading", { name: "Your payment is being confirmed" }),
		).toBeInTheDocument();
		// Status comes from the original idempotent create, never a new purchase.
		expect(create).toHaveBeenCalledWith(paidTemplate.id, "key-1");
		expect(screen.queryByText("Payment successful")).not.toBeInTheDocument();
	});

	it("shows success only once the backend says PAID, then refreshes access", async () => {
		storeIntent();
		vi.spyOn(templateApi, "createPurchase").mockResolvedValue(purchase("PAID"));
		const invalidate = vi.spyOn(client, "invalidateQueries");

		renderResult("success");

		expect(
			await screen.findByRole("heading", { name: "Payment successful" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Use template" })).toHaveAttribute(
			"href",
			"/dashboard/templates/public-template",
		);
		await waitFor(() =>
			expect(invalidate).toHaveBeenCalledWith({
				queryKey: ["templates", "usable-versions", paidTemplate.id, "buyer"],
			}),
		);
	});

	it.each([
		["EXPIRED", "Checkout session expired"],
		["RECONCILIATION_REQUIRED", "Your payment is under review"],
		["REFUNDED", "Payment refunded"],
		["FAILED", "Payment failed"],
	] as const)("%s shows its own state", async (status, heading) => {
		storeIntent();
		vi.spyOn(templateApi, "createPurchase").mockResolvedValue(purchase(status));

		renderResult("success");

		expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
	});

	it("a cancelled checkout with a still-pending purchase says cancelled, not paid", async () => {
		storeIntent();
		vi.spyOn(templateApi, "createPurchase").mockResolvedValue(purchase("PENDING"));

		renderResult("cancelled");

		expect(
			await screen.findByRole("heading", { name: "Payment cancelled" }),
		).toBeInTheDocument();
	});

	it("never trusts the redirect when this browser has no purchase record", async () => {
		const create = vi.spyOn(templateApi, "createPurchase");

		renderResult("success");

		expect(
			await screen.findByRole("heading", { name: "We can't check this payment here" }),
		).toBeInTheDocument();
		expect(create).not.toHaveBeenCalled();
	});

	it("rejects a malformed purchase id", async () => {
		renderResult("success", "not-a-uuid");
		expect(
			await screen.findByRole("heading", { name: "Payment link not recognised" }),
		).toBeInTheDocument();
	});

	it("does not read another user's purchase intent", async () => {
		storeIntent();
		mockUser = { id: "someone-else" };
		const create = vi.spyOn(templateApi, "createPurchase");

		renderResult("success");

		expect(
			await screen.findByRole("heading", { name: "We can't check this payment here" }),
		).toBeInTheDocument();
		expect(create).not.toHaveBeenCalled();
	});
});

describe("getSafeRedirectPath", () => {
	it.each([
		["/templates/x?a=1", "/templates/x?a=1"],
		["https://evil.example", "/"],
		["//evil.example", "/"],
		["/\\evil.example", "/"],
		["javascript:alert(1)", "/"],
		[null, "/"],
	])("%s -> %s", (input, expected) => {
		expect(getSafeRedirectPath(input)).toBe(expected);
	});
});
