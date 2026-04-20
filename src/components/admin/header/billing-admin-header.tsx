import { BadgePercent, CreditCard } from "lucide-react";

type Props = {
	onCreatePlan: () => void;
	onCreateCoupon: () => void;
};

export function BillingAdminHeader({ onCreatePlan, onCreateCoupon }: Props) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-white'>
					Plans / Billing
				</h1>
				<p className='max-w-3xl text-sm text-neutral-400'>
					Quản lý gói dịch vụ, subscription, lịch sử thanh toán,
					trial, gia hạn thủ công và coupon khuyến mãi trên toàn hệ
					thống.
				</p>
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<button
					onClick={onCreatePlan}
					className='inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10'
				>
					<CreditCard className='h-4 w-4' />
					Tạo gói mới
				</button>

				<button
					onClick={onCreateCoupon}
					className='inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10'
				>
					<BadgePercent className='h-4 w-4' />
					Tạo coupon
				</button>
			</div>
		</div>
	);
}
