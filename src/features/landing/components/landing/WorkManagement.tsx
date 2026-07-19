const workManagementViews = [
	{
		title: "Dạng Danh sách",
		description:
			"Sắp xếp và giao việc. Với danh sách, nhóm sẽ thấy ngay những gì cần làm, tác vụ nào là ưu tiên, và thời hạn hoàn thành.",
		active: true,
	},
	{ title: "Bảng Kanban", description: "", active: false },
	{ title: "Dạng Tài liệu", description: "", active: false },
	{ title: "Dạng Tiến độ", description: "", active: false },
	{ title: "Lịch", description: "", active: false },
];

const WorkManagement = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl px-4'>
			<div className='grid gap-16 lg:grid-cols-2 lg:items-center'>
				<div>
					<h2 className='text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl'>
						Quản lý công việc song song với kiến thức của bạn.
					</h2>

					<p className='mt-6 text-lg text-muted-foreground'>
						Chuyển đổi liền mạch giữa bảng, danh sách và tài liệu.
						Việc giữ cho các đặc tả và tác vụ ở cùng một nơi chưa bao giờ linh hoạt đến thế.
					</p>

					<div className='mt-12 space-y-6'>
						{workManagementViews.map((view) => (
							<div
								key={view.title}
								className='border-b border-border pb-6'
							>
								<div className='flex items-center justify-between cursor-pointer group'>
									<h3
										className={`text-lg font-medium transition-colors ${
											view.active
												? "text-foreground"
												: "text-muted-foreground group-hover:text-foreground"
										}`}
									>
										{view.title}
									</h3>

									<span className='text-muted-foreground group-hover:text-foreground'>
										{view.active ? "−" : "+"}
									</span>
								</div>

								{view.active && (
									<div className='mt-4'>
										<p className='text-base leading-relaxed text-muted-foreground'>
											{view.description}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				<div className='relative'>
					<div className='aspect-video rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-sm overflow-hidden flex'>
                        {/* Sidebar */}
						<div className='w-1/4 border-r border-border bg-muted/30 p-4 space-y-4'>
							<div className='h-3 w-3/4 rounded-full bg-border' />
							<div className='space-y-2'>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className='h-2 w-full rounded-full bg-border/50' />
                                ))}
							</div>
                            <div className='mt-8 h-3 w-1/2 rounded-full bg-border' />
							<div className='space-y-2'>
                                {[1, 2].map((i) => (
                                    <div key={i} className='h-2 w-full rounded-full bg-border/50' />
                                ))}
							</div>
						</div>
                        {/* Main area */}
                        <div className='flex-1 p-6 flex flex-col gap-6'>
                            <div className='flex items-center justify-between'>
                                <div className='h-5 w-1/3 rounded-md bg-foreground/20' />
                                <div className='h-6 w-16 rounded-md bg-primary/20' />
                            </div>
                            <div className='flex-1 rounded-xl border border-border bg-background p-4'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <div className='h-4 w-4 rounded-sm border border-border' />
                                    <div className='h-3 w-1/2 rounded-full bg-muted-foreground/30' />
                                </div>
                                <div className='flex items-center gap-3 mb-4'>
                                    <div className='h-4 w-4 rounded-sm border border-border' />
                                    <div className='h-3 w-2/3 rounded-full bg-muted-foreground/30' />
                                </div>
                                <div className='ml-7 h-20 rounded-lg border border-border bg-muted/20 p-3'>
                                    <div className='h-2 w-1/4 rounded-full bg-primary/40 mb-2' />
                                    <div className='h-2 w-full rounded-full bg-border mb-2' />
                                    <div className='h-2 w-5/6 rounded-full bg-border' />
                                </div>
                            </div>
                        </div>
					</div>
					{/* Glow */}
					<div className='absolute -inset-4 -z-10 bg-primary/5 blur-3xl rounded-3xl' />
				</div>
			</div>
		</div>
	);
};

export default WorkManagement;
