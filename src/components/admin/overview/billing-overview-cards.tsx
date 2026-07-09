import {
	BriefcaseBusiness,
	CreditCard,
	TrendingUp,
	Users,
} from "lucide-react";
import type { BillingPlan, WorkspaceSubscription } from "../shared/billing-admin.types";
import { formatCurrency } from "../shared/billing-admin.utils";

type Props = {
	plans: BillingPlan[];
	subscriptions: WorkspaceSubscription[];
};

export function BillingOverviewCards({ plans, subscriptions }: Props) {
	const activePlans = plans.filter((item) => item.status === "ACTIVE").length;
	const activeSubscriptions = subscriptions.filter(
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
				"bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]",
		},
		{
			title: "Subscription active",
			value: activeSubscriptions,
			helper: "Subscription đang chạy",
			icon: CreditCard,
			iconClass:
				"bg-[#F0FDF4] text-[#22C55E] border border-[#BBF7D0]",
		},
		{
			title: "Khách hàng trả phí",
			value: paidCustomers,
			helper: `${formatCurrency(paidVolume)} đã thanh toán`,
			icon: Users,
			iconClass: "bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]",
		},
	];

	const quickStats = [
		{ label: "Gói đang bán", value: activePlans, icon: BriefcaseBusiness },
		{ label: "Subscription hết hạn", value: expiredSubscriptions, icon: CreditCard },
		{ label: "Tổng volume đã thanh toán", value: formatCurrency(paidVolume), icon: TrendingUp },
	];

	return (
		<div className='space-y-3'>
			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
				{cards.map((card) => {
					const Icon = card.icon;

					return (
						<div
							key={card.title}
							className='rounded-2xl border border-border bg-white p-5 shadow-sm'
						>
							<div className='flex items-start justify-between gap-4'>
								<div className='space-y-2'>
									<p className='text-sm text-[#64748B]'>
										{card.title}
									</p>
									<h3 className='text-3xl font-semibold text-[#0F172A]'>
										{card.value}
									</h3>
									<p className='text-xs text-[#64748B]'>
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

			<div className='grid gap-3 md:grid-cols-3'>
				{quickStats.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className='flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 shadow-sm'
						>
							<div className='flex items-center gap-2'>
								<Icon className='h-4 w-4 text-[#64748B]' />
								<p className='text-sm text-[#64748B]'>
									{item.label}
								</p>
							</div>
							<span className='text-sm font-semibold text-[#0F172A]'>
								{item.value}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
