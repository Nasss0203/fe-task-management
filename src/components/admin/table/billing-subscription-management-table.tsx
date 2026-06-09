import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Clock3,
	Ellipsis,
	Eye,
	RefreshCcw,
	Sparkles,
	XCircle,
} from "lucide-react";
import type { WorkspaceSubscription } from "../shared/billing-admin.types";
import {
	formatCurrency,
	formatDate,
	getCycleLabel,
	getSubscriptionStatusClass,
	getSubscriptionStatusLabel,
} from "../shared/billing-admin.utils";

type Props = {
	subscriptions: WorkspaceSubscription[];
	onView: (subscription: WorkspaceSubscription) => void;
	onManualRenew: (subscriptionId: string) => void;
	onGrantTrial: (subscriptionId: string) => void;
	onToggleStatus: (subscriptionId: string) => void;
	isUpdatingSubscription?: boolean;
};

export function BillingSubscriptionManagementTable({
	subscriptions,
	onView,
	onManualRenew,
	onGrantTrial,
	onToggleStatus,
	isUpdatingSubscription = false,
}: Props) {
	if (!subscriptions.length) {
		return (
			<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có subscription phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'>
			<div className='flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-white'>
						Theo dõi subscriptions
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Quan sát trạng thái active, trial, expired, canceled và
						gia hạn thủ công khi cần.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{subscriptions.length} subscriptions
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1260px] border-collapse'>
					<thead>
						<tr className='border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-neutral-500'>
							<th className='px-5 py-3 font-medium'>Workspace</th>
							<th className='px-4 py-3 font-medium'>Owner</th>
							<th className='px-4 py-3 font-medium'>Plan</th>
							<th className='px-4 py-3 font-medium'>Trạng thái</th>
							<th className='px-4 py-3 font-medium'>Chu kỳ</th>
							<th className='px-4 py-3 font-medium'>Amount</th>
							<th className='px-4 py-3 font-medium'>Gia hạn</th>
							<th className='px-4 py-3 font-medium'>Coupon</th>
							<th className='px-5 py-3 text-right font-medium'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-white/5'>
						{subscriptions.map((subscription) => (
							<tr
								key={subscription.rowId}
								className='text-sm text-neutral-200 transition hover:bg-white/[0.03]'
							>
								<td className='px-5 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{subscription.workspaceName}
										</p>
										<p className='text-xs text-neutral-500'>
											{subscription.workspaceId}
										</p>
									</div>
								</td>

								<td className='px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{subscription.ownerName}
										</p>
										<p className='text-xs text-neutral-500'>
											{subscription.ownerEmail}
										</p>
									</div>
								</td>

								<td className='px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{subscription.planName}
										</p>
										<p className='text-xs text-neutral-500'>
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

								<td className='px-4 py-4 text-neutral-300'>
									{getCycleLabel(subscription.billingCycle)}
								</td>

								<td className='px-4 py-4 text-white'>
									{formatCurrency(subscription.amount)}
								</td>

								<td className='px-4 py-4'>
									<div className='inline-flex items-center gap-2 text-neutral-300'>
										<Clock3 className='h-4 w-4 text-neutral-500' />
										<span>
											{formatDate(subscription.renewAt)}
										</span>
									</div>
								</td>

								<td className='px-4 py-4 text-neutral-300'>
									{subscription.couponCode ?? "-"}
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
												className='w-60 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() =>
														onView(subscription)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														onManualRenew(
															subscription.id,
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<RefreshCcw className='mr-2 h-4 w-4' />
													Gia hạn thủ công
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														onGrantTrial(
															subscription.id,
														)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Sparkles className='mr-2 h-4 w-4' />
													Cấp trial 14 ngày
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-white/10' />

												<DropdownMenuItem
													onClick={() =>
														onToggleStatus(
															subscription.id,
														)
													}
													disabled={
														isUpdatingSubscription
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
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
