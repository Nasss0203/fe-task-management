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
	if (level === "success") return "Ổn định";
	if (level === "warning") return "Theo dõi";
	return "Rủi ro";
};

const getMetricLabel = (label: string) => {
	const normalizedLabel = label.toLowerCase();

	if (normalizedLabel.includes("30-day retention")) {
		return "Giữ chân 30 ngày";
	}

	if (normalizedLabel.includes("monthly churn")) {
		return "Churn hằng tháng";
	}

	return label;
};

const getMetricDescription = (description: string) => {
	const normalizedDescription = description.toLowerCase();

	if (
		normalizedDescription.includes(
			"not enough users older than 30 days to calculate retention",
		)
	) {
		return "Chưa đủ người dùng có tuổi đời trên 30 ngày để tính retention.";
	}

	if (
		normalizedDescription.includes(
			"no pro workspaces available to calculate churn",
		)
	) {
		return "Chưa có workspace Pro để tính churn.";
	}

	return description;
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
							Chỉ số giữ chân, churn và sức khỏe sử dụng.
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
						Chưa có dữ liệu retention
					</div>
				) : (
					items.map((item, index) => (
						<div key={item.key} className='space-y-4'>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm font-medium text-neutral-300'>
										{getMetricLabel(item.label)}
									</span>

									<span className='text-xl font-semibold text-white'>
										{item.value.toFixed(1)}
										{item.suffix}
									</span>
								</div>

								<Progress value={item.value} />

								<p className='text-sm text-neutral-500'>
									{getMetricDescription(item.description)}
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
