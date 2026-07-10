"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SystemHealthItem } from "@/services/admin/dashboard/type";
import { RefreshCw } from "lucide-react";

type Props = {
	items: SystemHealthItem[];
	isLoading?: boolean;
	isError?: boolean;
	isFetching?: boolean;
	updatedAt?: number;
	onRefresh?: () => void;
};

const getBadgeClassName = (level: SystemHealthItem["level"]) => {
	if (level === "success") {
		return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
	}

	if (level === "warning") {
		return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
	}

	return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
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
		Configured: "Đã cấu hình",
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
		"Mail service configuration is available.":
			"Cấu hình dịch vụ email đã sẵn sàng.",
		"Mail service configuration is missing or incomplete.":
			"Backend health endpoint đang báo dịch vụ email chưa sẵn sàng. Nếu .env backend đã có cấu hình, hãy restart backend và kiểm tra frontend đang trỏ đúng API.",
		"Current backend runtime environment.":
			"Môi trường runtime hiện tại của backend.",
	};

	return descriptionMap[description] ?? description;
};

export function SystemHealth({
	items,
	isLoading = false,
	isError = false,
	isFetching = false,
	updatedAt = 0,
	onRefresh,
}: Props) {
	const overallLevel = items.some((item) => item.level === "danger")
		? "danger"
		: items.some((item) => item.level === "warning")
			? "warning"
			: "success";
	const overallLabel = isError
		? "Không kết nối"
		: isFetching
			? "Đang cập nhật"
			: getBadgeLabel(overallLevel);
	const overallClassName = isError
		? getBadgeClassName("danger")
		: isFetching
			? "border-border bg-muted text-muted-foreground"
			: getBadgeClassName(overallLevel);
	const lastUpdatedLabel = updatedAt
		? new Date(updatedAt).toLocaleTimeString("vi-VN", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			})
		: null;

	return (
		<Card className='rounded-2xl border border-border bg-white text-[#1E293B] shadow-sm'>
			<CardHeader>
				<div className='flex items-start justify-between gap-4'>
					<div>
						<CardTitle className='text-lg font-semibold text-[#0F172A]'>
							Sức khỏe hệ thống
						</CardTitle>
						<CardDescription className='text-sm text-[#64748B]'>
							Chỉ báo nhanh cho các dịch vụ hệ thống.
						</CardDescription>
						<p className='mt-1 text-xs text-muted-foreground'>
							{lastUpdatedLabel
								? `Cập nhật lúc ${lastUpdatedLabel} · tự động mỗi 30 giây`
								: "Đang chờ lần kiểm tra đầu tiên"}
						</p>
					</div>

					<div className='flex shrink-0 items-center gap-2'>
						<Badge variant='outline' className={overallClassName}>
							{overallLabel}
						</Badge>

						<Button
							type='button'
							variant='outline'
							size='icon'
							onClick={onRefresh}
							disabled={isFetching}
							aria-label='Làm mới sức khỏe hệ thống'
							className='size-9 rounded-xl'
						>
							<RefreshCw className={cn(isFetching && "animate-spin")} />
						</Button>
					</div>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{isLoading ? (
					<div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground'>
						Đang kiểm tra các dịch vụ hệ thống...
					</div>
				) : isError ? (
					<div className='flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 px-6 text-center'>
						<p className='text-sm font-medium text-destructive'>
							Không thể kết nối dịch vụ kiểm tra sức khỏe
						</p>
						<p className='text-xs text-muted-foreground'>
							Hệ thống sẽ tự thử lại hoặc bạn có thể nhấn nút làm mới.
						</p>
					</div>
				) : items.length === 0 ? (
					<div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-[#64748B]'>
						Chưa có dữ liệu sức khỏe hệ thống
					</div>
				) : (
					items.map((item, index) => (
						<div key={item.key} className='space-y-4'>
							<div className='flex items-start justify-between gap-4 rounded-xl border border-border bg-[#F8FAFC] p-4'>
								<div className='min-w-0'>
									<p className='text-sm font-medium text-[#0F172A]'>
										{getHealthLabel(item.label)}
									</p>
									<p className='mt-1 text-xs leading-5 text-[#64748B]'>
										{getHealthDescription(
											item.description,
										)}
									</p>
								</div>

								<div className='flex shrink-0 items-center gap-2'>
									<span className='text-sm font-semibold text-[#0F172A]'>
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
								<Separator className='hidden bg-border' />
							)}
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
