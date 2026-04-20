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
import { useEffect, useRef, useState } from "react";
import type { BillingPlan, PlanStatus } from "../shared/billing-admin.types";

type Props = {
	plan: BillingPlan | null;
	onClose: () => void;
	onSave: (plan: BillingPlan) => void;
};

export function BillingPlanDetailPanel({ plan, onClose, onSave }: Props) {
	const [open, setOpen] = useState(Boolean(plan));
	const [form, setForm] = useState<BillingPlan | null>(plan);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current);
			}
		};
	}, []);

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
								{plan
									? "Chỉnh sửa gói dịch vụ"
									: "Tạo gói dịch vụ"}
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Cấu hình giá, giới hạn và tính năng cho gói.
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
								Thông tin gói
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Tên gói
									</label>
									<input
										value={form.name}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															name: e.target
																.value,
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Mã gói
									</label>
									<input
										value={form.code}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															code: e.target.value.toUpperCase(),
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Mô tả
									</label>
									<textarea
										value={form.description}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															description:
																e.target.value,
														}
													: prev,
											)
										}
										rows={4}
										className='w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none'
									/>
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
																.value as PlanStatus,
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									>
										<option value='DRAFT'>Bản nháp</option>
										<option value='ACTIVE'>Đang bán</option>
										<option value='DISABLED'>Đã tắt</option>
									</select>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Giá và trial
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Giá tháng
									</label>
									<input
										type='number'
										value={form.monthlyPrice}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															monthlyPrice:
																Number(
																	e.target
																		.value,
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
										Giá năm
									</label>
									<input
										type='number'
										value={form.yearlyPrice}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															yearlyPrice: Number(
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
										Trial (ngày)
									</label>
									<input
										type='number'
										value={form.trialDays}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															trialDays: Number(
																e.target.value,
															),
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Giới hạn
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Workspace
									</label>
									<input
										type='number'
										value={form.workspaceLimit}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															workspaceLimit:
																Number(
																	e.target
																		.value,
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
										Members
									</label>
									<input
										type='number'
										value={form.membersLimit}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															membersLimit:
																Number(
																	e.target
																		.value,
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
										Projects
									</label>
									<input
										type='number'
										value={form.projectsLimit}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															projectsLimit:
																Number(
																	e.target
																		.value,
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
										Storage (GB)
									</label>
									<input
										type='number'
										value={form.storageLimitGb}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															storageLimitGb:
																Number(
																	e.target
																		.value,
																),
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Tính năng
							</h3>

							<label className='mb-2 block text-sm text-neutral-400'>
								Danh sách tính năng (ngăn cách bằng dấu phẩy)
							</label>

							<textarea
								value={form.features.join(", ")}
								onChange={(e) =>
									setForm((prev) =>
										prev
											? {
													...prev,
													features: e.target.value
														.split(",")
														.map((item) =>
															item.trim(),
														)
														.filter(Boolean),
												}
											: prev,
									)
								}
								rows={5}
								className='w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm text-white outline-none'
							/>
						</div>

						<Button
							type='button'
							onClick={() =>
								onSave({
									...form,
									updatedAt: new Date().toISOString(),
								})
							}
							className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
						>
							Lưu gói dịch vụ
						</Button>
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
