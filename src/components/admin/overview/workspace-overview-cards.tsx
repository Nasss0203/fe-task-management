import type { WorkspaceItem } from "@/services/admin/workspace/type";
import { Building2, Crown, ShieldCheck } from "lucide-react";

type Props = {
	workspaces: WorkspaceItem[];
};

export function WorkspaceOverviewCards({ workspaces }: Props) {
	const total = workspaces.length;
	const active = workspaces.filter((item) => item.status === "ACTIVE").length;
	const pro = workspaces.filter((item) => item.plan === "pro").length;

	const totalProjects = workspaces.reduce(
		(sum, item) => sum + item.projectsCount,
		0,
	);
	const totalBoards = workspaces.reduce(
		(sum, item) => sum + item.boardsCount,
		0,
	);
	const totalTasks = workspaces.reduce(
		(sum, item) => sum + item.tasksCount,
		0,
	);

	const cards = [
		{
			title: "Tổng workspace",
			value: total,
			helper: `${totalProjects} project trên hệ thống`,
			icon: Building2,
			iconClass: "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]",
		},
		{
			title: "Đang hoạt động",
			value: active,
			helper: total
				? `${Math.round((active / total) * 100)}% đang mở`
				: "Chưa có dữ liệu",
			icon: ShieldCheck,
			iconClass:
				"bg-[#F0FDF4] text-[#22C55E] border border-[#BBF7D0]",
		},
		{
			title: "Workspace Pro",
			value: pro,
			helper: "Workspace trả phí",
			icon: Crown,
			iconClass: "bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]",
		},
	];

	const quickStats = [
		{ label: "Tổng project", value: totalProjects },
		{ label: "Tổng board", value: totalBoards },
		{ label: "Tổng task", value: totalTasks },
		{ label: "Gói Pro", value: pro },
	];

	return (
		<div className='space-y-3'>
			<div className='grid gap-3 md:grid-cols-3'>
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

			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{quickStats.map((item) => (
					<div
						key={item.label}
						className='flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-sm'
					>
						<p className='text-sm text-[#64748B]'>{item.label}</p>
						<span className='text-sm font-semibold text-[#0F172A]'>
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
