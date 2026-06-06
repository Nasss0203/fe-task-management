export function DashboardHeader() {
	return (
		<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight text-white'>
					Tổng quan hệ thống
				</h1>
				<p className='text-sm text-neutral-400'>
					Theo dõi người dùng, workspace, task, billing và tình trạng hệ thống.
				</p>
			</div>

			<div className='flex items-center gap-2'>
				<button className='rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 transition hover:bg-neutral-800'>
					Xuất báo cáo
				</button>
				<button className='rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'>
					Xem audit logs
				</button>
			</div>
		</div>
	);
}
