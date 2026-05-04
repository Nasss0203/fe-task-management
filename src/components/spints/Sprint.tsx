import { BoardItem } from "@/services/board/type";
import {
	CalendarDays,
	CheckCircle2,
	ChevronDown,
	Settings2,
} from "lucide-react";
import { ProviderDragDrop } from "../dnd";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "../ui/combobox";
import { Progress } from "../ui/progress";
type Priority = "Cao" | "Trung bình" | "Thấp";
type TaskStatus = "todo" | "progress" | "done";

type Task = {
	key: string;
	title: string;
	priority: Priority;
	assignee: string;
	sp: number;
	labels: string[];
	status?: TaskStatus;
};

type SprintProps = {
	boards: BoardItem[];
	workspaceId: string;
	projectId: string;
	sprintId: string;
};

const frameworks = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5"];

const Sprint = ({ boards, projectId, workspaceId, sprintId }: SprintProps) => {
	return (
		<section className='col-span-12 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#171717] shadow-sm xl:col-span-6'>
			<div className='border-b border-[#2a2a2a] p-5'>
				<div className='flex items-start justify-between gap-3'>
					<div>
						<div className='flex items-center gap-2'>
							<Combobox items={frameworks}>
								<ComboboxInput
									value={frameworks[0]}
									readOnly
									className='cursor-pointer caret-transparent select-none'
									onMouseDown={(e) => e.preventDefault()}
								/>
								<ComboboxContent>
									<ComboboxEmpty>
										No items found.
									</ComboboxEmpty>
									<ComboboxList>
										{(item) => (
											<ComboboxItem
												key={item}
												value={item}
											>
												{item}
											</ComboboxItem>
										)}
									</ComboboxList>
								</ComboboxContent>
							</Combobox>
							<span className='rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300'>
								Đang diễn ra
							</span>
						</div>

						<p className='mt-4 text-xs font-bold text-slate-200'>
							Mục tiêu sprint
						</p>
						<p className='mt-1 text-xs font-medium text-slate-400'>
							Hoàn thiện phân quyền và cải thiện trải nghiệm quản
							trị
						</p>
					</div>
				</div>

				<div className='mt-5 flex items-center justify-between text-xs font-medium text-slate-400'>
					<div className='flex items-center gap-1'>
						<CalendarDays size={14} />
						13/05/2024 - 26/05/2024
					</div>
					<span>6 ngày còn lại</span>
				</div>

				<div className='mt-3'>
					<Progress value={67} />
				</div>

				<div className='mt-5 grid grid-cols-4 gap-2'>
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

			<div className='h-100 p-5 overflow-auto'>
				<ProviderDragDrop
					workspaceId={workspaceId}
					projectId={projectId}
					className='w-auto'
				/>
			</div>

			<div className='border-t border-[#2a2a2a] p-5'>
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

function MiniTaskCard({ task, done }: { task: Task; done?: boolean }) {
	return (
		<div className='rounded-xl border border-[#2a2a2a] bg-[#101010] p-3 shadow-sm transition hover:border-blue-500/40 hover:bg-[#141414]'>
			<div className='flex items-start justify-between gap-2'>
				<div>
					<div className='text-[10px] font-bold text-slate-500'>
						{task.key}
					</div>
					<div className='mt-1 line-clamp-2 text-[11px] font-bold leading-snug text-slate-200'>
						{task.title}
					</div>
				</div>

				{done && (
					<CheckCircle2
						size={14}
						className='shrink-0 text-emerald-400'
					/>
				)}
			</div>

			<div className='mt-3 flex items-center justify-between'>
				<Avatar name={task.assignee} small />
				<span className='rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-300'>
					{task.sp}
				</span>
			</div>
		</div>
	);
}

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

function Avatar({ name, small }: { name: string; small?: boolean }) {
	const initials = name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div
			className={`flex shrink-0 items-center justify-center rounded-full border border-[#333333] bg-[#263244] font-bold text-slate-200 ${
				small ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]"
			}`}
		>
			{initials}
		</div>
	);
}
