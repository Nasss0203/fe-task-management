import { FolderKanban } from "lucide-react";

const ProductivityMockup = ({ variant }: { variant: string }) => {
	if (variant === "task-creation") {
		return (
			<div className='rounded-5 border border-white/10 bg-[#0c0c0f] p-4'>
				<div className='flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/55'>
					<span>New task</span>
					<span>— ×</span>
				</div>

				<div className='mt-4 space-y-4'>
					<div className='text-sm text-white'>
						Please review this document
					</div>

					<div>
						<div className='mb-2 text-xs text-white/50'>For</div>
						<div className='flex flex-wrap gap-2'>
							<span className='rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/70'>
								Michael Brown
							</span>
							<span className='rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-white/70'>
								Schedule kickoff with team
							</span>
						</div>
					</div>

					<div>
						<div className='mb-2 text-xs text-white/50'>
							Description
						</div>
						<div className='space-y-2'>
							<div className='h-2 rounded-full bg-white/6' />
							<div className='h-2 rounded-full bg-white/6' />
							<div className='h-2 w-4/5 rounded-full bg-white/6' />
						</div>
					</div>

					<div className='flex items-center justify-between pt-3'>
						<div className='flex items-center gap-3 text-white/50'>
							<span>＋</span>
							<span>Aa</span>
							<span>◔</span>
							<span className='rounded-full border border-white/10 px-3 py-1 text-xs text-white/65'>
								Apr 6, 5:00pm
							</span>
						</div>

						<div className='rounded-md bg-indigo-500 px-3 py-2 text-xs font-medium text-white'>
							Create Task
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (variant === "list-view") {
		return (
			<div className='rounded-5 border border-white/10 bg-[#0c0c0f] p-4'>
				<div className='mb-4 flex items-center gap-3'>
					<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white'>
						<FolderKanban className='h-4 w-4' />
					</div>
					<div className='text-sm font-medium text-white'>
						Products Launch
					</div>
				</div>

				<div className='overflow-hidden rounded-xl border border-white/10'>
					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr] border-b border-white/10 bg-white/3 text-xs text-white/55'>
						<div className='border-r border-white/10 px-3 py-2'>
							Task Name
						</div>
						<div className='border-r border-white/10 px-3 py-2'>
							Stage
						</div>
						<div className='px-3 py-2'>Impact</div>
					</div>

					<div className='grid grid-cols-[1.8fr_0.7fr_0.7fr] border-b border-white/10 text-xs'>
						<div className='border-r border-white/10 px-3 py-2 text-white/75'>
							▾ Project Kickoff & Planning
						</div>
						<div className='border-r border-white/10 px-3 py-2 text-white/40'></div>
						<div className='px-3 py-2 text-white/40'></div>
					</div>

					{[
						[
							"Define project objectives and goals.",
							"Completed",
							"High",
						],
						[
							"Identify target audience and user persona.",
							"In Review",
							"Low",
						],
						["Schedule kickoff with team", "Completed", "High"],
					].map((row) => (
						<div
							key={row[0]}
							className='grid grid-cols-[1.8fr_0.7fr_0.7fr] border-b border-white/10 text-xs'
						>
							<div className='border-r border-white/10 px-3 py-2 text-white/70'>
								○ {row[0]}
							</div>
							<div className='border-r border-white/10 px-3 py-2'>
								<span className='rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-400'>
									{row[1]}
								</span>
							</div>
							<div className='px-3 py-2'>
								<span className='rounded-full bg-rose-500/15 px-2 py-1 text-[10px] text-rose-400'>
									{row[2]}
								</span>
							</div>
						</div>
					))}

					<div className='px-3 py-2 text-xs text-white/45'>
						+ Add task
					</div>
				</div>
			</div>
		);
	}

	if (variant === "autoflow") {
		return (
			<div className='grid gap-4 md:grid-cols-[0.9fr_1.1fr]'>
				<div className='rounded-5 border border-indigo-500/40 bg-[#0c0c0f] p-4 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'>
					<div className='text-sm font-medium text-white'>
						How are tasks being added to this project?
					</div>

					<div className='mt-4 space-y-3'>
						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/70'>
							Monthly
						</div>

						<div className='text-xs text-white/45'>Forms</div>

						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/70'>
							Cross-functional project plan
						</div>

						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs text-white/70'>
							Tasks source
						</div>

						<div className='pt-3 text-right'>
							<span className='inline-block rounded-md bg-indigo-500 px-4 py-2 text-xs font-medium text-white'>
								Next
							</span>
						</div>
					</div>
				</div>

				<div className='rounded-5 border border-white/10 bg-[#0c0c0f] p-4'>
					<div className='mb-3 flex items-center justify-between'>
						<div>
							<div className='text-xs text-white/45'>Section</div>
							<div className='text-sm font-medium text-white'>
								To do
							</div>
						</div>
						<div className='rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/50'>
							2 incomplete tasks
						</div>
					</div>

					<div className='space-y-3'>
						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-3 text-xs text-white/55'>
							When tasks are moved to this section automatically
						</div>
						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-3 text-xs text-white/70'>
							Set assignee
						</div>
						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-3 text-xs text-white/70'>
							Add collaborators
						</div>
						<div className='rounded-lg border border-white/10 bg-white/3 px-3 py-3 text-xs text-white/70'>
							Action or additional process
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-5 border border-white/10 bg-[#0c0c0f] p-4'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white'>
						<FolderKanban className='h-4 w-4' />
					</div>
					<div className='text-sm font-medium text-white'>
						Sales Kickoff Event
					</div>
				</div>

				<div className='rounded-md bg-indigo-500 px-3 py-2 text-xs font-medium text-white'>
					Share
				</div>
			</div>

			<div className='mb-4 flex flex-wrap items-center gap-4 border-b border-white/10 pb-3 text-xs text-white/55'>
				<span className='text-white'>Overview</span>
				<span>List</span>
				<span>Kanban</span>
				<span>Timeline</span>
				<span>Calendar</span>
				<span>Gantt</span>
			</div>

			<div className='space-y-5'>
				<div>
					<div className='mb-2 text-xs text-white/50'>
						Project Description
					</div>
					<div className='space-y-2'>
						<div className='h-2 rounded-full bg-white/6' />
						<div className='h-2 rounded-full bg-white/6' />
						<div className='h-2 w-4/5 rounded-full bg-white/6' />
					</div>
				</div>

				<div>
					<div className='mb-2 text-xs text-white/50'>
						Project Risks
					</div>
					<div className='space-y-2'>
						<div className='h-2 rounded-full bg-white/6' />
						<div className='h-2 w-3/4 rounded-full bg-white/6' />
					</div>
				</div>

				<div className='flex items-center gap-6 pt-2'>
					{["Ribbi Dennis", "Jon Fisher", "Rayhan Berman"].map(
						(name) => (
							<div key={name} className='flex items-center gap-2'>
								<div className='h-7 w-7 rounded-full bg-white/20' />
								<div className='text-[11px] leading-4 text-white/70'>
									{name}
								</div>
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
};

export default ProductivityMockup;
