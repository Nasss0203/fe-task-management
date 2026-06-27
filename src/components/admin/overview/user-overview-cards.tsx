import type { AdminUserOverviewResponseDto } from "@/services/admin/user/type";
import { Lock, ShieldCheck, UserCheck, Users } from "lucide-react";

type Props = {
	overview?: AdminUserOverviewResponseDto;
};

const getRate = (value = 0, total = 0) => {
	if (!total) return 0;
	return Math.round((value / total) * 100);
};

export function UsersOverview({ overview }: Props) {
	const totalUsers = overview?.totalUsers ?? 0;
	const activeUsers = overview?.activeUsers ?? 0;
	const lockedUsers = overview?.lockedUsers ?? 0;
	const systemAdmins = overview?.systemAdmins ?? 0;

	const cards = [
		{
			title: "Tổng người dùng",
			value: totalUsers,
			helper: "Tài khoản đã đăng ký",
			icon: Users,
			iconClass: "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]",
		},
		{
			title: "Đang hoạt động",
			value: activeUsers,
			helper: `${getRate(activeUsers, totalUsers)}% tổng user`,
			icon: UserCheck,
			iconClass:
				"bg-[#F0FDF4] text-[#22C55E] border border-[#BBF7D0]",
		},
		{
			title: "Người dùng bị khóa",
			value: lockedUsers,
			helper: `${getRate(lockedUsers, totalUsers)}% cần theo dõi`,
			icon: Lock,
			iconClass: "bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]",
		},
		{
			title: "Quản trị viên hệ thống",
			value: systemAdmins,
			helper: "Có quyền vận hành admin",
			icon: ShieldCheck,
			iconClass: "bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]",
		},
	];

	return (
		<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div
						key={card.title}
						className='rounded-2xl border border-border bg-white p-5 shadow-sm'
					>
						<div className='flex items-start justify-between gap-4'>
							<div className='space-y-2'>
								<p className='text-sm text-[#64748B]'>
									{card.title}
								</p>
								<h3 className='text-3xl font-semibold text-[#0F172A]'>
									{card.value}
								</h3>
								<p className='text-xs text-[#64748B]'>
									{card.helper}
								</p>
							</div>

							<div
								className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
							>
								<Icon className='h-5 w-5' />
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
