import { Check, Minus, RotateCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	useCancelSubscription,
	useResumeSubscription,
} from "@/entities/billing/model/billing.mutations";
import {
	useBillingPlans,
	useWorkspaceEntitlements,
	useWorkspacePaymentOrders,
	useWorkspaceSubscription,
} from "@/entities/billing/model/billing.queries";
import type {
	PaymentOrderStatus,
	WorkspaceEntitlementFeature,
	WorkspaceSubscriptionStatus,
} from "@/entities/billing/model/billing.types";
import { useWorkspaceAccess } from "@/entities/workspace/model/workspace.queries";
import { formatMegabytes, useBillingDialog } from "@/features/workspace-billing";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
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

const HIDDEN_FEATURE_CODES = new Set(["AI_REQUESTS_MONTHLY"]);

const FEATURE_LABELS: Record<string, string> = {
	MAX_MEMBERS: "Members",
	MAX_TEAMSPACES: "Teamspaces",
	MAX_STORAGE_MB: "Storage",
	PUBLIC_PAGE: "Public pages",
};

function usageLevel(usage: number, limit: number): "normal" | "warning" | "exceeded" {
	const ratio = limit > 0 ? usage / limit : 1;
	if (ratio >= 1) return "exceeded";
	if (ratio >= 0.8) return "warning";
	return "normal";
}

const LEVEL_BAR_CLASSES = {
	normal: "bg-primary",
	warning: "bg-amber-500",
	exceeded: "bg-destructive",
} as const;

function UsageItem({ feature }: { feature: WorkspaceEntitlementFeature }) {
	const label = FEATURE_LABELS[feature.code] ?? feature.name;

	if (typeof feature.limit === "boolean") {
		return (
			<li className='flex items-center gap-2 text-[13px] leading-5'>
				{feature.limit ? (
					<Check aria-hidden className='size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
				) : (
					<Minus aria-hidden className='size-3.5 shrink-0 text-muted-foreground' />
				)}
				{label}: {feature.limit ? "Included" : "Not included"}
			</li>
		);
	}

	const usage = feature.usage ?? 0;
	const isStorage = feature.code === "MAX_STORAGE_MB";
	const format = (value: number) =>
		isStorage ? formatMegabytes(value) : value.toLocaleString("en-US");
	const level = usageLevel(usage, feature.limit);

	return (
		<li className='text-[13px] leading-5'>
			<div className='flex items-center justify-between gap-3'>
				<span>{label}</span>
				<span
					className={cn(
						"tabular-nums text-muted-foreground",
						level === "warning" && "text-amber-600 dark:text-amber-400",
						level === "exceeded" && "text-destructive",
					)}
				>
					{format(usage)} / {format(feature.limit)}
				</span>
			</div>
			<div
				role='progressbar'
				aria-label={`${label} usage`}
				aria-valuemin={0}
				aria-valuemax={feature.limit}
				aria-valuenow={usage}
				data-level={level}
				className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'
			>
				<div
					className={cn("h-full rounded-full", LEVEL_BAR_CLASSES[level])}
					style={{
						width: `${feature.limit > 0 ? Math.min(100, (usage / feature.limit) * 100) : 100}%`,
					}}
				/>
			</div>
		</li>
	);
}

type ConfirmAction = "cancel" | "resume";

interface BillingSectionProps {
	workspaceId: string;
}

const BillingSection = ({ workspaceId }: BillingSectionProps) => {
	const setSettingsOpen = useSettingsDialog((state) => state.setOpen);
	const setBillingOpen = useBillingDialog((state) => state.setOpen);

	const subscriptionQuery = useWorkspaceSubscription(workspaceId);
	const plansQuery = useBillingPlans();
	const entitlementsQuery = useWorkspaceEntitlements(workspaceId);
	const { data: access } = useWorkspaceAccess(workspaceId);
	const canManage = access?.permissions.includes("workspace.update") ?? false;
	const cancelSubscription = useCancelSubscription(workspaceId);
	const resumeSubscription = useResumeSubscription(workspaceId);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
	const [renderedAt] = useState(Date.now);
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
	const periodEndInFuture =
		subscription.currentPeriodEnd !== null &&
		new Date(subscription.currentPeriodEnd).getTime() > renderedAt;
	const isActivePaid = !isFree && subscription.status === "ACTIVE";
	const canCancel = canManage && isActivePaid && !subscription.cancelAtPeriodEnd;
	const canResume =
		canManage && isActivePaid && subscription.cancelAtPeriodEnd && periodEndInFuture;
	const showPastDue = canManage && subscription.status === "PAST_DUE";
	const pendingMutation =
		confirmAction === "resume" ? resumeSubscription : cancelSubscription;
	const usageFeatures =
		entitlementsQuery.data?.features.filter(
			(feature) => !HIDDEN_FEATURE_CODES.has(feature.code),
		) ?? [];

	const confirm = () => {
		if (!confirmAction) return;
		pendingMutation.mutate(undefined, {
			onSuccess: () => {
				toast.success(
					confirmAction === "cancel"
						? "Your plan will end at the end of the billing period"
						: "Your plan will renew as usual",
				);
				setConfirmAction(null);
			},
			onError: (error) =>
				toast.error(
					getApiErrorMessage(
						error,
						confirmAction === "cancel"
							? "Couldn't cancel the plan"
							: "Couldn't resume the plan",
					),
				),
		});
	};

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

				{showPastDue && (
					<div
						role='alert'
						className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-500/10 px-3.5 py-3 text-[13px] leading-5 text-amber-700 dark:text-amber-400'
					>
						<p>
							Plan expired on {formatSettingsDate(subscription.currentPeriodEnd)}.
							{subscription.accessEndsAt &&
								` Workspace moves to Free on ${formatSettingsDate(subscription.accessEndsAt)}.`}
						</p>
						<Button size='sm' onClick={openPlans}>
							Renew
						</Button>
					</div>
				)}

				{subscription.cancelAtPeriodEnd && subscription.status === "ACTIVE" && (
					<div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-3.5 py-3 text-[13px] leading-5'>
						<p>
							Plan ends on {formatSettingsDate(subscription.currentPeriodEnd)}. The
							workspace moves to Free after that.
						</p>
						{canResume && (
							<Button size='sm' variant='outline' onClick={() => setConfirmAction("resume")}>
								Resume plan
							</Button>
						)}
					</div>
				)}

				<div className='pt-3.5'>
					<p className='mb-3 text-[12.5px] font-medium leading-[19px] text-muted-foreground'>
						Usage
					</p>
					{entitlementsQuery.isPending ? (
						<div className='grid gap-3 sm:grid-cols-2'>
							{Array.from({ length: 4 }, (_, index) => (
								<Skeleton key={index} className='h-9 w-full' />
							))}
						</div>
					) : entitlementsQuery.isError ? (
						<p role='alert' className='text-sm text-muted-foreground'>
							Could not load the plan usage.
						</p>
					) : usageFeatures.length > 0 ? (
						<ul className='grid gap-x-6 gap-y-3 sm:grid-cols-2'>
							{usageFeatures.map((feature) => (
								<UsageItem key={feature.code} feature={feature} />
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
				{canCancel && (
					<SettingsRow label='Cancel plan'>
						<Button size='sm' variant='outline' onClick={() => setConfirmAction("cancel")}>
							Cancel plan
						</Button>
					</SettingsRow>
				)}
			</SettingsGroup>

			<PaymentHistory workspaceId={workspaceId} />

			<AlertDialog
				open={confirmAction !== null}
				onOpenChange={(open) => {
					if (!open && !pendingMutation.isPending) setConfirmAction(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{confirmAction === "resume" ? "Resume your plan?" : "Cancel your plan?"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmAction === "resume"
								? `${subscription.plan.name} stays active and renews on ${formatSettingsDate(subscription.currentPeriodEnd)}.`
								: `You keep ${subscription.plan.name} until ${formatSettingsDate(subscription.currentPeriodEnd)}. After that the workspace moves to Free and its limits apply.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={pendingMutation.isPending}>
							{confirmAction === "resume" ? "Not now" : "Keep plan"}
						</AlertDialogCancel>
						<Button
							variant={confirmAction === "resume" ? "default" : "destructive"}
							disabled={pendingMutation.isPending}
							onClick={confirm}
						>
							{pendingMutation.isPending
								? "Saving..."
								: confirmAction === "resume"
									? "Resume plan"
									: "Cancel plan"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
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
