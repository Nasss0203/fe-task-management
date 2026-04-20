import { ArchiveX, Building2, Lock, ShieldCheck } from "lucide-react";
import { AdminWorkspace } from "../shared/workspace-admin.types";

type Props = {
	workspaces: AdminWorkspace[];
};

export function WorkspaceOverviewCards({ workspaces }: Props) {
	const total = workspaces.length;
	const active = workspaces.filter((item) => item.status === "ACTIVE").length;
	const locked = workspaces.filter((item) => item.status === "LOCKED").length;
	const deleted = workspaces.filter(
		(item) => item.status === "DELETED",
	).length;

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
	const totalStorageUsed = workspaces.reduce(
		(sum, item) => sum + item.storageUsedGb,
		0,
	);

	const cards = [
		{
			title: "Tổng workspace",
			value: total,
			icon: Building2,
			iconClass: "bg-white/5 text-neutral-300 border border-white/10",
		},
		{
			title: "Đang hoạt động",
			value: active,
			icon: ShieldCheck,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "Đang bị khóa",
			value: locked,
			icon: Lock,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "Đã xóa mềm",
			value: deleted,
			icon: ArchiveX,
			iconClass:
				"bg-amber-500/10 text-amber-400 border border-amber-500/20",
		},
	];

	const quickStats = [
		{ label: "Tổng project", value: totalProjects },
		{ label: "Tổng board", value: totalBoards },
		{ label: "Tổng task", value: totalTasks },
		{
			label: "Dung lượng đang dùng",
			value: `${totalStorageUsed.toFixed(1)} GB`,
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
