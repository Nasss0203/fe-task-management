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
			<div className='rounded-2xl border border-border bg-white p-10 text-center'>
				<p className='text-sm text-[#64748B]'>
					Không có gói dịch vụ phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-border bg-white shadow-sm'>
			<div className='flex items-start justify-between gap-4 border-b border-border px-5 py-4'>
				<div>
					<h2 className='text-lg font-semibold text-[#0F172A]'>
						Quản lý gói dịch vụ
					</h2>
					<p className='mt-1 text-sm text-[#64748B]'>
						Tạo, chỉnh sửa, tắt bán và cấu hình giới hạn cho từng gói.
					</p>
				</div>

				<div className='rounded-full border border-border bg-[#F8FAFC] px-3 py-1 text-sm text-[#475569]'>
					{plans.length} plans
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1180px] border-collapse'>
					<thead>
						<tr className='border-b border-border bg-[#F8FAFC] text-left text-xs uppercase tracking-[0.12em] text-[#475569]'>
							<th className='px-5 py-3 font-medium'>Gói</th>
							<th className='px-4 py-3 font-medium'>Giá</th>
							<th className='px-4 py-3 font-medium'>Subscription</th>
							<th className='px-4 py-3 font-medium'>Giới hạn</th>
							<th className='px-4 py-3 font-medium'>Tính năng</th>
							<th className='px-4 py-3 font-medium'>Trạng thái</th>
							<th className='px-4 py-3 font-medium'>Cập nhật</th>
							<th className='px-5 py-3 text-right font-medium'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-[#EEF2F6]'>
						{plans.map((plan) => (
							<tr
								key={plan.id}
								className='text-sm text-[#1E293B] transition hover:bg-[#F8FAFC]'
							>
								<td className='px-5 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-[#0F172A]'>
											{plan.name}
										</p>
										<p className='text-xs text-[#64748B]'>
											{plan.code}
										</p>
										<p className='max-w-[260px] text-xs text-[#64748B]'>
											{plan.description}
										</p>
									</div>
								</td>

								<td className='px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-[#0F172A]'>
											{formatCurrency(plan.monthlyPrice)}{" "}
											/ tháng
										</p>
										<p className='text-xs text-[#64748B]'>
											{formatCurrency(plan.yearlyPrice)} /
											năm
										</p>
									</div>
								</td>

								<td className='px-4 py-4 font-medium text-[#0F172A]'>
									{plan.activeSubscriptions}
								</td>

								<td className='px-4 py-4'>
									<div className='flex max-w-[260px] flex-wrap gap-2'>
										<span className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'>
											{plan.workspaceLimit} workspace
										</span>
										<span className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'>
											{plan.membersLimit} member
										</span>
										<span className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'>
											{plan.projectsLimit} project
										</span>
										<span className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'>
											{plan.storageLimitGb} GB
										</span>
									</div>
								</td>

								<td className='px-4 py-4'>
									<div className='flex max-w-[280px] flex-wrap gap-2'>
										{plan.features
											.slice(0, 2)
											.map((feature) => (
												<span
													key={feature}
													className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'
												>
													{feature}
												</span>
											))}
										{plan.features.length > 2 && (
											<span className='rounded-full border border-border bg-[#F8FAFC] px-2.5 py-1 text-xs text-[#475569]'>
												+{plan.features.length - 2} tính
												năng
											</span>
										)}
									</div>
								</td>

								<td className='px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getPlanStatusClass(
											plan.status,
										)}`}
									>
										{getPlanStatusLabel(plan.status)}
									</span>
								</td>

								<td className='px-4 py-4 text-[#334155]'>
									{formatRelativeTime(plan.updatedAt)}
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
													onClick={() => onView(plan)}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem / chỉnh sửa
												</DropdownMenuItem>

												<DropdownMenuSeparator className='my-1 bg-border' />

												<DropdownMenuItem
													onClick={() =>
														onToggleStatus(plan.id)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
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
