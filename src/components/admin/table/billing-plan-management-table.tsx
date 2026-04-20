import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Eye, Power } from "lucide-react";
import type { BillingPlan } from "../shared/billing-admin.types";
import {
	formatCurrency,
	formatRelativeTime,
	getPlanStatusClass,
	getPlanStatusLabel,
} from "../shared/billing-admin.utils";

type Props = {
	plans: BillingPlan[];
	onView: (plan: BillingPlan) => void;
	onToggleStatus: (planId: string) => void;
};

export function BillingPlanManagementTable({
	plans,
	onView,
	onToggleStatus,
}: Props) {
	if (!plans.length) {
		return (
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có gói dịch vụ phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Quản lý gói dịch vụ
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Tạo, chỉnh sửa, tắt bán và cấu hình giới hạn cho từng
						gói.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{plans.length} plans
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1300px] border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>Gói</th>
							<th className='px-4 py-2 font-medium'>Giá</th>
							<th className='px-4 py-2 font-medium'>Giới hạn</th>
							<th className='px-4 py-2 font-medium'>Tính năng</th>
							<th className='px-4 py-2 font-medium'>Trial</th>
							<th className='px-4 py-2 font-medium'>
								Subscription
							</th>
							<th className='px-4 py-2 font-medium'>
								Trạng thái
							</th>
							<th className='px-4 py-2 font-medium'>Cập nhật</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{plans.map((plan) => (
							<tr
								key={plan.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{plan.name}
										</p>
										<p className='text-xs text-neutral-500'>
											{plan.code}
										</p>
										<p className='max-w-[260px] text-xs text-neutral-500'>
											{plan.description}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{formatCurrency(plan.monthlyPrice)}{" "}
											/ tháng
										</p>
										<p className='text-xs text-neutral-500'>
											{formatCurrency(plan.yearlyPrice)} /
											năm
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex max-w-[260px] flex-wrap gap-2'>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{plan.workspaceLimit} workspace
										</span>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{plan.membersLimit} member
										</span>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{plan.projectsLimit} project
										</span>
										<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
											{plan.storageLimitGb} GB
										</span>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex max-w-[280px] flex-wrap gap-2'>
										{plan.features
											.slice(0, 2)
											.map((feature) => (
												<span
													key={feature}
													className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'
												>
													{feature}
												</span>
											))}
										{plan.features.length > 2 && (
											<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
												+{plan.features.length - 2} tính
												năng
											</span>
										)}
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{plan.trialDays > 0
										? `${plan.trialDays} ngày`
										: "Không"}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{plan.activeSubscriptions}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getPlanStatusClass(
											plan.status,
										)}`}
									>
										{getPlanStatusLabel(plan.status)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{formatRelativeTime(plan.updatedAt)}
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
												className='w-56 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() => onView(plan)}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem / chỉnh sửa
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-white/10' />

												<DropdownMenuItem
													onClick={() =>
														onToggleStatus(plan.id)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Power className='mr-2 h-4 w-4' />
													{plan.status === "ACTIVE"
														? "Tắt gói"
														: "Bật gói"}
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
