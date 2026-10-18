"use client";

import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
	CheckCircle2,
	Clock3,
	HelpCircle,
	Loader2,
	RefreshCw,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { billingKeys } from "@/entities/billing/model/billing.queries";
import apiClient from "@/shared/api/api-client";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

import {
	PAYMENT_RESULT_PARAM,
	useBillingDialog,
} from "../model/use-billing-dialog";

/** Params the payment provider appends to its return URL. */
const RETURN_PARAMS = [
	PAYMENT_RESULT_PARAM,
	"paymentOrderId",
	"workspaceId",
	"status",
	"session_id",
];

type ReturnInfo = {
	paymentOrderId: string | null;
	workspaceId: string | null;
	returnStatus: string | null;
};

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

/**
 * Shows the result of a payment the user just returned from, over the
 * workspace. Opened by /billing/payment-result redirecting to
 * /dashboard?paymentResult=1&... .
 */
export function PaymentResultDialog() {
	const [info, setInfo] = useState<ReturnInfo | null>(null);
	const setBillingOpen = useBillingDialog((state) => state.setOpen);

	useEffect(() => {
		const params = new URL(window.location.href).searchParams;
		if (params.get(PAYMENT_RESULT_PARAM) !== "1") return;
		// eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once on mount
		setInfo({
			paymentOrderId: params.get("paymentOrderId"),
			workspaceId: params.get("workspaceId"),
			returnStatus: params.get("status"),
		});
	}, []);

	const close = () => {
		// Drop the provider params so a refresh doesn't reopen the dialog.
		const url = new URL(window.location.href);
		for (const key of RETURN_PARAMS) url.searchParams.delete(key);
		window.history.replaceState(null, "", url.pathname + url.search + url.hash);
		setInfo(null);
	};

	return (
		<Dialog open={info !== null} onOpenChange={(open) => !open && close()}>
			<DialogContent className='max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg'>
				{info && (
					<PaymentResult
						{...info}
						onClose={close}
						onChoosePlan={() => {
							close();
							setBillingOpen(true);
						}}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function PaymentResult({
	paymentOrderId,
	workspaceId,
	returnStatus,
	onClose,
	onChoosePlan,
}: ReturnInfo & { onClose: () => void; onChoosePlan: () => void }) {
	const queryClient = useQueryClient();
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
		<div aria-busy={checking}>
			<DialogHeader className='border-b px-6 py-4 text-left'>
				<DialogTitle className='text-base'>Kết quả thanh toán</DialogTitle>
				<DialogDescription className='text-xs'>
					Môi trường thử nghiệm
				</DialogDescription>
			</DialogHeader>

			<div className='px-6 py-7'>
				<div aria-live='polite' className='text-center'>
					<div
						className={cn(
							"mx-auto flex size-16 items-center justify-center rounded-full",
							appearance.color,
						)}
					>
						<Icon
							aria-hidden='true'
							className={cn("size-8", view === "loading" && "animate-spin")}
						/>
					</div>
					<h2 className='mt-4 text-xl font-semibold'>{appearance.title}</h2>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>
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
					<dl className='mt-6 space-y-3 rounded-xl border bg-muted/30 p-4 text-sm'>
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

				<div className='mt-6 flex flex-col gap-2'>
					{canRetry && (
						<Button
							type='button'
							variant='outline'
							onClick={() => setAttempt((value) => value + 1)}
						>
							<RefreshCw className='size-4' />
							Kiểm tra lại
						</Button>
					)}
					<Button type='button' onClick={onClose}>
						Tiếp tục làm việc
					</Button>
					{view !== "success" && (
						<Button type='button' variant='ghost' onClick={onChoosePlan}>
							Xem lại gói dịch vụ
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
