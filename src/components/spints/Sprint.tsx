import { BoardItem } from "@/services/board/type";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { CalendarDays, MoreHorizontal, Settings2, PlayCircle, CheckCircle } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import SprintTaskList from "./SprintTaskList";

type SprintProps = {
	boards: BoardItem[];
	workspaceId: string;
	projectId: string;
	sprintId: string;
};

const Sprint = ({ projectId, workspaceId, sprintId }: SprintProps) => {
	const { sprintsQuery, startSprint, completed } = useSprints({ workspaceId, projectId, sprintId });
	const currentSprint = sprintsQuery.data?.data.find(
		(sprint) => sprint.id === sprintId,
	);
	const statusMeta = getStatusMeta(currentSprint?.status);
	
	const hasDates = currentSprint?.startAt && currentSprint?.endAt;
	const dateDisplay = hasDates 
		? `${formatDate(currentSprint.startAt)} → ${formatDate(currentSprint.endAt)}`
		: "Chưa lên lịch";

	return (
		<section className='flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#171717] shadow-sm'>
			<div className='shrink-0 border-b border-[#2a2a2a] p-4'>
				<div className='flex items-start justify-between gap-3'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center justify-between'>
							<div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
								<h3 className='truncate text-base font-bold text-white'>
									{currentSprint?.name ?? "Sprint hiện tại"}
								</h3>
								<div className='flex items-center gap-2'>
									<span
										className={`inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-bold ${statusMeta.className}`}
									>
										{statusMeta.label}
									</span>
									<span className='text-slate-600'>·</span>
									<span className={`text-xs font-medium ${hasDates ? 'text-slate-400' : 'text-slate-500 italic'}`}>
										{dateDisplay}
									</span>
								</div>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className='flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-[#2a2a2a] hover:text-white'>
										<MoreHorizontal size={16} />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-48 border-[#2a2a2a] bg-[#171717] text-slate-200'>
									<DropdownMenuItem className='gap-2 focus:bg-[#2a2a2a] focus:text-white'>
										<PlayCircle size={14} />
										<span>Lập kế hoạch</span>
									</DropdownMenuItem>
									<DropdownMenuItem className='gap-2 focus:bg-[#2a2a2a] focus:text-white'>
										<Settings2 size={14} />
										<span>Cấu hình sprint</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator className='bg-[#2a2a2a]' />
									<DropdownMenuItem 
										className='gap-2 text-emerald-400 focus:bg-[#2a2a2a] focus:text-emerald-300'
										onClick={() => {
											if (confirm("Hoàn thành sprint này?")) {
												completed.mutate({ workspaceId, projectId, sprintId });
											}
										}}
									>
										<CheckCircle size={14} />
										<span>Hoàn thành sprint</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{currentSprint?.goal && (
							<div className='mt-3'>
								<p className='text-xs font-bold text-slate-200'>
									Mục tiêu sprint
								</p>
								<p className='mt-1 text-xs font-medium text-slate-400'>
									{currentSprint.goal}
								</p>
							</div>
						)}
					</div>
				</div>

				<div className='mt-3 grid grid-cols-4 gap-2'>
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

			<div className='flex min-h-0 flex-1 flex-col p-0'>
				<SprintTaskList
					workspaceId={workspaceId}
					projectId={projectId}
					sprintId={sprintId}
				/>
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
