"use client";

import { useRef, useState } from "react";
import { isAxiosError } from "axios";
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
import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import { useUser } from "@/features/auth";

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

		if (Array.isArray(message)) {
			return message.join(", ");
		}

		if (message) {
			return message;
		}
	}

	return error instanceof Error
		? error.message
		: "Không thể tạo thanh toán. Vui lòng thử lại.";
}

export default function BillingPage() {
	const [interval, setInterval] = useState<BillingInterval>("MONTHLY");
	const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

	// Chặn nhấn liên tiếp trước khi React cập nhật trạng thái.
	const checkoutLock = useRef(false);

	const { user } = useUser();

	const {
		data: workspaces = [],
		isLoading: isWorkspacesLoading,
		isError: isWorkspacesError,
	} = useWorkspaces();

	const { data, isPending, isError, refetch } = useBillingPlans();

	const lastWorkspaceId = user?.lastActiveWorkspaceId;

	const workspaceId =
		workspaces.find((workspace) => workspace.id === lastWorkspaceId)?.id ??
		workspaces[0]?.id;

	const canCheckout =
		Boolean(user && workspaceId) && !isWorkspacesLoading && !isWorkspacesError;

	async function handleCheckout(price: BillingPrice) {
		if (checkoutLock.current) {
			return;
		}

		if (!canCheckout || !workspaceId) {
			toast.error("Bạn cần đăng nhập và chọn workspace trước.");
			return;
		}

		checkoutLock.current = true;
		setLoadingPriceId(price.id);

		try {
			const checkout = await createBillingCheckout({
				workspaceId,
				planPriceId: price.id,
			});

			navigateToBillingCheckout(checkout);

			// Giữ khóa trong khi trình duyệt chuyển sang trang thanh toán.
		} catch (error: unknown) {
			toast.error(getErrorMessage(error));
			checkoutLock.current = false;
			setLoadingPriceId(null);
		}
	}

	return (
		<div className='mx-auto w-full max-w-6xl overflow-y-auto px-6 pb-10'>
			<header className='mb-8'>
				<h1 className='text-3xl font-semibold'>Gói dịch vụ</h1>

				<p className='mt-2 text-sm text-muted-foreground'>
					Chọn gói và phương thức thanh toán cho workspace đang chọn.
				</p>

				<p className='mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900'>
					Môi trường thử nghiệm cho đồ án. Thanh toán thẻ Stripe chỉ dùng thẻ
					test, không nhập thông tin thẻ thật.
				</p>

				{workspaceId && (
					<p className='mt-3 break-all text-xs text-muted-foreground'>
						Workspace: {workspaceId}
					</p>
				)}

				{isWorkspacesError && (
					<p className='mt-3 text-sm text-red-600'>
						Không tải được workspace. Vui lòng tải lại trang.
					</p>
				)}
			</header>

			<div className='mb-8 flex gap-2'>
				{(
					[
						["MONTHLY", "Theo tháng"],
						["YEARLY", "Theo năm"],
					] as const
				).map(([value, label]) => (
					<button
						key={value}
						type='button'
						aria-pressed={interval === value}
						disabled={loadingPriceId !== null}
						onClick={() => setInterval(value)}
						className={`rounded-lg border px-4 py-2 text-sm disabled:opacity-50 ${
							interval === value
								? "bg-primary text-primary-foreground"
								: "bg-background"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{isPending ? (
				<p>Đang tải gói dịch vụ...</p>
			) : isError ? (
				<div className='rounded-lg border p-5'>
					<p>Không tải được danh sách gói.</p>
					<button
						type='button'
						onClick={() => void refetch()}
						className='mt-3 rounded-lg border px-4 py-2'
					>
						Thử lại
					</button>
				</div>
			) : (
				<div className='grid gap-6 md:grid-cols-3'>
					{data?.items.map((plan) => {
						const prices = plan.prices.filter(
							(price) => price.billingInterval === interval,
						);

						const isFree = plan.code === "FREE";

						return (
							<section
								key={plan.id}
								className='flex flex-col rounded-xl border bg-card p-6 text-card-foreground'
							>
								<h2 className='text-2xl font-semibold'>{plan.name}</h2>

								<p className='mt-2 text-sm text-muted-foreground'>
									{plan.description}
								</p>

								<ul className='my-6 space-y-3 text-sm'>
									{plan.features.map((feature) => (
										<li key={feature.id}>{formatFeature(feature)}</li>
									))}
								</ul>

								<div className='mt-auto space-y-3'>
									{isFree ? (
										<p className='rounded-lg bg-muted p-3 text-center text-sm'>
											Gói miễn phí — không cần thanh toán
										</p>
									) : prices.length === 0 ? (
										<p className='text-sm text-muted-foreground'>
											Chưa có giá cho kỳ hạn này.
										</p>
									) : (
										prices.map((price) => (
											<button
												key={price.id}
												type='button'
												disabled={!canCheckout || loadingPriceId !== null}
												onClick={() => void handleCheckout(price)}
												className='w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
											>
												<span className='block font-medium'>
													{loadingPriceId === price.id
														? "Đang chuyển đến thanh toán..."
														: price.provider === "STRIPE"
															? "Thẻ Visa/Mastercard · Stripe test"
															: "Chuyển khoản QR · SePay"}
												</span>

												<span className='mt-1 block text-sm text-muted-foreground'>
													{formatPrice(price.amount, price.currency)}
													{interval === "MONTHLY" ? " / tháng" : " / năm"}
												</span>
											</button>
										))
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
