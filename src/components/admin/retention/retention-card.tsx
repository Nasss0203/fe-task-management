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
		return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
	}

	if (level === "warning") {
		return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
	}

	return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
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
		<Card className='rounded-2xl border border-border bg-white text-[#1E293B] shadow-sm'>
			<CardHeader>
				<div className='flex items-start justify-between gap-4'>
					<div>
						<CardTitle className='text-lg font-semibold text-[#0F172A]'>
							Retention & Churn
						</CardTitle>
						<CardDescription className='text-sm text-[#64748B]'>
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
					<div className='flex h-[180px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-[#64748B]'>
						Chưa có dữ liệu retention
					</div>
				) : (
					items.map((item, index) => (
						<div key={item.key} className='space-y-4'>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm font-medium text-[#334155]'>
										{getMetricLabel(item.label)}
									</span>

									<span className='text-xl font-semibold text-[#0F172A]'>
										{item.value.toFixed(1)}
										{item.suffix}
									</span>
								</div>

								<Progress value={item.value} />

								<p className='text-sm text-[#64748B]'>
									{getMetricDescription(item.description)}
								</p>
							</div>

							{index < items.length - 1 && (
								<Separator className='bg-border' />
							)}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
