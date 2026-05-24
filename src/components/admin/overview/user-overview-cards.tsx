import type { AdminUserOverviewResponseDto } from "@/services/admin/user/type";
import {
	Activity,
	Lock,
	ShieldCheck,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";

type Props = {
	overview?: AdminUserOverviewResponseDto;
};

export function UsersOverview({ overview }: Props) {
	const cards = [
		{
			title: "Tổng người dùng",
			value: overview?.totalUsers ?? 0,
			icon: Users,
			iconClass: "bg-neutral-800 text-neutral-300 border border-white/10",
		},
		{
			title: "Đang hoạt động",
			value: overview?.activeUsers ?? 0,
			icon: UserCheck,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "Người dùng bị khóa",
			value: overview?.lockedUsers ?? 0,
			icon: Lock,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "Quản trị viên hệ thống",
			value: overview?.systemAdmins ?? 0,
			icon: ShieldCheck,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
	];

	const quickStats = [
		{
			label: "Người dùng mới 7 ngày",
			value: overview?.newUsersLast7Days ?? 0,
			icon: UserPlus,
		},
		{
			label: "Hoạt động hôm nay",
			value: overview?.activeToday ?? 0,
			icon: Activity,
		},
	];

	return (
		<div className='space-y-3'>
			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{cards.map((card) => {
					const Icon = card.icon;

					return (
						<div
							key={card.title}
							className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'
						>
							<div className='flex items-start justify-between gap-4'>
								<div className='space-y-2'>
									<p className='text-sm text-neutral-400'>
										{card.title}
									</p>
									<h3 className='text-3xl font-semibold text-white'>
										{card.value}
									</h3>
								</div>

								<div
									className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}
								>
									<Icon className='h-5 w-5' />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className='grid gap-3 md:grid-cols-2'>
				{quickStats.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className='flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
						>
							<div className='flex items-center gap-2'>
								<Icon className='h-4 w-4 text-neutral-500' />
								<p className='text-sm text-neutral-400'>
									{item.label}
								</p>
							</div>

							<span className='text-sm font-semibold text-white'>
								{item.value}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
