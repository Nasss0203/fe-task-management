import { Lock, ShieldCheck, UserCheck, Users } from "lucide-react";
import type { AdminUser } from "../shared/users.types";

type Props = {
	users: AdminUser[];
};

function isWithinDays(date: string, days: number) {
	const diff = Date.now() - new Date(date).getTime();
	return diff <= days * 24 * 60 * 60 * 1000;
}

export function UsersOverview({ users }: Props) {
	const totalUsers = users.length;
	const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
	const lockedUsers = users.filter((user) => user.status === "LOCKED").length;
	const systemAdmins = users.filter(
		(user) => user.systemRole === "SYSTEM_ADMIN",
	).length;

	const newUsersThisWeek = users.filter((user) =>
		isWithinDays(user.createdAt, 7),
	).length;

	const pendingUsers = users.filter(
		(user) => user.status === "PENDING",
	).length;

	const activeToday = users.filter((user) =>
		isWithinDays(user.lastActive, 1),
	).length;

	const cards = [
		{
			title: "Tổng user",
			value: totalUsers,
			icon: Users,
			iconClass: "bg-neutral-800 text-neutral-300 border border-white/10",
		},
		{
			title: "User đang hoạt động",
			value: activeUsers,
			icon: UserCheck,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "User bị khóa",
			value: lockedUsers,
			icon: Lock,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "System Admin",
			value: systemAdmins,
			icon: ShieldCheck,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
	];

	const quickStats = [
		{
			label: "User mới 7 ngày",
			value: newUsersThisWeek,
		},
		{
			label: "System Admin",
			value: systemAdmins,
		},
		{
			label: "Chờ kích hoạt",
			value: pendingUsers,
		},
		{
			label: "Hoạt động hôm nay",
			value: activeToday,
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

			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{quickStats.map((item) => (
					<div
						key={item.label}
						className='flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
					>
						<p className='text-sm text-neutral-400'>{item.label}</p>
						<span className='text-sm font-semibold text-white'>
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
