import { BadgePercent, CreditCard, Download, ShieldCheck } from "lucide-react";

type Props = {
	onCreatePlan: () => void;
	onCreateCoupon: () => void;
};

export function BillingAdminHeader({ onCreatePlan, onCreateCoupon }: Props) {
	return (
		<div className='flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<div className='flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500'>
					<ShieldCheck className='h-4 w-4 text-sky-400' />
					Billing control center
				</div>
				<h1 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>
					Plans / Billing
				</h1>
				<p className='max-w-3xl text-sm leading-6 text-neutral-400'>
					Quản lý gói dịch vụ, subscription, coupon, trial và doanh
					thu thanh toán trên toàn hệ thống.
				</p>
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<button className='inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-4 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white'>
					<Download className='h-4 w-4' />
					Xuất báo cáo
				</button>

				<button
					onClick={onCreatePlan}
					className='inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10'
				>
					<CreditCard className='h-4 w-4' />
					Tạo gói mới
				</button>

				<button
					onClick={onCreateCoupon}
					className='inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10'
				>
					<BadgePercent className='h-4 w-4' />
					Tạo coupon
				</button>
			</div>
		</div>
	);
}
