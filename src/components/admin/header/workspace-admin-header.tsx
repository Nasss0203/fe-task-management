import { Building2 } from "lucide-react";

export function WorkspaceAdminHeader() {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-white'>
					Quản lý workspace
				</h1>
				<p className='max-w-3xl text-sm text-neutral-400'>
					Xem tất cả workspace trên hệ thống, theo dõi số thành viên,
					project, board, task, dung lượng sử dụng, đồng thời khóa,
					xóa mềm, chuyển gói và gán owner mới khi cần.
				</p>
			</div>

			<div className='inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400'>
				<Building2 className='h-4 w-4' />
				Workspace Control
			</div>
		</div>
	);
}
