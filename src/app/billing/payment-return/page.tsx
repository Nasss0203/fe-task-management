"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	useVerifyVnpayReturn,
} from "@/features/billing/hooks/usePlan";
import { PLAN_KEY } from "@/features/billing/types/type";
import { billingService } from "@/services/billing/billing.service";
import type { PaymentReturnResult } from "@/services/billing/type";
import { WORKSPACE_KEY } from "@/services/workspace/type";
import { useQueryClient } from "@tanstack/react-query";
import {
	ArrowRight,
	Check,
	CheckCircle2,
	Clock3,
	CreditCard,
	Loader2,
	ReceiptText,
	RefreshCcw,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type PaymentStatus = "loading" | "success" | "failed";

const STRIPE_VERIFY_ATTEMPTS = 3;
const STRIPE_VERIFY_DELAY_MS = 500;
const stripeVerificationRequests = new Map<
	string,
	ReturnType<typeof billingService.verifyStripeCheckout>
>();

const delay = (milliseconds: number) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

const verifyStripeCheckoutOnce = (sessionId: string) => {
	const existingRequest = stripeVerificationRequests.get(sessionId);
	if (existingRequest) return existingRequest;

	const request = billingService.verifyStripeCheckout(sessionId);
	stripeVerificationRequests.set(sessionId, request);

	void request.then(
		() => stripeVerificationRequests.delete(sessionId),
		() => stripeVerificationRequests.delete(sessionId),
	);

	return request;
};

const formatCurrency = (amount?: number, currency = "VND") => {
	if (typeof amount !== "number") return "-";

	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
};

function DetailRow({ label, value }: { label: string; value?: string }) {
	return (
		<div className='flex items-center justify-between gap-4 text-sm'>
			<span className='text-muted-foreground'>{label}</span>
			<span className='max-w-56 truncate text-right font-medium'>
				{value || "-"}
			</span>
		</div>
	);
}

function StepItem({
	children,
	done,
	icon,
}: {
	children: React.ReactNode;
	done: boolean;
	icon: React.ReactNode;
}) {
	return (
		<li className='flex items-center gap-3 text-sm'>
			<span
				className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${
					done
						? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
						: "bg-background text-muted-foreground"
				}`}
			>
				{done ? <Check className='size-3.5' /> : icon}
			</span>
			<span className={done ? "text-foreground" : "text-muted-foreground"}>
				{children}
			</span>
		</li>
	);
}

function PaymentReturnContent() {
	const searchParams = useSearchParams();
	const queryString = searchParams.toString();
	const queryClient = useQueryClient();
	const { verifyPaymentReturn: verifyVnpayReturn } = useVerifyVnpayReturn();
	const verifyVnpay = verifyVnpayReturn.mutateAsync;
	const [status, setStatus] = useState<PaymentStatus>("loading");
	const [message, setMessage] = useState("Đang xác nhận thanh toán...");
	const [paymentResult, setPaymentResult] =
		useState<PaymentReturnResult | null>(null);
	const vnpOrderCode = searchParams.get("vnp_TxnRef") ?? undefined;
	const vnpResponseCode = searchParams.get("vnp_ResponseCode") ?? undefined;
	const stripeSessionId = searchParams.get("session_id") ?? undefined;
	const isStripeReturn =
		searchParams.get("provider") === "stripe" || Boolean(stripeSessionId);

	useEffect(() => {
		let isMounted = true;

		const verifyPayment = async () => {
			if (!queryString || (isStripeReturn && !stripeSessionId)) {
				setStatus("failed");
				setMessage("Không tìm thấy thông tin thanh toán.");
				return;
			}

			try {
				let response;

				if (isStripeReturn) {
					let lastError: unknown;

					for (
						let attempt = 1;
						attempt <= STRIPE_VERIFY_ATTEMPTS;
						attempt += 1
					) {
						try {
							response =
								await verifyStripeCheckoutOnce(
									stripeSessionId!,
								);
							break;
						} catch (error) {
							lastError = error;

							if (attempt < STRIPE_VERIFY_ATTEMPTS) {
								await delay(STRIPE_VERIFY_DELAY_MS);
							}
						}
					}

					if (!response) {
						throw lastError;
					}
				} else {
					response = await verifyVnpay(queryString);
				}

				const result = response.data;
				const isCompleted =
					result.completed === true ||
					result.status === "SUCCEEDED";

				if (!isMounted) return;

				setPaymentResult(result);

				if (isCompleted) {
					setStatus("success");
					setMessage("Nâng cấp Pro thành công.");

					await Promise.allSettled([
						queryClient.invalidateQueries({
							queryKey: [PLAN_KEY.PLAN_INFOR],
						}),
						queryClient.invalidateQueries({
							queryKey: [PLAN_KEY.PLAN_LIST],
						}),
						queryClient.invalidateQueries({
							queryKey: [WORKSPACE_KEY.WORKSPACE],
						}),
					]);

					return;
				}

				setStatus("failed");
				setMessage(
					result.message ??
						"Thanh toán chưa hoàn tất hoặc đã bị hủy.",
				);
			} catch (error) {
				if (!isMounted) return;

				console.error("verify payment return failed", error);
				setStatus("failed");
				setMessage("Xác nhận thanh toán thất bại. Vui lòng thử lại.");
			}
		};

		verifyPayment();

		return () => {
			isMounted = false;
		};
	}, [
		isStripeReturn,
		queryClient,
		queryString,
		stripeSessionId,
		verifyVnpay,
	]);

	const isLoading = status === "loading";
	const isSuccess = status === "success";
	const provider =
		paymentResult?.provider ??
		(isStripeReturn
			? "STRIPE"
			: searchParams.has("vnp_TmnCode")
				? "VNPAY"
				: undefined);
	const orderCode = paymentResult?.orderCode ?? vnpOrderCode;
	const paymentStatus =
		paymentResult?.status ??
		(isLoading ? "VERIFYING" : isSuccess ? "SUCCEEDED" : "FAILED");

	return (
		<main className='min-h-svh bg-background px-4 py-8 md:py-12'>
			<div className='mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px]'>
				<section className='flex flex-col justify-center gap-6'>
					<div className='space-y-4'>
						<Badge variant='secondary' className='rounded-md px-3 py-1'>
							Thanh toán
						</Badge>
						<div className='space-y-3'>
							<h1 className='max-w-2xl text-3xl font-semibold tracking-normal md:text-4xl'>
								{isLoading
									? "Đang xác nhận giao dịch"
									: isSuccess
										? "Workspace của bạn đã được nâng cấp"
										: "Chưa thể hoàn tất thanh toán"}
							</h1>
							<p className='max-w-2xl text-sm leading-6 text-muted-foreground md:text-base'>
								{message}
							</p>
						</div>
					</div>

					<Card className='rounded-lg'>
						<CardContent className='space-y-5 pt-6'>
							<ul className='space-y-4'>
								<StepItem done icon={<Clock3 className='size-3.5' />}>
									Đã tạo thanh toán
								</StepItem>
								<StepItem
									done={!isLoading}
									icon={<CreditCard className='size-3.5' />}
								>
									{isStripeReturn
										? "Đã xác nhận thanh toán Stripe"
										: "Đã nhận kết quả từ VNPAY"}
								</StepItem>
								<StepItem
									done={isSuccess}
									icon={<ShieldCheck className='size-3.5' />}
								>
									Đã cập nhật gói đăng ký
								</StepItem>
							</ul>
							<Separator />
							<p className='text-sm leading-6 text-muted-foreground'>
								{isLoading
									? isStripeReturn
										? "Hệ thống đang đối chiếu Stripe Checkout và đồng bộ gói đăng ký. Vui lòng không đóng trang này."
										: "Hệ thống đang xác thực chữ ký VNPAY và đồng bộ gói đăng ký. Vui lòng không đóng trang này."
									: isSuccess
										? "Gói đăng ký và giới hạn workspace đã được cập nhật. Bạn có thể quay lại trang chủ để tiếp tục làm việc."
										: "Nếu tài khoản đã bị trừ tiền, hãy gửi mã đơn hàng cho hỗ trợ để đối soát giao dịch."}
							</p>
						</CardContent>
					</Card>
				</section>

				<Card className='self-center rounded-lg'>
					<CardHeader>
						<div className='flex items-start justify-between gap-3'>
							<div className='space-y-2'>
								<div className='flex size-12 items-center justify-center rounded-lg bg-muted'>
									{isLoading ? (
										<Loader2 className='size-6 animate-spin' />
									) : isSuccess ? (
										<CheckCircle2 className='size-6 text-emerald-600' />
									) : (
										<XCircle className='size-6 text-destructive' />
									)}
								</div>
								<div>
									<CardTitle>Biên lai thanh toán</CardTitle>
									<CardDescription>
										{isLoading
											? "Đang xác minh"
											: isSuccess
												? "Đã xác nhận thanh toán"
												: "Thanh toán cần xem xét lại"}
									</CardDescription>
								</div>
							</div>
							<Badge
								variant={isSuccess ? "default" : "secondary"}
								className='rounded-md'
							>
								{paymentStatus === "VERIFYING" ? "ĐANG XÁC NHẬN" : paymentStatus === "SUCCEEDED" ? "THÀNH CÔNG" : paymentStatus === "FAILED" ? "THẤT BẠI" : paymentStatus}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='rounded-lg bg-muted/60 p-4'>
							<div className='flex items-center gap-2 text-sm font-medium'>
								<ReceiptText className='size-4' />
								Chi tiết giao dịch
							</div>
							<div className='mt-4 space-y-3'>
								<DetailRow label='Nhà cung cấp' value={provider} />
								<DetailRow label='Mã đơn hàng' value={orderCode} />
								<DetailRow
									label='Số tiền'
									value={formatCurrency(
										paymentResult?.amount,
										paymentResult?.currency,
									)}
								/>
								<DetailRow
									label={
										isStripeReturn
											? "Trạng thái Stripe"
											: "Mã VNPAY"
									}
									value={
										isStripeReturn
											? paymentResult?.stripePaymentStatus
											: vnpResponseCode
									}
								/>
							</div>
						</div>
						{isLoading ? (
							<div className='h-1.5 overflow-hidden rounded-full bg-muted'>
								<div className='h-full w-2/3 animate-pulse rounded-full bg-primary' />
							</div>
						) : null}
					</CardContent>
					<CardFooter className='flex-col gap-2'>
						{isLoading ? (
							<Button className='w-full' disabled>
								<Loader2 className='animate-spin' />
								Đang xác nhận thanh toán
							</Button>
						) : (
							<Button asChild className='w-full'>
								<Link href='/dashboard'>
									Đi đến trang chủ
									<ArrowRight />
								</Link>
							</Button>
						)}
						{isSuccess || isLoading ? null : (
							<Button asChild variant='outline' className='w-full'>
								<Link href='/dashboard/billing/upgrade'>
									<RefreshCcw />
									Thử lại
								</Link>
							</Button>
						)}
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}

export default function PaymentReturnPage() {
	return (
		<Suspense
			fallback={
				<main className='flex min-h-svh items-center justify-center bg-background px-4'>
					<Loader2 className='size-6 animate-spin' />
				</main>
			}
		>
			<PaymentReturnContent />
		</Suspense>
	);
}
