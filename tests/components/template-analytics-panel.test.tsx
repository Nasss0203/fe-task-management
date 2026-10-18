import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { templateApi } from "@/entities/template/api/template.api";
import type { CreatorTemplateAnalyticsResponse } from "@/entities/template/model/template.types";
import { TemplateAnalyticsPanel } from "@/widgets/creator-templates/ui/analytics/template-analytics-panel";

const response: CreatorTemplateAnalyticsResponse = {
	templateId: "t-1",
	from: "2026-10-17",
	to: "2026-10-18",
	timeZone: "Asia/Ho_Chi_Minh",
	currency: "VND",
	totals: {
		views: 12,
		uniqueViewers: 4,
		guestViews: 5,
		uses: 3,
		paidPurchases: 2,
		grossRevenue: 100000,
	},
	daily: [
		{ date: "2026-10-17", views: 7, uses: 1, paidPurchases: 0, grossRevenue: 0 },
		{ date: "2026-10-18", views: 5, uses: 2, paidPurchases: 2, grossRevenue: 100000 },
	],
	versions: [
		{ versionId: "v-2", versionNumber: 2, uses: 2, paidPurchases: 2, grossRevenue: 100000 },
		{ versionId: "v-1", versionNumber: 1, uses: 1, paidPurchases: 0, grossRevenue: 0 },
	],
};

function renderPanel() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={client}>
			<TemplateAnalyticsPanel templateId='t-1' />
		</QueryClientProvider>,
	);
}

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
	vi.setSystemTime(new Date("2026-10-18T03:00:00.000Z"));
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("TemplateAnalyticsPanel", () => {
	it("shows totals, a version breakdown and a daily table view", async () => {
		const spy = vi
			.spyOn(templateApi, "getAnalytics")
			.mockResolvedValue(response);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderPanel();

		expect(await screen.findByText("4 signed-in · 5 guests")).toBeInTheDocument();
		expect(spy).toHaveBeenCalledWith(
			"t-1",
			{ from: "2026-09-19", to: "2026-10-18" },
			expect.any(AbortSignal),
		);

		const versions = within(
			screen.getByRole("region", { name: "By version" }),
		).getAllByRole("row");
		expect(versions[1]).toHaveTextContent(/v2\s*22100\.000/);
		expect(versions[2]).toHaveTextContent(/v1\s*100/);

		await user.click(screen.getByText("Show as table"));
		const days = within(
			screen.getByRole("region", { name: "Views and uses per day" }),
		).getAllByRole("row");
		// Newest day first.
		expect(days[1]).toHaveTextContent("Oct 18");
		expect(days[2]).toHaveTextContent("Oct 17");
	});

	it("explains an empty version list", async () => {
		vi.spyOn(templateApi, "getAnalytics").mockResolvedValue({
			...response,
			versions: [],
		});

		renderPanel();

		expect(
			await screen.findByText("No published versions yet."),
		).toBeInTheDocument();
	});

	it("loads all-time without bounds", async () => {
		const spy = vi
			.spyOn(templateApi, "getAnalytics")
			.mockResolvedValue(response);
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderPanel();
		await user.click(screen.getByRole("button", { name: "All time" }));

		await waitFor(() =>
			expect(spy).toHaveBeenLastCalledWith(
				"t-1",
				{ from: null, to: "2026-10-18" },
				expect.any(AbortSignal),
			),
		);
	});

	it("offers a retry when loading fails", async () => {
		const spy = vi
			.spyOn(templateApi, "getAnalytics")
			.mockRejectedValue(new Error("network"));
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

		renderPanel();
		// Network errors are retried twice before the error state shows.
		await vi.advanceTimersByTimeAsync(10_000);
		expect(spy).toHaveBeenCalledTimes(3);
		spy.mockResolvedValue(response);
		await user.click(await screen.findByRole("button", { name: "Try again" }));

		expect(await screen.findByText("4 signed-in · 5 guests")).toBeInTheDocument();
	});

	it("tells non-creators analytics are private, without retrying", async () => {
		const spy = vi.spyOn(templateApi, "getAnalytics").mockRejectedValue(
			new AxiosError("Not found", "ERR_BAD_REQUEST", undefined, undefined, {
				status: 404,
				statusText: "Not Found",
				data: {},
				headers: {},
				config: { headers: new AxiosHeaders() },
			}),
		);

		renderPanel();

		expect(
			await screen.findByText(
				"Only the creator of this template can see its analytics.",
			),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
