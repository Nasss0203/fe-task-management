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
};

export function BillingSubscriptionManagementTable({
	subscriptions,
	onView,
	onManualRenew,
	onGrantTrial,
	onToggleStatus,
}: Props) {
	if (!subscriptions.length) {
		return (
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có subscription phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Theo dõi subscriptions
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Quan sát trạng thái active / expired / canceled, hỗ trợ
						trial và gia hạn thủ công.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{subscriptions.length} subscriptions
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-337.5 border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>Workspace</th>
							<th className='px-4 py-2 font-medium'>Owner</th>
							<th className='px-4 py-2 font-medium'>Plan</th>
							<th className='px-4 py-2 font-medium'>
								Trạng thái
							</th>
							<th className='px-4 py-2 font-medium'>Chu kỳ</th>
							<th className='px-4 py-2 font-medium'>Amount</th>
							<th className='px-4 py-2 font-medium'>Gia hạn</th>
							<th className='px-4 py-2 font-medium'>Coupon</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{subscriptions.map((subscription) => (
							<tr
								key={subscription.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{subscription.workspaceName}
										</p>
										<p className='text-xs text-neutral-500'>
											{subscription.workspaceId}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{subscription.ownerName}
										</p>
										<p className='text-xs text-neutral-500'>
											{subscription.ownerEmail}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{subscription.planName}
										</p>
										<p className='text-xs text-neutral-500'>
											{subscription.planCode}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
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

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{getCycleLabel(subscription.billingCycle)}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-white'>
									{formatCurrency(subscription.amount)}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='inline-flex items-center gap-2 text-neutral-300'>
										<Clock3 className='h-4 w-4 text-neutral-500' />
										<span>
											{formatDate(subscription.renewAt)}
										</span>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{subscription.couponCode ?? "-"}
								</td>

								<td className='rounded-r-3xl border-y border-r border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex justify-end'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
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
