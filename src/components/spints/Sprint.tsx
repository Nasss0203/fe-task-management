import { BoardItem } from "@/services/board/type";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { CalendarDays, ChevronDown, Settings2 } from "lucide-react";
import { ProviderDragDrop } from "../dnd";
import { Progress } from "../ui/progress";

type SprintProps = {
	boards: BoardItem[];
	workspaceId: string;
	projectId: string;
	sprintId: string;
};

const Sprint = ({ projectId, workspaceId, sprintId }: SprintProps) => {
	const { sprintsQuery } = useSprints({ workspaceId, projectId, sprintId });
	const currentSprint = sprintsQuery.data?.data.find(
		(sprint) => sprint.id === sprintId,
	);
	const statusMeta = getStatusMeta(currentSprint?.status);
	const startAt = formatDate(currentSprint?.startAt);
	const endAt = formatDate(currentSprint?.endAt);
	const remainingDays = getRemainingDays(currentSprint?.endAt);

	return (
		<section className='flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#171717] shadow-sm'>
			<div className='shrink-0 border-b border-[#2a2a2a] p-4'>
				<div className='flex items-start justify-between gap-3'>
					<div className='min-w-0'>
						<div className='flex flex-wrap items-center gap-2'>
							<h3 className='truncate text-base font-bold text-white'>
								{currentSprint?.name ?? "Sprint hiện tại"}
							</h3>
							<span
								className={`inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-bold ${statusMeta.className}`}
							>
								{statusMeta.label}
							</span>
						</div>

						<p className='mt-4 text-xs font-bold text-slate-200'>
							Mục tiêu sprint
						</p>
						<p className='mt-1 text-xs font-medium text-slate-400'>
							{currentSprint?.goal ||
								"Chưa có mục tiêu cho sprint này"}
						</p>
					</div>
				</div>

				<div className='mt-4 flex items-center justify-between text-xs font-medium text-slate-400'>
					<div className='flex items-center gap-1'>
						<CalendarDays size={14} />
						{startAt} - {endAt}
					</div>
					<span>{remainingDays}</span>
				</div>

				<div className='mt-3'>
					<Progress value={67} />
				</div>

				<div className='mt-4 grid grid-cols-4 gap-2'>
					<StatCard value='18' label='Công việc' />
					<StatCard
						value='11'
						label='Hoàn thành'
						className='text-emerald-300'
					/>
					<StatCard
						value='7'
						label='Còn lại'
						className='text-amber-300'
					/>
					<StatCard value='36' label='SP (Tổng)' />
				</div>
			</div>

			<div className='min-h-0 flex-1 overflow-auto p-4'>
				<ProviderDragDrop
					workspaceId={workspaceId}
					projectId={projectId}
					sprintId={sprintId}
					className='w-auto'
				/>
			</div>

			<div className='shrink-0 border-t border-[#2a2a2a] p-4'>
				<div className='mb-4'>
					<div className='flex justify-between text-xs font-semibold text-slate-300'>
						<span>Tổng SP đã lên kế hoạch</span>
					</div>
					<div className='mt-1 text-xs font-bold text-slate-200'>
						29 / 36 SP
					</div>
					<div className='mt-2 h-2 overflow-hidden rounded-full bg-[#2a2a2a]'>
						<Progress value={67} />
					</div>
				</div>

				<div className='flex gap-2'>
					<button className='flex-1 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500'>
						Lập kế hoạch
					</button>
					<button className='rounded-lg border border-[#333333] bg-[#101010] px-3 text-slate-400 transition hover:bg-[#202020] hover:text-white'>
						<Settings2 size={15} />
					</button>
					<button className='rounded-lg border border-[#333333] bg-[#101010] px-3 text-slate-400 transition hover:bg-[#202020] hover:text-white'>
						<ChevronDown size={15} />
					</button>
				</div>
			</div>
		</section>
	);
};

export default Sprint;

function StatCard({
	value,
	label,
	className = "text-white",
}: {
	value: string;
	label: string;
	className?: string;
}) {
	return (
		<div className='rounded-xl border border-[#2a2a2a] bg-[#101010] p-3 text-center'>
			<div className={`text-xl font-bold ${className}`}>{value}</div>
			<div className='mt-1 text-[11px] font-semibold text-slate-500'>
				{label}
			</div>
		</div>
	);
}

function getStatusMeta(status?: string) {
	switch (status) {
		case "ACTIVE":
			return {
				label: "Đang diễn ra",
				className:
					"border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
			};
		case "COMPLETED":
			return {
				label: "Đã hoàn thành",
				className: "border-sky-500/25 bg-sky-500/10 text-sky-300",
			};
		case "CANCELLED":
			return {
				label: "Đã hủy",
				className: "border-red-500/25 bg-red-500/10 text-red-300",
			};
		default:
			return {
				label: "Đã lên kế hoạch",
				className: "border-amber-500/25 bg-amber-500/10 text-amber-300",
			};
	}
}

function formatDate(value?: Date | string | null) {
	if (!value) return "--/--/----";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "--/--/----";
	}

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

function getRemainingDays(value?: Date | string | null) {
	if (!value) return "Chưa đặt hạn";

	const endDate = new Date(value);

	if (Number.isNaN(endDate.getTime())) {
		return "Chưa đặt hạn";
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	endDate.setHours(0, 0, 0, 0);

	const days = Math.max(
		0,
		Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000),
	);

	return days === 0 ? "Hết hạn hôm nay" : `${days} ngày còn lại`;
}
