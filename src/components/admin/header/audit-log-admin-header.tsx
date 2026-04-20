import { ShieldAlert } from "lucide-react";

export function AuditLogAdminHeader() {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-white'>
					Audit Logs
				</h1>
				<p className='max-w-3xl text-sm text-neutral-400'>
					Theo dõi các hành động quan trọng trên toàn hệ thống như tạo
					/ xóa workspace, khóa tài khoản, đổi role, thay đổi billing
					và đăng nhập admin.
				</p>
			</div>

			<div className='inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400'>
				<ShieldAlert className='h-4 w-4' />
				System Audit
			</div>
		</div>
	);
}
