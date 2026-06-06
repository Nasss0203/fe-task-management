import { ShieldCheck } from "lucide-react";

export function UserAdminHeader() {
	return (
		<div className='flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500'>
					<ShieldCheck className='h-4 w-4 text-sky-400' />
					Admin console
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
					Quản lý người dùng
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-neutral-400'>
					Quản lý trạng thái tài khoản, phân quyền system admin và
					theo dõi tăng trưởng, hoạt động của user trên toàn hệ thống.
				</p>
			</div>

			<div className='inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300'>
				<ShieldCheck className='h-4 w-4' />
				Super Admin
			</div>
		</div>
	);
}
