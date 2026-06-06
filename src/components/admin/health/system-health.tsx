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
	if (level === "success") return "Ổn định";
	if (level === "warning") return "Cảnh báo";
	return "Rủi ro";
};

const getHealthLabel = (label: string) => {
	const labelMap: Record<string, string> = {
		"API Status": "Trạng thái API",
		"Database Status": "Trạng thái database",
		"Mail Service": "Dịch vụ email",
		Environment: "Môi trường",
	};

	return labelMap[label] ?? label;
};

const getHealthValue = (value: string) => {
	const valueMap: Record<string, string> = {
		Healthy: "Ổn định",
		"Not Configured": "Chưa cấu hình",
		development: "development",
		production: "production",
	};

	return valueMap[value] ?? value;
};

const getHealthDescription = (description: string) => {
	const descriptionMap: Record<string, string> = {
		"Backend API is reachable.": "Backend API đang phản hồi.",
		"Database connection is available.": "Kết nối database khả dụng.",
		"Mail service configuration is missing or incomplete.":
			"Cấu hình dịch vụ email đang thiếu hoặc chưa hoàn chỉnh.",
		"Current backend runtime environment.":
			"Môi trường runtime hiện tại của backend.",
	};

	return descriptionMap[description] ?? description;
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
							Sức khỏe hệ thống
						</CardTitle>
						<CardDescription className='text-sm text-neutral-400'>
							Chỉ báo nhanh cho các dịch vụ hệ thống.
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
						Chưa có dữ liệu sức khỏe hệ thống
					</div>
				) : (
					items.map((item, index) => (
						<div key={item.key} className='space-y-4'>
							<div className='flex items-start justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4'>
								<div className='min-w-0'>
									<p className='text-sm font-medium text-neutral-100'>
										{getHealthLabel(item.label)}
									</p>
									<p className='mt-1 text-xs leading-5 text-neutral-500'>
										{getHealthDescription(
											item.description,
										)}
									</p>
								</div>

								<div className='flex shrink-0 items-center gap-2'>
									<span className='text-sm font-semibold text-white'>
										{getHealthValue(item.value)}
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
