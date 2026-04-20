import { RotateCcw, Search } from "lucide-react";

type Props = {
	search: string;
	eventType: string;
	severity: string;
	status: string;
	time: string;
	onSearchChange: (value: string) => void;
	onEventTypeChange: (value: string) => void;
	onSeverityChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onTimeChange: (value: string) => void;
	onReset: () => void;
};

export function MonitoringFilterBar({
	search,
	eventType,
	severity,
	status,
	time,
	onSearchChange,
	onEventTypeChange,
	onSeverityChange,
	onStatusChange,
	onTimeChange,
	onReset,
}: Props) {
	return (
		<div className='rounded-[26px] border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_160px] lg:items-end'>
				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Tìm kiếm
					</label>

					<div className='relative'>
						<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
						<input
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder='Tìm theo event, service hoặc mô tả'
							className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20'
						/>
					</div>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Loại sự kiện
					</label>
					<select
						value={eventType}
						onChange={(e) => onEventTypeChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='REQUEST_ERROR'>Request error</option>
						<option value='QUEUE_FAILED'>Queue failed</option>
						<option value='EMAIL_FAILED'>Email failed</option>
						<option value='WEBHOOK_FAILED'>Webhook failed</option>
						<option value='SYSTEM_LOG'>System log</option>
						<option value='ALERT'>Alert</option>
					</select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Severity
					</label>
					<select
						value={severity}
						onChange={(e) => onSeverityChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='INFO'>Thông tin</option>
						<option value='WARNING'>Cảnh báo</option>
						<option value='CRITICAL'>Nghiêm trọng</option>
					</select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Status
					</label>
					<select
						value={status}
						onChange={(e) => onStatusChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='OPEN'>Mới</option>
						<option value='ACKNOWLEDGED'>Đã ghi nhận</option>
						<option value='RESOLVED'>Đã xử lý</option>
					</select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Thời gian
					</label>
					<select
						value={time}
						onChange={(e) => onTimeChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='1h'>1 giờ gần đây</option>
						<option value='24h'>24 giờ gần đây</option>
						<option value='7d'>7 ngày gần đây</option>
						<option value='30d'>30 ngày gần đây</option>
					</select>
				</div>

				<div>
					<button
						onClick={onReset}
						className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#111111] px-4 text-sm font-medium text-white transition hover:bg-white/5'
					>
						<RotateCcw className='h-4 w-4' />
						Đặt lại
					</button>
				</div>
			</div>
		</div>
	);
}
