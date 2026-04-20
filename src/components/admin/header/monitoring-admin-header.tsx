import { Activity } from "lucide-react";

export function MonitoringAdminHeader() {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
			<div className='space-y-2'>
				<h1 className='text-3xl font-semibold tracking-tight text-white'>
					Monitoring
				</h1>
				<p className='max-w-3xl text-sm text-neutral-400'>
					Giám sát trạng thái server, API, queue, mail, webhook và các
					cảnh báo bất thường trên toàn hệ thống.
				</p>
			</div>

			<div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400'>
				<Activity className='h-4 w-4' />
				System Health
			</div>
		</div>
	);
}
