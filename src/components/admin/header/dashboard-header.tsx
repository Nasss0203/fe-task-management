export function DashboardHeader() {
	return (
		<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight text-[#0F172A]'>
					Tổng quan hệ thống
				</h1>
				<p className='text-sm text-[#64748B]'>
					Theo dõi người dùng, workspace, task, billing và tình trạng hệ thống.
				</p>
			</div>

			<div className='flex items-center gap-2'>
				<button className='rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC]'>
					Xuất báo cáo
				</button>
				<button className='rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1D4ED8]'>
					Xem audit logs
				</button>
			</div>
		</div>
	);
}
