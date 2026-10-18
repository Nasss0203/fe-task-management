"use client";

import { isAxiosError } from "axios";
import { Check, CreditCard, Loader2, QrCode, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
	createBillingCheckout,
	navigateToBillingCheckout,
} from "@/entities/billing/api/billing.api";
import { useBillingPlans } from "@/entities/billing/model/billing.queries";
import type {
	BillingFeature,
	BillingInterval,
	BillingPrice,
} from "@/entities/billing/model/billing.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

import {
	BILLING_DIALOG_PARAM,
	useBillingDialog,
} from "../model/use-billing-dialog";

function formatPrice(amount: number, currency: string): string {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

function formatFeature(feature: BillingFeature): string {
	const value = feature.value;

	switch (feature.code) {
		case "MAX_MEMBERS":
			return `Tối đa ${value} thành viên`;
		case "MAX_TEAMSPACES":
			return `Tối đa ${value} teamspace`;
		case "MAX_STORAGE_MB":
			return `${Number(value).toLocaleString("vi-VN")} MB lưu trữ`;
		case "PUBLIC_PAGE":
			return value
				? "Cho phép xuất bản trang công khai"
				: "Không hỗ trợ trang công khai";
		default:
			return `${feature.name}: ${
				typeof value === "boolean" ? (value ? "Có" : "Không") : value
			}`;
	}
}

function getErrorMessage(error: unknown): string {
	if (isAxiosError<{ message?: string | string[] }>(error)) {
		const message = error.response?.data?.message;
		if (Array.isArray(message)) return message.join(", ");
		if (message) return message;
	}
	return error instanceof Error
		? error.message
		: "Không thể tạo thanh toán. Vui lòng thử lại.";
}

const INTERVALS = [
	["MONTHLY", "Theo tháng"],
	["YEARLY", "Theo năm"],
] as const;

interface BillingDialogProps {
	workspaceId: string;
	workspaceName: string;
	/** Plan code of the workspace's subscription, to mark the current plan. */
	currentPlanCode?: string;
}

/** Plans and checkout for one workspace, in a dialog (replaces the /billing page). */
export function BillingDialog({
	workspaceId,
	workspaceName,
	currentPlanCode,
}: BillingDialogProps) {
	const open = useBillingDialog((state) => state.open);
	const setOpen = useBillingDialog((state) => state.setOpen);
	const [busy, setBusy] = useState(false);

	// Links such as /pricing and the payment result page open the dialog via ?upgrade=1.
	useEffect(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.get(BILLING_DIALOG_PARAM) !== "1") return;
		url.searchParams.delete(BILLING_DIALOG_PARAM);
		window.history.replaceState(null, "", url.pathname + url.search + url.hash);
		setOpen(true);
	}, [setOpen]);

	return (
		<Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
			<DialogContent className='flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl'>
				<DialogHeader className='gap-1 border-b px-6 py-5 text-left'>
					<DialogTitle className='text-xl'>Nâng cấp gói dịch vụ</DialogTitle>
					<DialogDescription>
						Chọn gói và phương thức thanh toán cho workspace{" "}
						<span className='font-medium text-foreground'>{workspaceName}</span>
						.
					</DialogDescription>
				</DialogHeader>
				{/* Mounted only while open, so plans are fetched on demand. */}
				{open && (
					<BillingPlans
						workspaceId={workspaceId}
						currentPlanCode={currentPlanCode}
						onBusyChange={setBusy}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function BillingPlans({
	workspaceId,
	currentPlanCode,
	onBusyChange,
}: Omit<BillingDialogProps, "workspaceName"> & {
	onBusyChange: (busy: boolean) => void;
}) {
	const [interval, setInterval] = useState<BillingInterval>("MONTHLY");
	const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
	// Blocks double clicks before React re-renders the disabled state.
	const checkoutLock = useRef(false);
	const { data, isPending, isError, refetch } = useBillingPlans();

	async function handleCheckout(price: BillingPrice) {
		if (checkoutLock.current) return;
		checkoutLock.current = true;
		setLoadingPriceId(price.id);
		onBusyChange(true);

		try {
			const checkout = await createBillingCheckout({
				workspaceId,
				planPriceId: price.id,
			});
			navigateToBillingCheckout(checkout);
			// Keep the lock while the browser leaves for the payment page.
		} catch (error: unknown) {
			toast.error(getErrorMessage(error));
			checkoutLock.current = false;
			setLoadingPriceId(null);
			onBusyChange(false);
		}
	}

	return (
		<div className='flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<div
					role='group'
					aria-label='Kỳ thanh toán'
					className='inline-flex rounded-lg bg-muted p-0.5'
				>
					{INTERVALS.map(([value, label]) => (
						<button
							key={value}
							type='button'
							aria-pressed={interval === value}
							disabled={loadingPriceId !== null}
							onClick={() => setInterval(value)}
							className={cn(
								"h-8 rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-50",
								interval === value
									? "bg-background text-foreground shadow-xs"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{label}
						</button>
					))}
				</div>
				<p className='text-xs text-muted-foreground'>
					Môi trường thử nghiệm: thẻ Stripe chỉ dùng thẻ test, không nhập thẻ
					thật.
				</p>
			</div>

			{isPending ? (
				<div className='grid gap-4 md:grid-cols-3'>
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} className='h-80 rounded-xl' />
					))}
				</div>
			) : isError ? (
				<div
					role='alert'
					className='flex flex-col items-center gap-3 rounded-xl border py-12 text-center'
				>
					<p className='text-sm text-muted-foreground'>
						Không tải được danh sách gói.
					</p>
					<Button variant='outline' size='sm' onClick={() => void refetch()}>
						<RotateCw className='size-3.5' />
						Thử lại
					</Button>
				</div>
			) : (
				<div className='grid gap-4 md:grid-cols-3'>
					{data?.items.map((plan) => {
						const prices = plan.prices.filter(
							(price) => price.billingInterval === interval,
						);
						const isFree = plan.code === "FREE";
						const isCurrent = plan.code === currentPlanCode;

						return (
							<section
								key={plan.id}
								aria-label={plan.name}
								className={cn(
									"flex flex-col rounded-xl border bg-card p-5",
									isCurrent && "border-primary/60 ring-1 ring-primary/30",
								)}
							>
								<div className='flex items-center justify-between gap-2'>
									<h3 className='text-lg font-semibold'>{plan.name}</h3>
									{isCurrent && (
										<span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
											Gói hiện tại
										</span>
									)}
								</div>
								<p className='mt-1 text-sm text-muted-foreground'>
									{plan.description}
								</p>

								<ul className='my-5 flex flex-col gap-2 text-sm'>
									{plan.features.map((feature) => (
										<li key={feature.id} className='flex gap-2'>
											<Check
												aria-hidden
												className='mt-0.5 size-4 shrink-0 text-emerald-500'
											/>
											{formatFeature(feature)}
										</li>
									))}
								</ul>

								<div className='mt-auto flex flex-col gap-2'>
									{isFree ? (
										<p className='rounded-lg bg-muted px-3 py-2.5 text-center text-sm text-muted-foreground'>
											Gói miễn phí, không cần thanh toán
										</p>
									) : prices.length === 0 ? (
										<p className='text-sm text-muted-foreground'>
											Chưa có giá cho kỳ hạn này.
										</p>
									) : (
										prices.map((price) => {
											const isStripe = price.provider === "STRIPE";
											const Icon = isStripe ? CreditCard : QrCode;
											return (
												<button
													key={price.id}
													type='button'
													disabled={loadingPriceId !== null}
													onClick={() => void handleCheckout(price)}
													className='flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50'
												>
													{loadingPriceId === price.id ? (
														<Loader2 className='size-4 shrink-0 animate-spin' />
													) : (
														<Icon
															aria-hidden
															className='size-4 shrink-0 text-muted-foreground'
														/>
													)}
													<span className='min-w-0 flex-1'>
														<span className='block text-sm font-medium'>
															{loadingPriceId === price.id
																? "Đang chuyển đến thanh toán..."
																: isStripe
																	? "Thẻ Visa/Mastercard · Stripe test"
																	: "Chuyển khoản QR · SePay"}
														</span>
														<span className='block text-xs text-muted-foreground'>
															{formatPrice(price.amount, price.currency)}
															{interval === "MONTHLY" ? " / tháng" : " / năm"}
														</span>
													</span>
												</button>
											);
										})
									)}
								</div>
							</section>
						);
					})}
				</div>
			)}
		</div>
	);
}
