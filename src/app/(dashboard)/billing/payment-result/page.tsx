"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Clock3,
	HelpCircle,
	Loader2,
	RefreshCw,
	XCircle,
} from "lucide-react";
import { isAxiosError } from "axios";

import apiClient from "@/shared/api/api-client";
import { billingKeys } from "@/entities/billing/model/billing.queries";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELED";

interface PaymentOrder {
	paymentOrderId: string;
	workspaceId: string;
	planPriceId: string;
	orderCode: string;
	provider: "STRIPE" | "SEPAY";
	amount: number;
	currency: string;
	status: PaymentStatus;
	expiresAt: string | null;
}

type ViewState =
	| "loading"
	| "pending"
	| "success"
	| "failed"
	| "expired"
	| "canceled"
	| "unknown";

const appearances = {
	loading: {
		title: "Đang kiểm tra thanh toán",
		description: "Vui lòng đợi trong khi hệ thống kiểm tra đơn hàng.",
		icon: Loader2,
		color: "bg-blue-500/10 text-blue-500",
	},
	pending: {
		title: "Đang xác nhận thanh toán",
		description:
			"Đơn hàng đang chờ xác nhận. Kết quả sẽ được cập nhật khi hệ thống nhận được thông báo thanh toán.",
		icon: Clock3,
		color: "bg-amber-500/10 text-amber-500",
	},
	success: {
		title: "Thanh toán thành công",
		description:
			"Hệ thống đã ghi nhận thanh toán của bạn. Bạn có thể quay lại workspace để tiếp tục làm việc.",
		icon: CheckCircle2,
		color: "bg-emerald-500/10 text-emerald-500",
	},
	failed: {
		title: "Thanh toán thất bại",
		description:
			"Đơn hàng được ghi nhận thanh toán thất bại. Bạn có thể quay lại trang gói dịch vụ để thử lại.",
		icon: XCircle,
		color: "bg-red-500/10 text-red-500",
	},
	expired: {
		title: "Đơn thanh toán đã hết hạn",
		description:
			"Đơn hàng này đã hết hạn. Vui lòng quay lại trang gói dịch vụ để tạo thanh toán mới.",
		icon: Clock3,
		color: "bg-orange-500/10 text-orange-500",
	},
	canceled: {
		title: "Đơn thanh toán đã hủy",
		description:
			"Hệ thống đã ghi nhận đơn hàng bị hủy. Bạn có thể chọn lại gói khi muốn tiếp tục.",
		icon: XCircle,
		color: "bg-zinc-500/10 text-zinc-500",
	},
	unknown: {
		title: "Chưa thể xác nhận thanh toán",
		description:
			"Chưa lấy được trạng thái đơn hàng. Điều này không có nghĩa là thanh toán thất bại.",
		icon: HelpCircle,
		color: "bg-blue-500/10 text-blue-500",
	},
} as const;

function getView(status: PaymentStatus): ViewState {
	switch (status) {
		case "PAID":
			return "success";
		case "FAILED":
			return "failed";
		case "EXPIRED":
			return "expired";
		case "CANCELED":
			return "canceled";
		case "PENDING":
			return "pending";
		default:
			return "unknown";
	}
}

function PaymentResultContent() {
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const paymentOrderId = searchParams.get("paymentOrderId");
	const workspaceId = searchParams.get("workspaceId");
	const returnStatus = searchParams.get("status");

	const [order, setOrder] = useState<PaymentOrder | null>(null);
	const [view, setView] = useState<ViewState>("loading");
	const [error, setError] = useState("");
	const [checking, setChecking] = useState(false);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let disposed = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const controller = new AbortController();
		let checks = 0;

		setOrder(null);
		setError("");

		const uuidPattern =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

		if (
			!paymentOrderId ||
			!workspaceId ||
			!uuidPattern.test(paymentOrderId) ||
			!uuidPattern.test(workspaceId)
		) {
			setView("unknown");
			setChecking(false);
			setError("Liên kết thiếu thông tin đơn hàng hoặc workspace hợp lệ.");
			return;
		}

		setView("loading");
		setChecking(true);

		async function checkPayment() {
			try {
				checks += 1;

				const response = await apiClient.post<{
					data: PaymentOrder;
				}>(
					"/billing/payment-status",
					{ paymentOrderId, workspaceId },
					{ signal: controller.signal },
				);

				if (disposed) return;

				const result = response.data.data;

				if (
					result.paymentOrderId !== paymentOrderId ||
					result.workspaceId !== workspaceId
				) {
					throw new Error("Thông tin đơn hàng trả về không khớp.");
				}

				setOrder(result);
				setView(getView(result.status));

				if (result.status === "PAID") {
					void queryClient.invalidateQueries({
						queryKey: billingKeys.workspaceSubscription(result.workspaceId),
					});
				}

				if (result.status === "PENDING" && checks < 20) {
					timer = setTimeout(() => void checkPayment(), 3000);
				} else {
					setChecking(false);
				}
			} catch (cause: unknown) {
				if (disposed) return;

				setView("unknown");
				setChecking(false);

				if (isAxiosError(cause) && cause.response?.status === 403) {
					setError(
						"Tài khoản hiện tại không có quyền xem đơn của workspace này.",
					);
				} else if (isAxiosError(cause) && cause.response?.status === 404) {
					setError("Không tìm thấy đơn hàng trong workspace này.");
				} else {
					setError(
						"Không lấy được kết quả. Hãy kiểm tra kết nối và thử kiểm tra lại.",
					);
				}
			}
		}

		void checkPayment();

		return () => {
			disposed = true;
			controller.abort();
			if (timer) clearTimeout(timer);
		};
	}, [paymentOrderId, workspaceId, attempt, queryClient]);

	const appearance = appearances[view];
	const Icon = appearance.icon;
	const canRetry =
		Boolean(paymentOrderId && workspaceId) &&
		!checking &&
		(view === "pending" || view === "unknown");

	const amount = order
		? new Intl.NumberFormat("vi-VN", {
				style: "currency",
				currency: order.currency,
				maximumFractionDigits: 0,
			}).format(order.amount)
		: null;

	return (
		<div className='flex min-h-[70vh] items-center justify-center overflow-y-auto px-4 py-8'>
			<section
				className='w-full max-w-xl overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'
				aria-busy={checking}
			>
				<div className='border-b px-6 py-4'>
					<p className='text-sm font-semibold'>TaskManly</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Kết quả thanh toán · Môi trường thử nghiệm
					</p>
				</div>

				<div className='px-6 py-8 sm:px-8'>
					<div aria-live='polite' className='text-center'>
						<div
							className={`mx-auto flex size-20 items-center justify-center rounded-full ${appearance.color}`}
						>
							<Icon
								aria-hidden='true'
								className={`size-10 ${view === "loading" ? "animate-spin" : ""}`}
							/>
						</div>

						<h1 className='mt-5 text-2xl font-semibold'>{appearance.title}</h1>

						<p className='mt-3 text-sm leading-6 text-muted-foreground'>
							{appearance.description}
						</p>
					</div>

					{view === "pending" &&
						["cancelled", "canceled", "error"].includes(returnStatus ?? "") && (
							<p className='mt-4 rounded-lg bg-muted p-3 text-sm'>
								Bạn đã quay về từ bước thanh toán. Trạng thái đơn trong hệ thống
								vẫn đang chờ xác nhận.
							</p>
						)}

					{error && (
						<p role='alert' className='mt-4 rounded-lg bg-muted p-3 text-sm'>
							{error}
						</p>
					)}

					{order && (
						<dl className='mt-7 space-y-4 rounded-xl border bg-muted/30 p-4 text-sm'>
							<div className='flex items-start justify-between gap-4'>
								<dt className='shrink-0 text-muted-foreground'>Mã đơn</dt>
								<dd className='break-all text-right font-medium'>
									{order.orderCode}
								</dd>
							</div>

							<div className='flex justify-between gap-4'>
								<dt className='text-muted-foreground'>Số tiền</dt>
								<dd className='font-semibold'>{amount}</dd>
							</div>

							<div className='flex justify-between gap-4'>
								<dt className='text-muted-foreground'>Phương thức</dt>
								<dd>
									{order.provider === "STRIPE"
										? "Thẻ · Stripe"
										: "Chuyển khoản · SePay"}
								</dd>
							</div>
						</dl>
					)}

					{view === "pending" && (
						<p className='mt-4 text-center text-xs text-muted-foreground'>
							{checking
								? "Hệ thống đang tự động kiểm tra lại..."
								: "Chưa nhận được xác nhận. Bạn có thể kiểm tra lại sau; chưa cần thanh toán thêm."}
						</p>
					)}

					<div className='mt-7 flex flex-col gap-3'>
						{canRetry && (
							<button
								type='button'
								onClick={() => setAttempt((value) => value + 1)}
								className='flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted'
							>
								<RefreshCw className='size-4' />
								Kiểm tra lại
							</button>
						)}

						<Link
							href='/dashboard'
							className='flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:opacity-90'
						>
							Về workspace
							<ArrowRight className='size-4' />
						</Link>

						<Link
							href='/billing'
							className='flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground'
						>
							<ArrowLeft className='size-4' />
							Quay lại gói dịch vụ
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}

export default function PaymentResultPage() {
	return (
		<Suspense
			fallback={
				<div className='flex items-center justify-center gap-2 p-12'>
					<Loader2 className='size-5 animate-spin' />
					Đang tải kết quả...
				</div>
			}
		>
			<PaymentResultContent />
		</Suspense>
	);
}
