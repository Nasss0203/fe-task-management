import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Clock3,
	CreditCard,
	Ellipsis,
	Eye,
	XCircle,
} from "lucide-react";
import {
	adminMenuContentClass,
	adminMenuItemClass,
	adminMenuSeparatorClass,
} from "../shared/theme";
import type { WorkspaceSubscription } from "../shared/billing-admin.types";
import {
	formatCurrency,
	formatDate,
	getCycleLabel,
	getSubscriptionStatusClass,
	getSubscriptionStatusLabel,
} from "../shared/billing-admin.utils";

const getPaymentMethodLabel = (paymentMethod: string) => {
	switch (paymentMethod.toUpperCase()) {
		case "VISA":
			return "Visa";
		case "MASTERCARD":
			return "Mastercard";
		case "STRIPE":
			return "Stripe";
		case "VNPAY":
			return "VNPay";
		case "MOMO":
			return "MoMo";
		case "MANUAL":
			return "Thủ công";
		default:
			return paymentMethod || "Không xác định";
	}
};

type Props = {
	subscriptions: WorkspaceSubscription[];
	onView: (subscription: WorkspaceSubscription) => void;
	onToggleStatus: (subscriptionId: string) => void;
	isUpdatingSubscription?: boolean;
};

export function BillingSubscriptionManagementTable({
	subscriptions,
	onView,
	onToggleStatus,
	isUpdatingSubscription = false,
}: Props) {
	if (!subscriptions.length) {
		return (
			<div className='rounded-2xl border border-border bg-white p-10 text-center'>
				<p className='text-sm text-[#64748B]'>
					Không có subscription phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-border bg-white shadow-sm'>
			<div className='flex items-start justify-between gap-4 border-b border-border px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-[#0F172A]'>
						Theo dõi subscriptions
					</h2>
					<p className='mt-1 text-sm text-[#64748B]'>
						Quan sát trạng thái active, expired, canceled và
						gia hạn thủ công khi cần.
					</p>
				</div>

				<div className='rounded-full border border-border bg-[#F8FAFC] px-3 py-1 text-sm text-[#475569]'>
					{subscriptions.length} subscriptions
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1120px] border-collapse'>
					<thead>
						<tr className='border-b border-border bg-[#F8FAFC] text-left text-xs uppercase tracking-[0.12em] text-[#475569]'>
							<th className='px-5 py-3 font-medium'>User</th>
							<th className='px-4 py-3 font-medium'>Plan</th>
							<th className='px-4 py-3 font-medium'>Trạng thái</th>
							<th className='px-4 py-3 font-medium'>Chu kỳ</th>
							<th className='px-4 py-3 font-medium'>Thanh toán</th>
							<th className='px-4 py-3 font-medium'>Amount</th>
							<th className='px-4 py-3 font-medium'>Gia hạn</th>
							<th className='px-5 py-3 text-right font-medium'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-[#EEF2F6]'>
						{subscriptions.map((subscription) => (
							<tr
								key={subscription.rowId}
								className='text-sm text-[#1E293B] transition hover:bg-[#F8FAFC]'
							>
								<td className='px-5 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-[#0F172A]'>
											{subscription.userName}
										</p>
										<p className='text-xs text-[#64748B]'>
											{subscription.userEmail}
										</p>
									</div>
								</td>

								<td className='px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-[#0F172A]'>
											{subscription.planName}
										</p>
										<p className='text-xs text-[#64748B]'>
											{subscription.planCode}
										</p>
									</div>
								</td>

								<td className='px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSubscriptionStatusClass(
											subscription.status,
										)}`}
									>
										{getSubscriptionStatusLabel(
											subscription.status,
										)}
									</span>
								</td>

								<td className='px-4 py-4 text-[#334155]'>
									{getCycleLabel(subscription.billingCycle)}
								</td>

								<td className='px-4 py-4'>
									<span className='inline-flex items-center gap-2 rounded-full border border-border bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#334155]'>
										<CreditCard className='h-3.5 w-3.5 text-[#64748B]' />
										{getPaymentMethodLabel(
											subscription.paymentMethod,
										)}
									</span>
								</td>

								<td className='px-4 py-4 font-medium text-[#0F172A]'>
									{formatCurrency(subscription.amount)}
								</td>

								<td className='px-4 py-4'>
									<div className='inline-flex items-center gap-2 text-[#334155]'>
										<Clock3 className='h-4 w-4 text-[#64748B]' />
										<span>
											{formatDate(subscription.renewAt)}
										</span>
									</div>
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
												className={`w-60 ${adminMenuContentClass}`}
											>
												<DropdownMenuItem
													onClick={() =>
														onView(subscription)
													}
													className={adminMenuItemClass}
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>

												<DropdownMenuSeparator
													className={adminMenuSeparatorClass}
												/>

												<DropdownMenuItem
													onClick={() =>
														onToggleStatus(
															subscription.id,
														)
													}
													disabled={
														isUpdatingSubscription
													}
													className={adminMenuItemClass}
												>
													<XCircle className='mr-2 h-4 w-4' />
													{subscription.status ===
													"CANCELED"
														? "Kích hoạt lại"
														: "Hủy subscription"}
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
