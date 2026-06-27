import { BadgePercent, CreditCard, Download, ShieldCheck } from "lucide-react";

type Props = {
	onCreatePlan: () => void;
	onCreateCoupon: () => void;
};

export function BillingAdminHeader({ onCreatePlan, onCreateCoupon }: Props) {
	return (
		<div className='flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#475569]'>
					<ShieldCheck className='h-4 w-4 text-[#2563EB]' />
					Billing control center
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl'>
					Plans / Billing
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-[#64748B]'>
					Quản lý gói dịch vụ, subscription, coupon, trial và doanh thu thanh toán trên toàn hệ thống.
				</p>
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<button className='inline-flex h-10 items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC]'>
					<Download className='h-4 w-4' />
					Xuất báo cáo
				</button>

				<button
					onClick={onCreatePlan}
					className='inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-medium text-white transition hover:bg-[#1D4ED8]'
				>
					<CreditCard className='h-4 w-4' />
					Tạo gói mới
				</button>

				<button
					onClick={onCreateCoupon}
					className='inline-flex h-10 items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm font-medium text-[#334155] transition hover:bg-[#F8FAFC]'
				>
					<BadgePercent className='h-4 w-4' />
					Tạo coupon
				</button>
			</div>
		</div>
	);
}
