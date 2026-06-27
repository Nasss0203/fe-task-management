import { ShieldCheck } from "lucide-react";

export function UserAdminHeader() {
	return (
		<div className='flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#475569]'>
					<ShieldCheck className='h-4 w-4 text-[#2563EB]' />
					Admin console
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl'>
					Quản lý người dùng
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-[#64748B]'>
					Quản lý trạng thái tài khoản, phân quyền system admin và theo dõi tăng trưởng, hoạt động của user trên toàn hệ thống.
				</p>
			</div>

			<div className='inline-flex w-fit items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#1D4ED8]'>
				<ShieldCheck className='h-4 w-4' />
				Super Admin
			</div>
		</div>
	);
}
