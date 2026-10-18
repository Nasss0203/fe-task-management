"use client";

import { cn } from "@/shared/lib/utils";

import {
	TEMPLATE_ANALYTICS_PERIODS,
	type TemplateAnalyticsPeriod,
} from "../model/template-analytics-period";

/** Segmented 7/30/90 days/All time control; a button group, not tabs (it filters, it has no panels). */
export function TemplateAnalyticsPeriodPicker({
	value,
	onChange,
}: {
	value: TemplateAnalyticsPeriod;
	onChange: (period: TemplateAnalyticsPeriod) => void;
}) {
	return (
		<div
			role='group'
			aria-label='Time period'
			className='inline-flex w-fit rounded-lg bg-muted p-[3px]'
		>
			{TEMPLATE_ANALYTICS_PERIODS.map((item) => (
				<button
					key={item.value}
					type='button'
					aria-pressed={value === item.value}
					onClick={() => onChange(item.value)}
					className={cn(
						"rounded-md px-2.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
						value === item.value && "bg-background text-foreground shadow-sm",
					)}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}
