import {
	BadgePercent,
	BriefcaseBusiness,
	CreditCard,
	Wallet,
} from "lucide-react";
import type {
	BillingCoupon,
	BillingPlan,
	WorkspaceSubscription,
} from "../shared/billing-admin.types";
import { formatCurrency } from "../shared/billing-admin.utils";

type Props = {
	plans: BillingPlan[];
	subscriptions: WorkspaceSubscription[];
	coupons: BillingCoupon[];
};

export function BillingOverviewCards({ plans, subscriptions, coupons }: Props) {
	const activePlans = plans.filter((item) => item.status === "ACTIVE").length;

	const activeSubscriptions = subscriptions.filter(
		(item) => item.status === "ACTIVE" || item.status === "TRIAL",
	).length;

	const activeCoupons = coupons.filter(
		(item) => item.status === "ACTIVE",
	).length;

	const monthlyRecurringRevenue = subscriptions.reduce((sum, item) => {
		if (item.status !== "ACTIVE") return sum;
		return (
			sum +
			(item.billingCycle === "YEARLY" ? item.amount / 12 : item.amount)
		);
	}, 0);

	const trialSubscriptions = subscriptions.filter(
		(item) => item.status === "TRIAL",
	).length;

	const expiredSubscriptions = subscriptions.filter(
		(item) => item.status === "EXPIRED",
	).length;

	const paidVolume = subscriptions.reduce((sum, item) => {
		return (
			sum +
			item.paymentHistory
				.filter((payment) => payment.status === "PAID")
				.reduce((paymentSum, payment) => paymentSum + payment.amount, 0)
		);
	}, 0);

	const cards = [
		{
			title: "Gói đang bán",
			value: activePlans,
			icon: BriefcaseBusiness,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
		{
			title: "Subscription active",
			value: activeSubscriptions,
			icon: CreditCard,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "MRR ước tính",
			value: formatCurrency(monthlyRecurringRevenue),
			icon: Wallet,
			iconClass:
				"bg-violet-500/10 text-violet-400 border border-violet-500/20",
		},
		{
			title: "Coupon đang chạy",
			value: activeCoupons,
			icon: BadgePercent,
			iconClass:
				"bg-amber-500/10 text-amber-400 border border-amber-500/20",
		},
	];

	const quickStats = [
		{ label: "Trial đang chạy", value: trialSubscriptions },
		{ label: "Subscription hết hạn", value: expiredSubscriptions },
		{
			label: "Tổng volume đã thanh toán",
			value: formatCurrency(paidVolume),
		},
		{
			label: "Khách hàng trả phí",
			value: subscriptions.filter((item) => item.amount > 0).length,
		},
	];

	return (
		<div className='space-y-3'>
			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{cards.map((card) => {
					const Icon = card.icon;

					return (
						<div
							key={card.title}
							className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'
						>
							<div className='flex items-start justify-between gap-4'>
								<div className='space-y-2'>
									<p className='text-sm text-neutral-400'>
										{card.title}
									</p>
									<h3 className='text-3xl font-semibold text-white'>
										{card.value}
									</h3>
								</div>

								<div
									className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass}`}
								>
									<Icon className='h-5 w-5' />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{quickStats.map((item) => (
					<div
						key={item.label}
						className='flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
					>
						<p className='text-sm text-neutral-400'>{item.label}</p>
						<span className='text-sm font-semibold text-white'>
							{item.value}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
