import { Building2, ShieldCheck } from "lucide-react";

export function WorkspaceAdminHeader() {
	return (
		<div className='flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500'>
					<ShieldCheck className='h-4 w-4 text-sky-400' />
					Admin console
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
					Quản lý workspace
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-neutral-400'>
					Theo dõi workspace toàn hệ thống, kiểm tra owner, mức sử dụng,
					trạng thái hoạt động và chuyển gói khi cần xử lý vận hành.
				</p>
			</div>

			<div className='inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300'>
				<Building2 className='h-4 w-4' />
				Workspace Control
			</div>
		</div>
	);
}
