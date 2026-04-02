import { FolderKanban } from "lucide-react";

const WorkManagementMockup = () => {
	return (
		<div className='rounded-[24px] border border-white/10 bg-[#17181c] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]'>
			<div className='rounded-[18px] border border-white/10 bg-[#0d0d10] p-4'>
				<div className='mb-4 flex items-center justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white'>
							<FolderKanban className='h-4 w-4' />
						</div>

						<div>
							<p className='text-[11px] text-white/45'>
								Taskmanly Solutions
							</p>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='rounded-md border border-white/10 px-3 py-1.5 text-[11px] text-white/70'>
							June 2024
						</div>
						<div className='rounded-md border border-white/10 px-3 py-1.5 text-[11px] text-white/70'>
							Customize
						</div>
					</div>
				</div>

				<div className='mb-4 flex flex-wrap items-center gap-4 border-b border-white/10 pb-3 text-[11px] text-white/50'>
					<span className='rounded-md bg-white/[0.06] px-2 py-1 text-white'>
						List
					</span>
					<span>Kanban</span>
					<span>Timeline</span>
					<span>Calendar</span>
					<span>Gantt</span>

					<div className='ml-auto rounded-md border border-white/10 px-3 py-1 text-[11px] text-white/60'>
						manage
					</div>
				</div>

				<div className='overflow-hidden rounded-xl border border-white/10'>
					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 bg-white/[0.03] text-[11px] text-white/45'>
						<div className='border-r border-white/10 px-3 py-2'>
							Task
						</div>
						<div className='border-r border-white/10 px-3 py-2'>
							Assignee
						</div>
						<div className='border-r border-white/10 px-3 py-2'>
							Progress
						</div>
						<div className='px-3 py-2'>Deadline</div>
					</div>

					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 text-[11px]'>
						<div className='border-r border-white/10 px-3 py-2 text-white/80'>
							Objective 1: Name of Objective
						</div>
						<div className='border-r border-white/10 px-3 py-2'></div>
						<div className='border-r border-white/10 px-3 py-2'></div>
						<div className='px-3 py-2'></div>
					</div>

					{[
						"Adjust timeline to publish initial release without delay.",
						"Review budget control to ensure the team stays aligned.",
						"Support workflow coordination with managers and engineers.",
						"Reduce approval time across key recurring requests.",
						"Automate repetitive work to improve reporting speed.",
						"Align documentation system with campaign launch dates.",
					].map((task, index) => (
						<div
							key={task}
							className='grid grid-cols-[1.8fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 text-[11px]'
						>
							<div className='border-r border-white/10 px-3 py-2 text-white/65'>
								○ {task}
							</div>

							<div className='border-r border-white/10 px-3 py-2'>
								<div className='flex items-center gap-1'>
									<div className='h-5 w-5 rounded-full bg-white/20' />
									<div className='h-5 w-5 rounded-full bg-white/10' />
								</div>
							</div>

							<div className='border-r border-white/10 px-3 py-2'>
								<span className='rounded-full bg-rose-500/15 px-2 py-1 text-[10px] text-rose-400'>
									{index % 2 === 0 ? "Key task" : "In review"}
								</span>
							</div>

							<div className='px-3 py-2 text-white/55'>
								Jun {20 + index}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default WorkManagementMockup;
