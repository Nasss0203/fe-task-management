import { RotateCcw, Search } from "lucide-react";

type Props = {
	search: string;
	issueType: string;
	status: string;
	priority: string;
	time: string;
	onSearchChange: (value: string) => void;
	onIssueTypeChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onPriorityChange: (value: string) => void;
	onTimeChange: (value: string) => void;
	onReset: () => void;
};

export function SupportFilterBar({
	search,
	issueType,
	status,
	priority,
	time,
	onSearchChange,
	onIssueTypeChange,
	onStatusChange,
	onPriorityChange,
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
							placeholder='Tìm theo ticket, email, workspace'
							className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20'
						/>
					</div>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Loại vấn đề
					</label>
					<select
						value={issueType}
						onChange={(e) => onIssueTypeChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='SUPPORT_TICKET'>Support ticket</option>
						<option value='BUG_REPORT'>Bug report</option>
						<option value='PAYMENT_ISSUE'>Lỗi thanh toán</option>
						<option value='INVITE_ISSUE'>Lỗi invite</option>
						<option value='SYNC_ISSUE'>Lỗi đồng bộ</option>
						<option value='LOGIN_ISSUE'>Lỗi đăng nhập</option>
					</select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Trạng thái
					</label>
					<select
						value={status}
						onChange={(e) => onStatusChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='OPEN'>Mới mở</option>
						<option value='IN_PROGRESS'>Đang xử lý</option>
						<option value='WAITING_CUSTOMER'>Chờ khách hàng</option>
						<option value='RESOLVED'>Đã xử lý</option>
						<option value='CLOSED'>Đã đóng</option>
					</select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Priority
					</label>
					<select
						value={priority}
						onChange={(e) => onPriorityChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='LOW'>Thấp</option>
						<option value='MEDIUM'>Trung bình</option>
						<option value='HIGH'>Cao</option>
						<option value='URGENT'>Khẩn cấp</option>
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
