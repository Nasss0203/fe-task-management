import { BadgeAlert, Lock, LogIn, ReceiptText } from "lucide-react";
import type { AdminAuditLog } from "../shared/audit-log-admin.types";

type Props = {
	logs: AdminAuditLog[];
};

export function AuditLogOverviewCards({ logs }: Props) {
	const totalLogs = logs.length;
	const criticalLogs = logs.filter(
		(item) => item.severity === "CRITICAL",
	).length;
	const adminLogins = logs.filter(
		(item) => item.action === "ADMIN_LOGIN",
	).length;
	const billingChanges = logs.filter(
		(item) => item.action === "BILLING_CHANGED",
	).length;

	const cards = [
		{
			title: "Tổng log",
			value: totalLogs,
			icon: ReceiptText,
			iconClass: "bg-white/5 text-neutral-300 border border-white/10",
		},
		{
			title: "Log nghiêm trọng",
			value: criticalLogs,
			icon: BadgeAlert,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "Admin login",
			value: adminLogins,
			icon: LogIn,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
		{
			title: "Billing changed",
			value: billingChanges,
			icon: Lock,
			iconClass:
				"bg-amber-500/10 text-amber-400 border border-amber-500/20",
		},
	];

	return (
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
	);
}
