import WorkManagementMockup from "./workspace/WorkManagementMockup";

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
		<div className='mx-auto mt-24 max-w-6xl'>
			<div className='grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center'>
				<div>
					<h2 className='max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
						Versatile Work Management for Complex Tasks
					</h2>

					<p className='mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base'>
						Seamlessly switch between views to enhance
						collaboration, increase clarity, and conquer complexity.
						With ViewFlow, managing intricate tasks has never been
						more adaptable or straightforward.
					</p>

					<div className='mt-10 space-y-5'>
						{workManagementViews.map((view) => (
							<div
								key={view.title}
								className='border-b border-white/10 pb-4'
							>
								<div className='flex items-center justify-between'>
									<h3
										className={`text-base font-medium ${
											view.active
												? "text-white"
												: "text-white/85"
										}`}
									>
										{view.title}
									</h3>

									<span className='text-white/60'>
										{view.active ? "⌃" : "⌄"}
									</span>
								</div>

								{view.active && (
									<>
										<div className='mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
											<div className='h-full w-2/5 rounded-full bg-indigo-500' />
										</div>

										<p className='mt-4 max-w-lg text-sm leading-7 text-white/60'>
											{view.description}
										</p>
									</>
								)}
							</div>
						))}
					</div>
				</div>

				<div>
					<WorkManagementMockup />
				</div>
			</div>
		</div>
	);
};

export default WorkManagement;
