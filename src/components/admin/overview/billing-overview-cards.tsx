import {
	BadgePercent,
	BriefcaseBusiness,
	CreditCard,
	TrendingUp,
	Users,
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
	const paidCustomers = subscriptions.filter((item) => item.amount > 0).length;

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
			title: "MRR ước tính",
			value: formatCurrency(monthlyRecurringRevenue),
			helper: "Doanh thu recurring mỗi tháng",
			icon: TrendingUp,
			iconClass:
				"bg-violet-500/10 text-violet-400 border border-violet-500/20",
		},
		{
			title: "Subscription active",
			value: activeSubscriptions,
			helper: `${trialSubscriptions} trial đang chạy`,
			icon: CreditCard,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "Khách hàng trả phí",
			value: paidCustomers,
			helper: `${formatCurrency(paidVolume)} đã thanh toán`,
			icon: Users,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
		{
			title: "Coupon đang chạy",
			value: activeCoupons,
			helper: "Mã còn hiệu lực",
			icon: BadgePercent,
			iconClass:
				"bg-amber-500/10 text-amber-400 border border-amber-500/20",
		},
	];

	const quickStats = [
		{ label: "Gói đang bán", value: activePlans, icon: BriefcaseBusiness },
		{ label: "Trial đang chạy", value: trialSubscriptions, icon: Wallet },
		{ label: "Subscription hết hạn", value: expiredSubscriptions, icon: CreditCard },
		{ label: "Tổng volume đã thanh toán", value: formatCurrency(paidVolume), icon: TrendingUp },
	];

	return (
		<div className='space-y-3'>
			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{cards.map((card) => {
					const Icon = card.icon;

					return (
						<div
							key={card.title}
							className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'
						>
							<div className='flex items-start justify-between gap-4'>
								<div className='space-y-2'>
									<p className='text-sm text-neutral-400'>
										{card.title}
									</p>
									<h3 className='text-3xl font-semibold text-white'>
										{card.value}
									</h3>
									<p className='text-xs text-neutral-500'>
										{card.helper}
									</p>
								</div>

								<div
									className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
								>
									<Icon className='h-5 w-5' />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{quickStats.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className='flex items-center justify-between rounded-xl border border-white/10 bg-[#101010] px-4 py-3'
						>
							<div className='flex items-center gap-2'>
								<Icon className='h-4 w-4 text-neutral-500' />
								<p className='text-sm text-neutral-400'>
									{item.label}
								</p>
							</div>
							<span className='text-sm font-semibold text-white'>
								{item.value}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
