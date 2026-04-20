import {
	Activity,
	AlertTriangle,
	MailWarning,
	ServerCrash,
	Webhook,
} from "lucide-react";
import type {
	MonitoringService,
	MonitoringSnapshot,
} from "../shared/monitoring-admin.types";

type Props = {
	snapshot: MonitoringSnapshot;
	services: MonitoringService[];
};

export function MonitoringOverviewCards({ snapshot, services }: Props) {
	const unhealthyServices = services.filter(
		(service) => service.status === "DEGRADED" || service.status === "DOWN",
	).length;

	const cards = [
		{
			title: "API uptime",
			value: `${snapshot.apiUptimePercent}%`,
			icon: Activity,
			iconClass:
				"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
		},
		{
			title: "Error rate",
			value: `${snapshot.errorRatePercent}%`,
			icon: AlertTriangle,
			iconClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
		},
		{
			title: "Failed jobs",
			value: snapshot.failedJobs,
			icon: ServerCrash,
			iconClass:
				"bg-violet-500/10 text-violet-400 border border-violet-500/20",
		},
		{
			title: "Failed emails",
			value: snapshot.failedEmails,
			icon: MailWarning,
			iconClass:
				"bg-amber-500/10 text-amber-400 border border-amber-500/20",
		},
	];

	const quickStats = [
		{
			label: "Webhook failed",
			value: snapshot.failedWebhooks,
			icon: Webhook,
		},
		{
			label: "Open alerts",
			value: snapshot.openAlerts,
			icon: AlertTriangle,
		},
		{
			label: "Avg response time",
			value: `${snapshot.avgResponseTimeMs} ms`,
			icon: Activity,
		},
		{
			label: "Service suy giảm",
			value: unhealthyServices,
			icon: ServerCrash,
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
