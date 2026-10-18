import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "creator-1", username: "creator" } }),
}));

import { templateApi } from "@/entities/template/api/template.api";
import { getTemplateAnalyticsRange } from "@/entities/template/model/template-analytics-period";
import type { CreatorTemplatesAnalyticsResponse } from "@/entities/template/model/template.types";
import { CreatorPerformance } from "@/widgets/creator-overview/ui/creator-performance";
import type { PageTemplate } from "@/entities/template/model/template.types";
import { CreatorTemplateTable } from "@/widgets/creator-templates";
import { CreatorAnalyticsPage } from "@/widgets/creator-analytics";
import { within } from "@testing-library/react";

const totals = (views: number, revenue: number) => ({
	views,
	uniqueViewers: 1,
	guestViews: 2,
	uses: 3,
	paidPurchases: 1,
	grossRevenue: revenue,
});

const response: CreatorTemplatesAnalyticsResponse = {
	from: "2026-09-19",
	to: "2026-10-18",
	timeZone: "Asia/Ho_Chi_Minh",
	currency: "VND",
	items: [
		{ templateId: "t-1", name: "Planner", totals: totals(10, 50000) },
		{ templateId: "t-2", name: "Roadmap", totals: totals(5, 100000) },
	],
	daily: [
		{ date: "2026-10-18", views: 15, uses: 6, paidPurchases: 2, grossRevenue: 150000 },
	],
};

function renderWithClient(children: ReactNode) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={client}>{children}</QueryClientProvider>,
	);
}

const tileValue = (label: string) =>
	screen.getByText(label).parentElement?.querySelector("dd")?.textContent;

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
	// 18:30 UTC on Oct 18 is already Oct 19 in Vietnam.
	vi.setSystemTime(new Date("2026-10-18T18:30:00.000Z"));
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("getTemplateAnalyticsRange", () => {
	it("ends today in Vietnam time and counts the end day", () => {
		expect(getTemplateAnalyticsRange("7d")).toEqual({
			from: "2026-10-13",
			to: "2026-10-19",
		});
		expect(getTemplateAnalyticsRange("90d").from).toBe("2026-07-22");
		expect(getTemplateAnalyticsRange("all")).toEqual({
			from: null,
			to: "2026-10-19",
		});
	});
});

describe("CreatorPerformance", () => {
	it("sums every template and defaults to 30 days", async () => {
		const spy = vi
			.spyOn(templateApi, "getMyAnalytics")
			.mockResolvedValue(response);

		renderWithClient(<CreatorPerformance />);

		await waitFor(() => expect(tileValue("Views")).toBe("15"));
		expect(tileValue("Uses")).toBe("6");
		expect(tileValue("Purchases")).toBe("2");
		expect(tileValue("Gross revenue")).toMatch(/150\.000/);
		expect(screen.getByText("4 from guests")).toBeInTheDocument();
		expect(spy).toHaveBeenCalledWith(
			{ from: "2026-09-20", to: "2026-10-19" },
			expect.any(AbortSignal),
		);
		// The summary has no period picker; it links to the full page instead.
		expect(screen.queryByRole("group", { name: "Time period" })).toBeNull();
		expect(screen.getByRole("link", { name: /View analytics/ })).toHaveAttribute(
			"href",
			"/creator/analytics",
		);
	});

	it("shows zeros when the creator has no templates", async () => {
		vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue({
			...response,
			items: [],
		});

		renderWithClient(<CreatorPerformance />);

		await waitFor(() => expect(tileValue("Views")).toBe("0"));
		expect(tileValue("Gross revenue")).toMatch(/0/);
	});

	it("offers a retry when loading fails", async () => {
		const spy = vi
			.spyOn(templateApi, "getMyAnalytics")
			.mockRejectedValueOnce(new Error("network"))
			.mockResolvedValue(response);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderWithClient(<CreatorPerformance />);
		await user.click(await screen.findByRole("button", { name: "Try again" }));

		await waitFor(() => expect(tileValue("Views")).toBe("15"));
		expect(spy).toHaveBeenCalledTimes(2);
	});
});

describe("CreatorTemplateTable metrics", () => {
	const template = (id: string, name: string): PageTemplate => ({
		id,
		source_page_id: "page-1",
		workspace_id: "ws-1",
		name,
		description: null,
		icon: null,
		cover_url: null,
		created_by: "creator-1",
		status: "PUBLISHED",
		visibility: "PUBLIC",
		created_at: "2026-10-01T00:00:00.000Z",
		updated_at: "2026-10-05T00:00:00.000Z",
		// A version keeps the Version column from adding its own dash.
		version: {
			id: `${id}-v1`,
			template_id: id,
			version_number: 1,
			status: "PUBLISHED",
			created_by: "creator-1",
			published_at: "2026-10-05T00:00:00.000Z",
			created_at: "2026-10-05T00:00:00.000Z",
			updated_at: "2026-10-05T00:00:00.000Z",
		},
	});

	it("shows all-time views, uses and revenue per row", async () => {
		const spy = vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue({
			...response,
			from: null,
			items: [
				{ templateId: "t-1", name: "Planner", totals: totals(1250, 1250000) },
			],
		});

		renderWithClient(
			<CreatorTemplateTable
				templates={[template("t-1", "Planner"), template("t-3", "Fresh")]}
				isPending={false}
				isError={false}
				onRetry={() => undefined}
				empty={null}
			/>,
		);

		const [planner, fresh] = screen.getAllByRole("listitem");
		await waitFor(() => expect(planner).toHaveTextContent("1.3K"));
		expect(planner).toHaveTextContent("3");
		expect(planner.querySelector("[title*='1.250.000']")).not.toBeNull();
		// A template with no analytics row yet shows a dash, not a fake zero.
		expect(fresh.textContent?.match(/—/g)).toHaveLength(3);
		expect(spy).toHaveBeenCalledWith(
			{ from: null, to: "2026-10-19" },
			expect.any(AbortSignal),
		);
	});
});

describe("CreatorAnalyticsPage", () => {
	it("compares templates, sorted by revenue first", async () => {
		vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue(response);

		renderWithClient(<CreatorAnalyticsPage />);

		const table = within(
			await screen.findByRole("region", { name: "By template" }),
		).getByRole("table");
		const rows = within(table).getAllByRole("row");
		expect(rows[1]).toHaveTextContent("Roadmap");
		expect(rows[2]).toHaveTextContent("Planner");
		expect(
			within(rows[1]).getByRole("link", { name: "Roadmap" }),
		).toHaveAttribute("href", "/creator/templates/t-2?tab=analytics");
		expect(
			within(table).getByRole("columnheader", { name: /Revenue/ }),
		).toHaveAttribute("aria-sort", "descending");
	});

	it("re-sorts when a column header is clicked", async () => {
		vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue(response);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderWithClient(<CreatorAnalyticsPage />);
		const table = within(
			await screen.findByRole("region", { name: "By template" }),
		).getByRole("table");
		await user.click(within(table).getByRole("button", { name: /^Views/ }));

		const rows = within(table).getAllByRole("row");
		expect(rows[1]).toHaveTextContent("Planner");
		expect(
			within(table).getByRole("columnheader", { name: /^Views/ }),
		).toHaveAttribute("aria-sort", "descending");
	});

	it("switches period with the picker", async () => {
		const spy = vi
			.spyOn(templateApi, "getMyAnalytics")
			.mockResolvedValue(response);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderWithClient(<CreatorAnalyticsPage />);
		await user.click(screen.getByRole("button", { name: "All time" }));

		await waitFor(() =>
			expect(spy).toHaveBeenLastCalledWith(
				{ from: null, to: "2026-10-19" },
				expect.any(AbortSignal),
			),
		);
	});

	it("charts the summed daily series", async () => {
		vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue(response);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderWithClient(<CreatorAnalyticsPage />);
		const chart = await screen.findByRole("region", {
			name: "Views and uses per day",
		});
		await user.click(within(chart).getByText("Show as table"));

		expect(within(chart).getAllByRole("row")[1]).toHaveTextContent(
			/Oct 18\s*156/,
		);
	});

	it("pages the comparison table 10 templates at a time", async () => {
		// 23 templates; revenue falls with the index so page order is predictable.
		const items = Array.from({ length: 23 }, (_, i) => ({
			templateId: `t-${i}`,
			name: `Template ${String(i).padStart(2, "0")}`,
			totals: totals(i, (23 - i) * 1000),
		}));
		vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue({
			...response,
			items,
		});
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderWithClient(<CreatorAnalyticsPage />);
		const region = await screen.findByRole("region", { name: "By template" });
		const bodyRows = () =>
			within(within(region).getByRole("table")).getAllByRole("row").slice(1);

		expect(bodyRows()).toHaveLength(10);
		expect(bodyRows()[0]).toHaveTextContent("Template 00");
		expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();

		await user.click(screen.getByRole("button", { name: /Next/ }));
		expect(bodyRows()[0]).toHaveTextContent("Template 10");
		await user.click(screen.getByRole("button", { name: /Next/ }));
		expect(bodyRows()).toHaveLength(3);
		expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();

		// KPIs still cover every template, not just the visible page.
		expect(
			screen.getByText("Views", { selector: "dt" }).parentElement?.querySelector("dd"),
		).toHaveTextContent(String((22 * 23) / 2));

		await user.click(within(region).getByRole("button", { name: /^Views/ }));
		expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
		expect(bodyRows()[0]).toHaveTextContent("Template 22");
	});

	it("explains the empty state", async () => {
		vi.spyOn(templateApi, "getMyAnalytics").mockResolvedValue({
			...response,
			items: [],
		});

		renderWithClient(<CreatorAnalyticsPage />);

		expect(await screen.findByText(/No templates yet/)).toBeInTheDocument();
		expect(
			screen.queryByRole("region", { name: "Views and uses per day" }),
		).toBeNull();
	});
});
