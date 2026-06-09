const workManagementViews = [
	{
		title: "List View",
		description:
			"Organize and assign tasks. With lists, teams see immediately what they need to do, which tasks are a priority, and when work is due.",
		active: true,
	},
	{ title: "Timeline View", description: "", active: false },
	{ title: "Kanban Board", description: "", active: false },
	{ title: "Gantt Chart", description: "", active: false },
	{ title: "Calendar", description: "", active: false },
];

const WorkManagement = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl px-4'>
			<div className='grid gap-16 lg:grid-cols-2 lg:items-center'>
				<div className='animate-in fade-in slide-in-from-left-8 duration-1000'>
					<h2 className='text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl'>
						Versatile work management.
					</h2>

					<p className='mt-6 text-lg text-white/50'>
						Seamlessly switch between views to enhance
						collaboration and increase clarity. Managing intricate
						tasks has never been more adaptable.
					</p>

					<div className='mt-12 space-y-6'>
						{workManagementViews.map((view) => (
							<div
								key={view.title}
								className='border-b border-white/5 pb-6'
							>
								<div className='flex items-center justify-between cursor-pointer group'>
									<h3
										className={`text-lg font-medium transition-colors ${
											view.active
												? "text-white"
												: "text-white/40 group-hover:text-white/70"
										}`}
									>
										{view.title}
									</h3>

									<span className='text-white/20 group-hover:text-white/50'>
										{view.active ? "−" : "+"}
									</span>
								</div>

								{view.active && (
									<div className='mt-4 animate-in fade-in slide-in-from-top-2 duration-500'>
										<p className='text-base leading-relaxed text-white/50'>
											{view.description}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				<div className='relative animate-in fade-in slide-in-from-right-8 duration-1000'>
					<div className='aspect-video rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm'>
						<div className='flex h-full items-center justify-center p-8'>
							<div className='grid w-full gap-4'>
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className='h-4 w-full rounded-full bg-white/5'
										style={{ opacity: 1 - i * 0.2 }}
									/>
								))}
							</div>
						</div>
					</div>
					{/* Glow */}
					<div className='absolute -inset-4 -z-10 bg-indigo-500/5 blur-3xl rounded-3xl' />
				</div>
			</div>
		</div>
	);
};

export default WorkManagement;
