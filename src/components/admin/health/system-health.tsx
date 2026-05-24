"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SystemHealthItem } from "@/services/admin/dashboard/type";

type Props = {
	items: SystemHealthItem[];
};

const getBadgeClassName = (level: SystemHealthItem["level"]) => {
	if (level === "success") {
		return "border-green-500/40 text-green-400";
	}

	if (level === "warning") {
		return "border-yellow-500/40 text-yellow-400";
	}

	return "border-red-500/40 text-red-400";
};

const getBadgeLabel = (level: SystemHealthItem["level"]) => {
	if (level === "success") return "Healthy";
	if (level === "warning") return "Warning";
	return "Risk";
};

export function SystemHealth({ items }: Props) {
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
							System Health
						</CardTitle>
						<CardDescription className='text-sm text-neutral-400'>
							Quick health indicators across services.
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

			<CardContent className='space-y-4'>
				{items.length === 0 ? (
					<div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
						No system health data
					</div>
				) : (
					items.map((item, index) => (
						<div key={item.key} className='space-y-4'>
							<div className='flex items-start justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4'>
								<div className='min-w-0'>
									<p className='text-sm font-medium text-neutral-100'>
										{item.label}
									</p>
									<p className='mt-1 text-xs leading-5 text-neutral-500'>
										{item.description}
									</p>
								</div>

								<div className='flex shrink-0 items-center gap-2'>
									<span className='text-sm font-semibold text-white'>
										{item.value}
									</span>

									<Badge
										variant='outline'
										className={getBadgeClassName(
											item.level,
										)}
									>
										{getBadgeLabel(item.level)}
									</Badge>
								</div>
							</div>

							{index < items.length - 1 && (
								<Separator className='hidden bg-neutral-800' />
							)}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
