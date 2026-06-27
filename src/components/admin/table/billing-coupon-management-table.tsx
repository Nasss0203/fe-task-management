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
	formatCurrency,
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
			<div className='rounded-2xl border border-border bg-white p-10 text-center'>
				<p className='text-sm text-[#64748B]'>
					Không có coupon phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-border bg-white shadow-sm'>
			<div className='flex items-start justify-between gap-4 border-b border-border px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-[#0F172A]'>
						Quản lý coupon
					</h2>
					<p className='mt-1 text-sm text-[#64748B]'>
						Theo dõi mã giảm giá, trial coupon, usage và trạng thái
						hiệu lực.
					</p>
				</div>

				<div className='rounded-full border border-border bg-[#F8FAFC] px-3 py-1 text-sm text-[#475569]'>
					{coupons.length} coupons
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1100px] border-collapse'>
					<thead>
						<tr className='border-b border-border bg-[#F8FAFC] text-left text-xs uppercase tracking-[0.12em] text-[#475569]'>
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

					<tbody className='divide-y divide-[#EEF2F6]'>
						{coupons.map((coupon) => (
							<tr
								key={coupon.id}
								className='text-sm text-[#1E293B] transition hover:bg-[#F8FAFC]'
							>
								<td className='px-5 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-[#0F172A]'>
											{coupon.code}
										</p>
										<p className='max-w-[260px] text-xs text-[#64748B]'>
											{coupon.description}
										</p>
									</div>
								</td>

								<td className='px-4 py-4 text-[#334155]'>
									{getCouponTypeLabel(coupon.type)}
								</td>

								<td className='px-4 py-4 font-medium text-[#0F172A]'>
									{coupon.type === "PERCENT"
										? `${coupon.value}%`
										: coupon.type === "FIXED"
											? formatCurrency(coupon.value)
											: `${coupon.value} ngày`}
								</td>

								<td className='px-4 py-4 text-[#334155]'>
									{coupon.usageCount} / {coupon.maxUsage}
								</td>

								<td className='px-4 py-4'>
									<div className='flex max-w-[240px] flex-wrap gap-2'>
										{coupon.appliesTo.map((item) => (
											<span
												key={item}
												className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'
											>
												{item}
											</span>
										))}
									</div>
								</td>

								<td className='px-4 py-4 text-[#334155]'>
									<div className='space-y-1'>
										<p>{formatDate(coupon.startAt)}</p>
										<p className='text-xs text-[#64748B]'>
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
												<button className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]'>
													<Ellipsis className='h-4 w-4' />
												</button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align='end'
												className='w-56 rounded-2xl border border-border bg-white p-2 text-[#1E293B] shadow-xl'
											>
												<DropdownMenuItem
													onClick={() =>
														onView(coupon)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem / chỉnh sửa
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-border' />

												<DropdownMenuItem
													onClick={() =>
														onToggleStatus(
															coupon.id,
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
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
