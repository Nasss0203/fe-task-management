"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ActivityItem } from "@/services/admin/dashboard/type";
import {
	Activity,
	AlertTriangle,
	CreditCard,
	UserRound,
	Workflow,
} from "lucide-react";

type Props = {
	items: ActivityItem[];
};

const getLevelClassName = (level: ActivityItem["level"]) => {
	if (level === "success") {
		return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
	}

	if (level === "warning") {
		return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
	}

	if (level === "danger") {
		return "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]";
	}

	return "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";
};

const getIcon = (type: ActivityItem["type"]) => {
	if (type === "workspace") return Workflow;
	if (type === "billing") return CreditCard;
	if (type === "user") return UserRound;
	if (type === "system") return AlertTriangle;

	return Activity;
};

const getActivityTitle = (title: string) => {
	const titleMap: Record<string, string> = {
		"New user registered": "Người dùng mới đăng ký",
		"New workspace created": "Workspace mới được tạo",
		"Payment received": "Đã nhận thanh toán",
		"System alert": "Cảnh báo hệ thống",
	};

	return titleMap[title] ?? title;
};

const getActivityDescription = (description: string) => {
	const createdAccountMatch = description.match(/^(.+) created an account\.$/);
	if (createdAccountMatch) {
		return `${createdAccountMatch[1]} đã tạo tài khoản.`;
	}

	const workspaceCreatedMatch = description.match(
		/^Workspace "(.+)" was created\.$/,
	);
	if (workspaceCreatedMatch) {
		return `Workspace "${workspaceCreatedMatch[1]}" đã được tạo.`;
	}

	return description;
};

const getActivityTime = (time: string) => {
	const dayAgoMatch = time.match(/^(\d+)d ago$/);
	if (dayAgoMatch) return `${dayAgoMatch[1]} ngày trước`;

	const hourAgoMatch = time.match(/^(\d+)h ago$/);
	if (hourAgoMatch) return `${hourAgoMatch[1]} giờ trước`;

	const minuteAgoMatch = time.match(/^(\d+)m ago$/);
	if (minuteAgoMatch) return `${minuteAgoMatch[1]} phút trước`;

	return time;
};

const getLevelLabel = (level: ActivityItem["level"]) => {
	const levelMap: Record<ActivityItem["level"], string> = {
		info: "Thông tin",
		success: "Thành công",
		warning: "Cảnh báo",
		danger: "Rủi ro",
	};

	return levelMap[level];
};

const getTypeLabel = (type: ActivityItem["type"]) => {
	const typeMap: Record<ActivityItem["type"], string> = {
		workspace: "Workspace",
		user: "Người dùng",
		billing: "Thanh toán",
		system: "Hệ thống",
	};

	return typeMap[type];
};

export function RecentActivity({ items }: Props) {
	return (
		<Card className='rounded-2xl border border-border bg-white text-[#1E293B] shadow-sm'>
			<CardHeader>
				<CardTitle className='text-lg font-semibold text-[#0F172A]'>
					Hoạt động gần đây
				</CardTitle>
				<CardDescription className='text-sm text-[#64748B]'>
					Sự kiện mới nhất trên toàn hệ thống.
				</CardDescription>
			</CardHeader>

			<CardContent>
				{items.length === 0 ? (
					<div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-[#64748B]'>
						Chưa có hoạt động gần đây
					</div>
				) : (
					<ScrollArea className='h-[280px] pr-3'>
						<div className='space-y-4'>
							{items.map((item, index) => {
								const Icon = getIcon(item.type);
								const title = getActivityTitle(item.title);
								const description = getActivityDescription(
									item.description,
								);
								const time = getActivityTime(item.time);

								return (
									<div key={item.id} className='space-y-4'>
										<div className='flex gap-3'>
											<div className='mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF]'>
												<Icon className='h-4 w-4 text-[#2563EB]' />
											</div>

											<div className='min-w-0 flex-1'>
												<div className='flex items-start justify-between gap-3'>
													<div>
														<p className='text-sm font-semibold text-[#0F172A]'>
															{title}
														</p>

														<p className='mt-1 text-sm leading-5 text-[#64748B]'>
															{description}
														</p>
													</div>

													<span className='shrink-0 text-xs text-[#64748B]'>
														{time}
													</span>
												</div>

												<div className='mt-2 flex items-center gap-2'>
													<Badge
														variant='outline'
														className={getLevelClassName(
															item.level,
														)}
													>
														{getLevelLabel(
															item.level,
														)}
													</Badge>

													<Badge
														variant='secondary'
														className='bg-[#F8FAFC] text-[#475569]'
													>
														{getTypeLabel(item.type)}
													</Badge>
												</div>
											</div>
										</div>

										{index < items.length - 1 && (
											<Separator className='bg-border' />
										)}
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
