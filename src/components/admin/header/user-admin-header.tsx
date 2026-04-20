import { ShieldCheck } from "lucide-react";

export function UserAdminHeader() {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-white'>
					Quản lý người dùng
				</h1>
				<p className='max-w-2xl text-sm text-neutral-400'>
					Xem danh sách tất cả user, quản lý trạng thái tài khoản,
					phân quyền system admin và theo dõi lịch sử hoạt động trên
					toàn hệ thống.
				</p>
			</div>

			<div className='inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-400'>
				<ShieldCheck className='h-4 w-4' />
				Super Admin
			</div>
		</div>
	);
}
