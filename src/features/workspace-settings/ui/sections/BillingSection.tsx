import { Check, RotateCw } from "lucide-react";

import {
	useBillingPlans,
	useWorkspacePaymentOrders,
	useWorkspaceSubscription,
} from "@/entities/billing/model/billing.queries";
import type {
	PaymentOrderStatus,
	WorkspaceSubscriptionStatus,
} from "@/entities/billing/model/billing.types";
import { useWorkspaceAccess } from "@/entities/workspace/model/workspace.queries";
import { formatFeature, useBillingDialog } from "@/features/workspace-billing";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { useSettingsDialog } from "../../model/use-settings-dialog";
import {
	SettingsGroup,
	SettingsHeader,
	SettingsRow,
	formatSettingsDate,
} from "./settings-layout";

const STATUS_STYLES: Record<WorkspaceSubscriptionStatus, { label: string; className: string }> = {
	ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
	PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
	PAST_DUE: { label: "Past due", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
	CANCELED: { label: "Canceled", className: "bg-muted text-muted-foreground" },
	EXPIRED: { label: "Expired", className: "bg-muted text-muted-foreground" },
};

interface BillingSectionProps {
	workspaceId: string;
}

const BillingSection = ({ workspaceId }: BillingSectionProps) => {
	const setSettingsOpen = useSettingsDialog((state) => state.setOpen);
	const setBillingOpen = useBillingDialog((state) => state.setOpen);

	const subscriptionQuery = useWorkspaceSubscription(workspaceId);
	const plansQuery = useBillingPlans();
	const subscription = subscriptionQuery.data;
	const currentPlan = plansQuery.data?.items.find(
		(plan) => plan.code === subscription?.plan.code,
	);
	const currentPrice = currentPlan?.prices.find(
		(price) => price.id === subscription?.planPriceId,
	);
	const isFree = subscription?.plan.code === "FREE";

	const openPlans = () => {
		setSettingsOpen(false);
		setBillingOpen(true);
	};

	const header = (
		<SettingsHeader
			title='Billing'
			description='Your workspace plan, limits and payments.'
		/>
	);

	if (subscriptionQuery.isPending) {
		return (
			<div>
				{header}
				<Skeleton className='h-44 w-full rounded-xl' />
			</div>
		);
	}

	if (subscriptionQuery.isError || !subscription) {
		return (
			<div>
				{header}
				<div
					role='alert'
					className='flex flex-col items-center gap-3 rounded-xl border py-12 text-center'
				>
					<p className='text-sm text-muted-foreground'>
						Could not load the billing information.
					</p>
					<Button
						variant='outline'
						size='sm'
						onClick={() => void subscriptionQuery.refetch()}
					>
						<RotateCw className='size-3.5' />
						Retry
					</Button>
				</div>
			</div>
		);
	}

	const status = STATUS_STYLES[subscription.status];

	return (
		<div>
			{header}

			<section className='mb-5 overflow-hidden rounded-xl border p-5'>
				<div className='flex flex-wrap items-start justify-between gap-4'>
					<div className='min-w-0'>
						<p className='text-[12.5px] leading-[19px] text-muted-foreground'>
							Current plan
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h3 className='text-lg font-semibold leading-[27px]'>{subscription.plan.name}</h3>
							<span
								className={cn(
									"rounded-full px-2 py-0.5 text-[11.5px] font-medium leading-[17px]",
									status.className,
								)}
							>
								{status.label}
							</span>
						</div>
						<p className='mt-1 text-[13.5px] leading-5 text-muted-foreground'>
							{isFree
								? "Free forever. Upgrade any time for more members and storage."
								: currentPrice
									? `${currentPrice.amount.toLocaleString("vi-VN")} ${currentPrice.currency} / ${
											currentPrice.billingInterval === "YEARLY" ? "year" : "month"
										}`
									: (currentPlan?.description ?? "")}
						</p>
					</div>
					<Button onClick={openPlans}>
						{isFree ? "Upgrade plan" : "Change plan"}
					</Button>
				</div>

				<div className='pt-3.5'>
					<p className='mb-3 text-[12.5px] font-medium leading-[19px] text-muted-foreground'>
						Included in your plan
					</p>
					{plansQuery.isPending ? (
						<div className='grid gap-2 sm:grid-cols-2'>
							{Array.from({ length: 4 }, (_, index) => (
								<Skeleton key={index} className='h-5 w-3/4' />
							))}
						</div>
					) : currentPlan && currentPlan.features.length > 0 ? (
						<ul className='grid gap-2 text-[13px] leading-5 sm:grid-cols-2'>
							{currentPlan.features.map((feature) => (
								<li key={feature.id} className='flex items-center gap-2'>
									<Check aria-hidden className='size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
									{formatFeature(feature)}
								</li>
							))}
						</ul>
					) : (
						<p className='text-sm text-muted-foreground'>No plan limits listed.</p>
					)}
				</div>
			</section>

			<SettingsGroup title='Subscription'>
				<SettingsRow label='Billing period'>
					<span className='text-[13.5px] text-muted-foreground'>
						{isFree
							? "—"
							: `${formatSettingsDate(subscription.currentPeriodStart)} – ${formatSettingsDate(subscription.currentPeriodEnd)}`}
					</span>
				</SettingsRow>
				<SettingsRow
					label={subscription.cancelAtPeriodEnd ? "Ends on" : "Renews on"}
				>
					<span className='text-[13.5px] text-muted-foreground'>
						{isFree ? "—" : formatSettingsDate(subscription.currentPeriodEnd)}
					</span>
				</SettingsRow>
				<SettingsRow label='Payment method'>
					<span className='text-[13.5px] text-muted-foreground'>
						{subscription.provider === "STRIPE"
							? "Card (Stripe)"
							: subscription.provider === "SEPAY"
								? "Bank transfer (SePay)"
								: "—"}
					</span>
				</SettingsRow>
			</SettingsGroup>

			<PaymentHistory workspaceId={workspaceId} />
		</div>
	);
};

const ORDER_STATUS_STYLES: Record<PaymentOrderStatus, { label: string; className: string }> = {
	PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
	PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
	FAILED: { label: "Failed", className: "bg-destructive/10 text-destructive" },
	EXPIRED: { label: "Expired", className: "bg-muted text-muted-foreground" },
	CANCELED: { label: "Canceled", className: "bg-muted text-muted-foreground" },
};

function PaymentHistory({ workspaceId }: { workspaceId: string }) {
	const { data: access } = useWorkspaceAccess(workspaceId);
	const canView = access?.permissions.includes("workspace.update") ?? false;
	const ordersQuery = useWorkspacePaymentOrders(workspaceId, canView);

	if (!canView) return null;

	return (
		<SettingsGroup title='Payment history'>
			{ordersQuery.isPending ? (
				<div className='space-y-2 py-4'>
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} className='h-8 w-full' />
					))}
				</div>
			) : ordersQuery.isError ? (
				<p role='alert' className='py-4 text-sm text-muted-foreground'>
					Could not load the payment history.
				</p>
			) : ordersQuery.data.length === 0 ? (
				<p className='py-4 text-sm text-muted-foreground'>
					No payments yet. Payments appear here after you upgrade.
				</p>
			) : (
				<div className='overflow-x-auto'>
					<table className='w-full text-[13px] leading-5 [&_tbody_tr:last-child]:border-b-0'>
						<thead>
							<tr className='h-11 text-left text-xs text-muted-foreground'>
								<th className='w-[140px] pr-4 font-medium'>Date</th>
								<th className='pr-4 font-medium'>Plan</th>
								<th className='w-[130px] pr-4 font-medium'>Method</th>
								<th className='w-[130px] pr-4 font-medium'>Amount</th>
								<th className='w-[90px] text-right font-medium'>Status</th>
							</tr>
						</thead>
						<tbody>
							{ordersQuery.data.map((order) => {
								const status = ORDER_STATUS_STYLES[order.status];
								return (
									<tr key={order.id} className='h-11 border-b'>
										<td className='pr-4 whitespace-nowrap text-muted-foreground'>
											{formatSettingsDate(order.paidAt ?? order.createdAt)}
										</td>
										<td className='pr-4'>
											{order.planName}
											<span>
												{" "}
												· {order.billingInterval === "YEARLY" ? "Yearly" : "Monthly"}
											</span>
										</td>
										<td className='pr-4 text-muted-foreground'>
											{order.provider === "STRIPE" ? "Card" : "Bank transfer"}
										</td>
										<td className='pr-4 font-medium tabular-nums whitespace-nowrap'>
											{order.amount.toLocaleString("vi-VN")} {order.currency}
										</td>
										<td className='text-right'>
											<span
												className={cn(
													"rounded-full px-2 py-0.5 text-[11.5px] font-medium leading-[17px]",
													status.className,
												)}
											>
												{status.label}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</SettingsGroup>
	);
}

export default BillingSection;
