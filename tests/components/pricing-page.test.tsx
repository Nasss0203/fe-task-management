import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PricingPageContent } from "@/app/(landing)/pricing/ui/pricing-page-content";
import type { BillingPlan } from "@/entities/billing/model/billing.types";

const getBillingPlans = vi.hoisted(() => vi.fn());
const currentUser = vi.hoisted(() => ({ value: null as null | { id: string } }));

vi.mock("@/entities/billing/api/billing.api", async (importOriginal) => ({
	...(await importOriginal<object>()),
	getBillingPlans,
}));
vi.mock("@/features/auth", () => ({ useUser: () => ({ user: currentUser.value }) }));
vi.mock("@/widgets/landing/ui/cta-section", () => ({ CtaSection: () => null }));

const plan = (
	code: string,
	name: string,
	limits: { members: number; teamspaces: number; storageMb: number; publicPage: boolean },
	prices: [number, number] | null,
): BillingPlan => ({
	id: code,
	code,
	name,
	description: `${name} plan from API`,
	features: [
		{ id: `${code}-m`, featureId: "m", code: "MAX_MEMBERS", name: "Members", description: "", valueType: "NUMBER", value: limits.members },
		{ id: `${code}-t`, featureId: "t", code: "MAX_TEAMSPACES", name: "Teamspaces", description: "", valueType: "NUMBER", value: limits.teamspaces },
		{ id: `${code}-s`, featureId: "s", code: "MAX_STORAGE_MB", name: "Storage", description: "", valueType: "NUMBER", value: limits.storageMb },
		{ id: `${code}-p`, featureId: "p", code: "PUBLIC_PAGE", name: "Public page", description: "", valueType: "BOOLEAN", value: limits.publicPage },
		{ id: `${code}-a`, featureId: "a", code: "AI_REQUESTS_MONTHLY", name: "AI requests", description: "", valueType: "NUMBER", value: 500 },
	],
	prices: prices
		? [
				{ id: `${code}-mo`, billingInterval: "MONTHLY", currency: "VND", amount: prices[0], provider: "SEPAY" },
				{ id: `${code}-yr`, billingInterval: "YEARLY", currency: "VND", amount: prices[1], provider: "SEPAY" },
			]
		: [],
});

const apiPlans = [
	plan("FREE", "Starter", { members: 3, teamspaces: 1, storageMb: 500, publicPage: false }, null),
	plan("PLUS", "Growth", { members: 30, teamspaces: 12, storageMb: 20480, publicPage: true }, [120000, 1200000]),
	plan("BUSINESS", "Scale", { members: 200, teamspaces: 80, storageMb: 204800, publicPage: true }, [300000, 3000000]),
];

function renderPage() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<QueryClientProvider client={client}>
			<PricingPageContent />
		</QueryClientProvider>,
	);
}

afterEach(() => {
	vi.clearAllMocks();
	currentUser.value = null;
});

describe("PricingPageContent", () => {
	it("renders plan names, limits and monthly prices from the billing API", async () => {
		getBillingPlans.mockResolvedValue({ items: apiPlans });
		renderPage();

		expect(await screen.findByRole("heading", { name: "Growth" })).toBeInTheDocument();
		expect(screen.getByText("Growth plan from API")).toBeInTheDocument();
		expect(screen.getByText("Up to 30 members")).toBeInTheDocument();
		expect(screen.getByText("12 teamspaces")).toBeInTheDocument();
		expect(screen.getByText("20 GB file storage")).toBeInTheDocument();
		expect(screen.getByText(/120\.000/)).toBeInTheDocument();
		expect(screen.getAllByText("/ month")).toHaveLength(2);
		expect(screen.getByText("forever")).toBeInTheDocument();

		const table = screen.getByRole("table");
		expect(within(table).getByRole("columnheader", { name: "Scale" })).toBeInTheDocument();
		expect(within(table).getByText("200 GB")).toBeInTheDocument();
	});

	it("switches to yearly prices", async () => {
		const user = userEvent.setup();
		getBillingPlans.mockResolvedValue({ items: apiPlans });
		renderPage();

		await screen.findByRole("heading", { name: "Growth" });
		await user.click(screen.getByRole("button", { name: "Yearly Billing" }));

		expect(screen.getByText(/1\.200\.000/)).toBeInTheDocument();
		expect(screen.getAllByText("/ year")).toHaveLength(2);
	});

	it("marks the cheapest paid plan as most popular", async () => {
		getBillingPlans.mockResolvedValue({ items: apiPlans });
		renderPage();

		const growthCard = (await screen.findByRole("heading", { name: "Growth" })).parentElement as HTMLElement;
		expect(within(growthCard).getByText("Most popular")).toBeInTheDocument();
		expect(screen.getAllByText("Most popular")).toHaveLength(1);
	});

	it("does not show AI quotas or removed marketing claims", async () => {
		getBillingPlans.mockResolvedValue({ items: apiPlans });
		const { container } = renderPage();

		await screen.findByRole("heading", { name: "Growth" });
		const text = container.textContent ?? "";
		for (const removed of ["AI request", "per user", "/ user", "14-day", "Save 20%", "SLA", "success manager", "custom subdomain", "Priority"]) {
			expect(text).not.toContain(removed);
		}
	});

	it("falls back to the built-in catalog when the API fails", async () => {
		getBillingPlans.mockRejectedValue(new Error("Network down"));
		renderPage();

		expect(await screen.findByRole("heading", { name: "Plus" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Business" })).toBeInTheDocument();
		expect(screen.getByText("500 MB file storage")).toBeInTheDocument();
	});

	it("sends signed-in users to the billing dialog", async () => {
		currentUser.value = { id: "user-1" };
		getBillingPlans.mockResolvedValue({ items: apiPlans });
		renderPage();

		await screen.findByRole("heading", { name: "Growth" });
		const links = screen.getAllByRole("link", { name: "Go to Billing" });
		expect(links).toHaveLength(3);
		expect(links[0]).toHaveAttribute("href", "/dashboard?upgrade=1");
	});
});
