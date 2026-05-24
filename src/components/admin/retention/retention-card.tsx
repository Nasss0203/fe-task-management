"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Separator } from "@/components/ui/separator";
import type { RetentionMetricItem } from "@/services/admin/dashboard/type";

type Props = {
	items: RetentionMetricItem[];
};

const getBadgeClassName = (level: RetentionMetricItem["level"]) => {
	if (level === "success") {
		return "border-green-500/40 text-green-400";
	}

	if (level === "warning") {
		return "border-yellow-500/40 text-yellow-400";
	}

	return "border-red-500/40 text-red-400";
};

const getBadgeLabel = (level: RetentionMetricItem["level"]) => {
	if (level === "success") return "Healthy";
	if (level === "warning") return "Watch";
	return "Risk";
};

export function RetentionCard({ items }: Props) {
	const overallLevel = items.some((item) => item.level === "danger")
		? "danger"
		: items.some((item) => item.level === "warning")
			? "warning"
			: "success";

	return (
		<Card className='rounded-2xl border border-neutral-800 bg-neutral-950/80 text-white'>
			<CardHeader>
				<div className='flex items-start justify-between gap-4'>
					<div>
						<CardTitle className='text-lg font-semibold text-white'>
							Retention & Churn
						</CardTitle>
						<CardDescription className='text-sm text-neutral-400'>
							Key business health metrics for billing and usage.
						</CardDescription>
					</div>

					<Badge
						variant='outline'
						className={getBadgeClassName(overallLevel)}
					>
						{getBadgeLabel(overallLevel)}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-6'>
				{items.length === 0 ? (
					<div className='flex h-[180px] items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
						No retention data
					</div>
				) : (
					items.map((item, index) => (
						<div key={item.key} className='space-y-4'>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm font-medium text-neutral-300'>
										{item.label}
									</span>

									<span className='text-xl font-semibold text-white'>
										{item.value.toFixed(1)}
										{item.suffix}
									</span>
								</div>

								<Progress value={item.value} />

								<p className='text-sm text-neutral-500'>
									{item.description}
								</p>
							</div>

							{index < items.length - 1 && (
								<Separator className='bg-neutral-800' />
							)}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
