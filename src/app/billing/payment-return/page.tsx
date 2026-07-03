"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	RefreshCcw,
	ShieldCheck,
	Sparkles,
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
			<span className='text-muted-foreground font-medium'>{label}</span>
			<span className='max-w-[200px] truncate text-right font-semibold text-foreground'>
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
		<li className='flex items-center gap-4'>
			<span
				className={`flex size-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors ${
					done
						? "border-emerald-200 bg-emerald-100 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
						: "border-border bg-muted/50 text-muted-foreground"
				}`}
			>
				{done ? <Check className='size-5' strokeWidth={3} /> : icon}
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
		<main className='min-h-svh relative flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 overflow-hidden'>
			{/* Abstract background shapes for premium feel */}
			<div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
			<div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
			<div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

			<div className='mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1.2fr_1fr] relative z-10'>
				<section className='flex flex-col justify-center gap-10 lg:pr-6'>
					<div className='space-y-6'>
						<div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold w-fit border shadow-sm ${isSuccess ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : isLoading ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
							<Sparkles className="w-4 h-4 mr-2" />
							{isLoading ? "Đang xử lý giao dịch..." : isSuccess ? "Thanh toán hoàn tất" : "Thanh toán thất bại"}
						</div>
						<div className='space-y-4'>
							<h1 className='text-4xl font-extrabold tracking-tight md:text-5xl lg:leading-[1.1] text-foreground'>
								{isLoading
									? "Vui lòng chờ trong giây lát"
									: isSuccess
										? "Workspace của bạn đã được nâng cấp"
										: "Chưa thể hoàn tất thanh toán"}
							</h1>
							<p className='text-lg text-muted-foreground leading-relaxed'>
								{message}
							</p>
						</div>
					</div>

					<Card className='rounded-2xl border-0 shadow-none bg-transparent'>
						<CardContent className='p-0 space-y-8'>
							<ul className='space-y-6'>
								<StepItem done icon={<Clock3 className='size-5' />}>
									<span className="text-base font-semibold">Đã tạo yêu cầu thanh toán</span>
								</StepItem>
								<StepItem
									done={!isLoading}
									icon={<CreditCard className='size-5' />}
								>
									<span className="text-base font-semibold">
										{isStripeReturn
											? "Xác nhận giao dịch từ Stripe"
											: "Nhận kết quả từ VNPAY"}
									</span>
								</StepItem>
								<StepItem
									done={isSuccess}
									icon={<ShieldCheck className='size-5' />}
								>
									<span className="text-base font-semibold">Kích hoạt gói đăng ký & Nâng cấp giới hạn</span>
								</StepItem>
							</ul>
							
							<div className="bg-background/60 backdrop-blur-md rounded-2xl p-6 border shadow-sm">
								<p className='text-sm leading-relaxed text-foreground font-medium'>
									{isLoading
										? isStripeReturn
											? "Hệ thống đang đối chiếu Stripe Checkout và đồng bộ gói đăng ký. Vui lòng không đóng trang này."
											: "Hệ thống đang xác thực chữ ký VNPAY và đồng bộ gói đăng ký. Vui lòng không đóng trang này."
										: isSuccess
											? "Mọi thứ đã sẵn sàng! Gói đăng ký và giới hạn workspace đã được cập nhật thành công. Bạn có thể bắt đầu trải nghiệm các tính năng Pro ngay bây giờ."
											: "Nếu tài khoản của bạn đã bị trừ tiền, hãy liên hệ với bộ phận hỗ trợ khách hàng và cung cấp mã đơn hàng để đối soát."}
								</p>
							</div>
						</CardContent>
					</Card>
				</section>

				<Card className='self-center border-0 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl overflow-hidden relative bg-card'>
					{/* Gradient top bar */}
					<div className={`h-2.5 w-full ${isSuccess ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : isLoading ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} />
					
					<CardHeader className="pt-10 pb-6 px-8 items-center text-center">
						<div className={`flex size-20 items-center justify-center rounded-full mb-6 shadow-sm ${isSuccess ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : isLoading ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
							{isLoading ? (
								<Loader2 className='size-10 animate-spin' />
							) : isSuccess ? (
								<CheckCircle2 className='size-10' />
							) : (
								<XCircle className='size-10' />
							)}
						</div>
						<CardTitle className="text-2xl font-bold">Biên lai giao dịch</CardTitle>
						<Badge
							variant={isSuccess ? "default" : "secondary"}
							className={`mt-3 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${isSuccess ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800' : ''}`}
						>
							{paymentStatus === "VERIFYING" ? "ĐANG XÁC NHẬN" : paymentStatus === "SUCCEEDED" ? "THÀNH CÔNG" : paymentStatus === "FAILED" ? "THẤT BẠI" : paymentStatus}
						</Badge>
					</CardHeader>

					<CardContent className='px-8 pb-8'>
						{/* The Amount Block */}
						<div className="text-center py-6 bg-muted/30 rounded-2xl mb-8 border border-border/50">
							<div className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tổng thanh toán</div>
							<div className="text-4xl font-black text-foreground tracking-tight">
								{formatCurrency(paymentResult?.amount)}
							</div>
						</div>

						{/* Dashed Line with notches for Receipt Effect */}
						<div className="border-t-2 border-dashed border-border w-full my-8 relative">
							<div className="absolute -top-[13px] w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full shadow-inner border border-border" style={{ left: '-45px' }} />
							<div className="absolute -top-[13px] w-6 h-6 bg-slate-50 dark:bg-slate-950 rounded-full shadow-inner border border-border" style={{ right: '-45px' }} />
						</div>

						<div className='space-y-5 pt-2'>
							<DetailRow label='Nhà cung cấp' value={provider} />
							<DetailRow label='Mã đơn hàng' value={orderCode} />
							<DetailRow
								label={isStripeReturn ? "Trạng thái Stripe" : "Mã tham chiếu"}
								value={isStripeReturn ? paymentResult?.stripePaymentStatus : vnpResponseCode}
							/>
						</div>
						
						{isLoading ? (
							<div className='h-1.5 overflow-hidden rounded-full bg-muted mt-8'>
								<div className='h-full w-2/3 animate-pulse rounded-full bg-primary' />
							</div>
						) : null}
					</CardContent>

					<CardFooter className='flex-col gap-3 px-8 pb-8 pt-0'>
						{isLoading ? (
							<Button className='w-full rounded-xl h-12 text-base font-semibold shadow-sm' disabled>
								<Loader2 className='animate-spin mr-2' />
								Đang xác nhận...
							</Button>
						) : (
							<Button asChild className='w-full rounded-xl h-12 text-base font-semibold shadow-sm group'>
								<Link href='/dashboard'>
									Đi đến bảng điều khiển
									<ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
								</Link>
							</Button>
						)}
						{isSuccess || isLoading ? null : (
							<Button asChild variant='outline' className='w-full rounded-xl h-12 text-base font-semibold'>
								<Link href='/dashboard/billing/upgrade'>
									<RefreshCcw className="mr-2 w-4 h-4" />
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
