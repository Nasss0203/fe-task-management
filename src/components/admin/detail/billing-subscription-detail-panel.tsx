"use client";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
	BillingCycle,
	BillingPlan,
	SubscriptionStatus,
	WorkspaceSubscription,
} from "../shared/billing-admin.types";
import {
	formatCurrency,
	formatDate,
	getCycleLabel,
	getPaymentStatusClass,
	getSubscriptionStatusClass,
	getSubscriptionStatusLabel,
} from "../shared/billing-admin.utils";

type Props = {
	subscription: WorkspaceSubscription | null;
	plans: BillingPlan[];
	onClose: () => void;
	onSave: (subscription: WorkspaceSubscription) => void;
	onManualRenew: (subscriptionId: string) => void;
	onGrantTrial: (subscriptionId: string) => void;
};

export function BillingSubscriptionDetailPanel({
	subscription,
	plans,
	onClose,
	onSave,
	onManualRenew,
	onGrantTrial,
}: Props) {
	const [open, setOpen] = useState(Boolean(subscription));
	const [form, setForm] = useState<WorkspaceSubscription | null>(
		subscription,
	);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current);
			}
		};
	}, []);

	const selectedPlan = useMemo(() => {
		if (!form) return null;
		return plans.find((plan) => plan.code === form.planCode) ?? null;
	}, [form, plans]);

	const handleRequestClose = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
		}

		setOpen(false);

		closeTimerRef.current = setTimeout(() => {
			onClose();
		}, 300);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			handleRequestClose();
			return;
		}

		setOpen(true);
	};

	if (!form) return null;

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								Chi tiết subscription
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Xem payment history, đổi plan, cấp trial và gia
								hạn thủ công.
							</DrawerDescription>
						</div>

						<Button
							type='button'
							variant='ghost'
							onClick={handleRequestClose}
							className='h-9 rounded-xl border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white'
						>
							Close
						</Button>
					</div>
				</DrawerHeader>

				<div className='no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 py-4'>
					<div className='space-y-4'>
						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thông tin subscription
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-neutral-500'>
										Workspace
									</p>
									<p className='text-white'>
										{form.workspaceName}
									</p>
								</div>

								<div>
									<p className='text-neutral-500'>Owner</p>
									<p className='text-white'>
										{form.ownerName}
									</p>
									<p className='text-xs text-neutral-500'>
										{form.ownerEmail}
									</p>
								</div>

								<div className='flex flex-wrap gap-2 pt-1'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getSubscriptionStatusClass(
											form.status,
										)}`}
									>
										{getSubscriptionStatusLabel(
											form.status,
										)}
									</span>

									<span className='inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
										{getCycleLabel(form.billingCycle)}
									</span>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div>
										<p className='text-neutral-500'>
											Ngày bắt đầu
										</p>
										<p className='text-white'>
											{formatDate(form.startedAt)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Gia hạn kế tiếp
										</p>
										<p className='text-white'>
											{formatDate(form.renewAt)}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Cập nhật subscription
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Plan
									</label>
									<select
										value={form.planCode}
										onChange={(e) => {
											const nextCode = e.target.value;
											const nextPlan = plans.find(
												(plan) =>
													plan.code === nextCode,
											);

											setForm((prev) => {
												if (!prev) return prev;

												return {
													...prev,
													planCode: nextCode,
													planName:
														nextPlan?.name ??
														prev.planName,
													amount: nextPlan
														? prev.billingCycle ===
															"MONTHLY"
															? nextPlan.monthlyPrice
															: nextPlan.yearlyPrice
														: prev.amount,
												};
											});
										}}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										{plans.map((plan) => (
											<option
												key={plan.id}
												value={plan.code}
											>
												{plan.name}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Chu kỳ
									</label>
									<select
										value={form.billingCycle}
										onChange={(e) => {
											const nextCycle = e.target
												.value as BillingCycle;

											setForm((prev) => {
												if (!prev) return prev;

												return {
													...prev,
													billingCycle: nextCycle,
													amount: selectedPlan
														? nextCycle ===
															"MONTHLY"
															? selectedPlan.monthlyPrice
															: selectedPlan.yearlyPrice
														: prev.amount,
												};
											});
										}}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										<option value='MONTHLY'>Tháng</option>
										<option value='YEARLY'>Năm</option>
									</select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Trạng thái
									</label>
									<select
										value={form.status}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															status: e.target
																.value as SubscriptionStatus,
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										<option value='ACTIVE'>Active</option>
										<option value='TRIAL'>Trial</option>
										<option value='EXPIRED'>Expired</option>
										<option value='CANCELED'>
											Canceled
										</option>
									</select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Coupon code
									</label>
									<input
										value={form.couponCode ?? ""}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															couponCode:
																e.target
																	.value ||
																null,
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Số tiền
									</label>
									<input
										type='number'
										value={form.amount}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															amount: Number(
																e.target.value,
															),
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Phương thức thanh toán
									</label>
									<input
										value={form.paymentMethod}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															paymentMethod:
																e.target.value,
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>

								<button
									onClick={() => onSave(form)}
									className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
								>
									Lưu subscription
								</button>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Support actions
							</h3>

							<div className='space-y-3'>
								<button
									onClick={() => onManualRenew(form.id)}
									className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 text-sm font-medium text-white hover:bg-white/5'
								>
									Gia hạn thủ công
								</button>

								<button
									onClick={() => onGrantTrial(form.id)}
									className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 text-sm font-medium text-white hover:bg-white/5'
								>
									Cấp trial 14 ngày
								</button>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Lịch sử thanh toán
							</h3>

							<div className='space-y-3'>
								{form.paymentHistory.length ? (
									form.paymentHistory.map((payment) => (
										<div
											key={payment.id}
											className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
										>
											<div className='flex items-start justify-between gap-4'>
												<div className='min-w-0'>
													<p className='truncate text-sm font-medium text-white'>
														{payment.invoiceNo}
													</p>
													<p className='text-xs text-neutral-500'>
														{formatDate(
															payment.paidAt,
														)}
													</p>
												</div>

												<div className='shrink-0 text-right'>
													<p className='text-sm font-medium text-white'>
														{formatCurrency(
															payment.amount,
														)}
													</p>
													<p
														className={`text-xs ${getPaymentStatusClass(
															payment.status,
														)}`}
													>
														{payment.status}
													</p>
												</div>
											</div>
										</div>
									))
								) : (
									<p className='text-sm text-neutral-500'>
										Chưa có thanh toán nào.
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<DrawerFooter className='border-t border-white/10 px-6 py-4'>
					<Button
						variant='outline'
						onClick={handleRequestClose}
						className='h-11 rounded-2xl border-white/10 bg-[#111111] text-white hover:bg-white/5 hover:text-white'
					>
						Close
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
