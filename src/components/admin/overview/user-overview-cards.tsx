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
			iconClass: "bg-white/5 text-neutral-300 border border-white/10",
		},
		{
			title: "Đang hoạt động",
			value: activeUsers,
			helper: `${getRate(activeUsers, totalUsers)}% tổng user`,
			icon: UserCheck,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "Người dùng bị khóa",
			value: lockedUsers,
			helper: `${getRate(lockedUsers, totalUsers)}% cần theo dõi`,
			icon: Lock,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "Quản trị viên hệ thống",
			value: systemAdmins,
			helper: "Có quyền vận hành admin",
			icon: ShieldCheck,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
	];

	return (
		<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div
						key={card.title}
						className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'
					>
						<div className='flex items-start justify-between gap-4'>
							<div className='space-y-2'>
								<p className='text-sm text-neutral-400'>
									{card.title}
								</p>
								<h3 className='text-3xl font-semibold text-white'>
									{card.value}
								</h3>
								<p className='text-xs text-neutral-500'>
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
