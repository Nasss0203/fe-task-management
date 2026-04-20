import { LifeBuoy } from "lucide-react";

export function SupportAdminHeader() {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-white'>
					Support
				</h1>
				<p className='max-w-3xl text-sm text-neutral-400'>
					Hỗ trợ vận hành cho khách hàng và workspace khi gặp lỗi như
					thanh toán, invite member, sync dữ liệu, login và các yêu
					cầu hỗ trợ khác.
				</p>
			</div>

			<div className='inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-400'>
				<LifeBuoy className='h-4 w-4' />
				Customer Ops
			</div>
		</div>
	);
}
