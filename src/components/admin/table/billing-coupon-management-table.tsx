import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Eye, Power } from "lucide-react";
import type { BillingCoupon } from "../shared/billing-admin.types";
import {
	formatDate,
	getCouponStatusClass,
	getCouponStatusLabel,
	getCouponTypeLabel,
} from "../shared/billing-admin.utils";

type Props = {
	coupons: BillingCoupon[];
	onView: (coupon: BillingCoupon) => void;
	onToggleStatus: (couponId: string) => void;
};

export function BillingCouponManagementTable({
	coupons,
	onView,
	onToggleStatus,
}: Props) {
	if (!coupons.length) {
		return (
			<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có coupon phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'>
			<div className='flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-white'>
						Quản lý coupon
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Theo dõi mã giảm giá, trial coupon, usage và trạng thái
						hiệu lực.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{coupons.length} coupons
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1100px] border-collapse'>
					<thead>
						<tr className='border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-neutral-500'>
							<th className='px-5 py-3 font-medium'>Code</th>
							<th className='px-4 py-3 font-medium'>Loại</th>
							<th className='px-4 py-3 font-medium'>Giá trị</th>
							<th className='px-4 py-3 font-medium'>Usage</th>
							<th className='px-4 py-3 font-medium'>Áp dụng</th>
							<th className='px-4 py-3 font-medium'>Hiệu lực</th>
							<th className='px-4 py-3 font-medium'>Trạng thái</th>
							<th className='px-5 py-3 text-right font-medium'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-white/5'>
						{coupons.map((coupon) => (
							<tr
								key={coupon.id}
								className='text-sm text-neutral-200 transition hover:bg-white/[0.03]'
							>
								<td className='px-5 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{coupon.code}
										</p>
										<p className='max-w-[260px] text-xs text-neutral-500'>
											{coupon.description}
										</p>
									</div>
								</td>

								<td className='px-4 py-4 text-neutral-300'>
									{getCouponTypeLabel(coupon.type)}
								</td>

								<td className='px-4 py-4 text-white'>
									{coupon.type === "PERCENT"
										? `${coupon.value}%`
										: coupon.type === "FIXED"
											? `$${coupon.value}`
											: `${coupon.value} ngày`}
								</td>

								<td className='px-4 py-4 text-neutral-300'>
									{coupon.usageCount} / {coupon.maxUsage}
								</td>

								<td className='px-4 py-4'>
									<div className='flex max-w-[240px] flex-wrap gap-2'>
										{coupon.appliesTo.map((item) => (
											<span
												key={item}
												className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'
											>
												{item}
											</span>
										))}
									</div>
								</td>

								<td className='px-4 py-4 text-neutral-300'>
									<div className='space-y-1'>
										<p>{formatDate(coupon.startAt)}</p>
										<p className='text-xs text-neutral-500'>
											đến {formatDate(coupon.endAt)}
										</p>
									</div>
								</td>

								<td className='px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getCouponStatusClass(
											coupon.status,
										)}`}
									>
										{getCouponStatusLabel(coupon.status)}
									</span>
								</td>

								<td className='px-5 py-4'>
									<div className='flex justify-end'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
													<Ellipsis className='h-4 w-4' />
												</button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align='end'
												className='w-56 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() =>
														onView(coupon)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem / chỉnh sửa
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-white/10' />

												<DropdownMenuItem
													onClick={() =>
														onToggleStatus(
															coupon.id,
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Power className='mr-2 h-4 w-4' />
													{coupon.status === "ACTIVE"
														? "Tắt coupon"
														: "Bật coupon"}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
