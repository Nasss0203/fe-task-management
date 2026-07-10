import { ShieldCheck } from "lucide-react";

export function BillingAdminHeader() {
	return (
		<div className='border-b border-border pb-5'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#475569]'>
					<ShieldCheck className='h-4 w-4 text-[#2563EB]' />
					Billing control center
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl'>
					Plans / Billing
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-[#64748B]'>
					Quản lý gói dịch vụ, subscription và doanh thu thanh toán trên toàn hệ thống.
				</p>
			</div>
		</div>
	);
}
