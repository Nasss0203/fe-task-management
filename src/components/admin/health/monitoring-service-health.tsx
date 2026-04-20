import { Clock3, Globe } from "lucide-react";
import type { MonitoringService } from "../shared/monitoring-admin.types";
import {
	formatRelativeTime,
	getServiceCategoryLabel,
	getServiceStatusClass,
	getServiceStatusLabel,
} from "../shared/monitoring-admin.utils";

type Props = {
	services: MonitoringService[];
};

export function MonitoringServiceHealth({ services }: Props) {
	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5'>
				<h2 className='text-2xl font-semibold text-white'>
					Service health
				</h2>
				<p className='mt-1 text-sm text-neutral-400'>
					Theo dõi trạng thái API, database, queue, mail và webhook
					service.
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
				{services.map((service) => (
					<div
						key={service.id}
						className='rounded-3xl border border-white/10 bg-[#101010] p-4'
					>
						<div className='flex items-start justify-between gap-4'>
							<div>
								<p className='text-base font-semibold text-white'>
									{service.name}
								</p>
								<p className='mt-1 text-xs uppercase tracking-[0.16em] text-neutral-500'>
									{getServiceCategoryLabel(service.category)}
								</p>
							</div>

							<span
								className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getServiceStatusClass(
									service.status,
								)}`}
							>
								{getServiceStatusLabel(service.status)}
							</span>
						</div>

						<p className='mt-4 text-sm leading-6 text-neutral-300'>
							{service.message}
						</p>

						<div className='mt-4 grid grid-cols-2 gap-3'>
							<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-3'>
								<p className='text-xs text-neutral-500'>
									Uptime
								</p>
								<p className='mt-1 text-base font-semibold text-white'>
									{service.uptimePercent}%
								</p>
							</div>

							<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-3'>
								<p className='text-xs text-neutral-500'>
									Response time
								</p>
								<p className='mt-1 text-base font-semibold text-white'>
									{service.responseTimeMs} ms
								</p>
							</div>
						</div>

						<div className='mt-4 space-y-2 text-xs text-neutral-500'>
							<div className='flex items-center gap-2'>
								<Clock3 className='h-4 w-4' />
								<span>
									Check{" "}
									{formatRelativeTime(service.lastChecked)}
								</span>
							</div>

							<div className='flex items-center gap-2'>
								<Globe className='h-4 w-4' />
								<span>{service.region ?? "global"}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
