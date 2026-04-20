import {
	AlertTriangle,
	Bug,
	CreditCard,
	LifeBuoy,
	Mail,
	RefreshCcw,
} from "lucide-react";
import type { SupportTicket } from "../shared/support-admin.types";

type Props = {
	tickets: SupportTicket[];
};

export function SupportOverviewCards({ tickets }: Props) {
	const openTickets = tickets.filter(
		(ticket) =>
			ticket.status === "OPEN" ||
			ticket.status === "IN_PROGRESS" ||
			ticket.status === "WAITING_CUSTOMER",
	).length;

	const urgentCases = tickets.filter(
		(ticket) =>
			ticket.priority === "URGENT" &&
			ticket.status !== "RESOLVED" &&
			ticket.status !== "CLOSED",
	).length;

	const workspaceIssues = tickets.filter(
		(ticket) =>
			ticket.issueType === "PAYMENT_ISSUE" ||
			ticket.issueType === "INVITE_ISSUE" ||
			ticket.issueType === "SYNC_ISSUE" ||
			ticket.issueType === "LOGIN_ISSUE",
	).length;

	const waitingCustomer = tickets.filter(
		(ticket) => ticket.status === "WAITING_CUSTOMER",
	).length;

	const cards = [
		{
			title: "Open tickets",
			value: openTickets,
			icon: LifeBuoy,
			iconClass: "bg-white/5 text-neutral-300 border border-white/10",
		},
		{
			title: "Urgent cases",
			value: urgentCases,
			icon: AlertTriangle,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "Workspace issues",
			value: workspaceIssues,
			icon: RefreshCcw,
			iconClass:
				"bg-amber-500/10 text-amber-400 border border-amber-500/20",
		},
		{
			title: "Waiting customer",
			value: waitingCustomer,
			icon: Mail,
			iconClass: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
		},
	];

	const quickStats = [
		{
			label: "Bug report",
			value: tickets.filter((ticket) => ticket.issueType === "BUG_REPORT")
				.length,
			icon: Bug,
		},
		{
			label: "Payment issue",
			value: tickets.filter(
				(ticket) => ticket.issueType === "PAYMENT_ISSUE",
			).length,
			icon: CreditCard,
		},
		{
			label: "Invite issue",
			value: tickets.filter(
				(ticket) => ticket.issueType === "INVITE_ISSUE",
			).length,
			icon: Mail,
		},
		{
			label: "Chưa assign",
			value: tickets.filter((ticket) => !ticket.assigneeName).length,
			icon: LifeBuoy,
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
				{quickStats.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className='flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
						>
							<div className='flex items-center gap-2 text-sm text-neutral-400'>
								<Icon className='h-4 w-4' />
								{item.label}
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
