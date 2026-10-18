import type { TemplateAnalyticsRange } from "./template.types";

export type TemplateAnalyticsPeriod = "7d" | "30d" | "90d" | "all";

export const TEMPLATE_ANALYTICS_PERIODS: {
	value: TemplateAnalyticsPeriod;
	label: string;
	days: number | null;
}[] = [
	{ value: "7d", label: "7 days", days: 7 },
	{ value: "30d", label: "30 days", days: 30 },
	{ value: "90d", label: "90 days", days: 90 },
	{ value: "all", label: "All time", days: null },
];

// Must match the backend's analytics zone so "today" is the same calendar day.
const ANALYTICS_TIME_ZONE = "Asia/Ho_Chi_Minh";
const DAY_MS = 86_400_000;

/** Inclusive range ending today (Vietnam time); "all" leaves `from` empty. */
export function getTemplateAnalyticsRange(
	period: TemplateAnalyticsPeriod,
	now: Date = new Date(),
): TemplateAnalyticsRange {
	// en-CA formats as YYYY-MM-DD.
	const to = new Intl.DateTimeFormat("en-CA", {
		timeZone: ANALYTICS_TIME_ZONE,
	}).format(now);
	const days = TEMPLATE_ANALYTICS_PERIODS.find(
		(item) => item.value === period,
	)?.days;

	if (!days) return { from: null, to };

	const from = new Date(Date.parse(`${to}T00:00:00.000Z`) - (days - 1) * DAY_MS)
		.toISOString()
		.slice(0, 10);

	return { from, to };
}
