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
import type {
	BillingCoupon,
	CouponStatus,
	CouponType,
} from "../shared/billing-admin.types";
import { toDateInputValue } from "../shared/billing-admin.utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";


type Props = {
	coupon: BillingCoupon | null;
	onClose: () => void;
	onSave: (coupon: BillingCoupon) => void;
};

export function BillingCouponDetailPanel({ coupon, onClose, onSave }: Props) {
	const [open, setOpen] = useState(Boolean(coupon));
	const [form, setForm] = useState<BillingCoupon | null>(coupon);
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
								Quản lý coupon
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Quản lý mã giảm giá, thời gian hiệu lực và giới
								hạn sử dụng.
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
								Thông tin coupon
							</h3>

							<div className='space-y-4'>
								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Code
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
										Trạng thái
									</label>
									<Select 
										value={form.status} 
										onValueChange={(val) => setForm((prev) =>
											prev
												? {
														...prev,
														status: val as CouponStatus,
												  }
												: prev
										)}
									>
										<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="ACTIVE">Đang chạy</SelectItem>
											<SelectItem value="INACTIVE">Đã tắt</SelectItem>
											<SelectItem value="EXPIRED">Hết hạn</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Loại coupon
									</label>
									<Select 
										value={form.type} 
										onValueChange={(val) => setForm((prev) =>
											prev
												? {
														...prev,
														type: val as CouponType,
												  }
												: prev
										)}
									>
										<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="PERCENT">Giảm %</SelectItem>
											<SelectItem value="FIXED">Giảm cố định</SelectItem>
											<SelectItem value="TRIAL_DAYS">Ngày trial</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										{form.type === "FIXED"
											? "Giá trị (VND)"
											: "Giá trị"}
									</label>
									<input
										type='number'
										value={form.value}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															value: Number(
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
										Max usage
									</label>
									<input
										type='number'
										value={form.maxUsage}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															maxUsage: Number(
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
										Đã dùng
									</label>
									<input
										type='number'
										value={form.usageCount}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															usageCount: Number(
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
										Bắt đầu
									</label>
									<input
										type='date'
										value={toDateInputValue(form.startAt)}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															startAt: new Date(
																e.target.value,
															).toISOString(),
														}
													: prev,
											)
										}
										className='h-11 w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-3 text-sm text-white outline-none'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm text-neutral-400'>
										Kết thúc
									</label>
									<input
										type='date'
										value={toDateInputValue(form.endAt)}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															endAt: new Date(
																e.target.value,
															).toISOString(),
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
										Áp dụng cho plan (ngăn cách bằng dấu
										phẩy)
									</label>
									<input
										value={form.appliesTo.join(", ")}
										onChange={(e) =>
											setForm((prev) =>
												prev
													? {
															...prev,
															appliesTo:
																e.target.value
																	.split(",")
																	.map(
																		(
																			item,
																		) =>
																			item.trim(),
																	)
																	.filter(
																		Boolean,
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

						<Button
							type='button'
							onClick={() => onSave(form)}
							className='h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white hover:bg-white/10'
						>
							Lưu coupon
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
