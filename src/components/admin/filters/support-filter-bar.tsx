import { RotateCcw, Search } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";


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
					<Select value={issueType} onValueChange={(val) => onIssueTypeChange(val)}>
					<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="SUPPORT_TICKET">Support ticket</SelectItem>
						<SelectItem value="BUG_REPORT">Bug report</SelectItem>
						<SelectItem value="PAYMENT_ISSUE">Lỗi thanh toán</SelectItem>
						<SelectItem value="INVITE_ISSUE">Lỗi invite</SelectItem>
						<SelectItem value="SYNC_ISSUE">Lỗi đồng bộ</SelectItem>
						<SelectItem value="LOGIN_ISSUE">Lỗi đăng nhập</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Trạng thái
					</label>
					<Select value={status} onValueChange={(val) => onStatusChange(val)}>
					<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="OPEN">Mới mở</SelectItem>
						<SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
						<SelectItem value="WAITING_CUSTOMER">Chờ khách hàng</SelectItem>
						<SelectItem value="RESOLVED">Đã xử lý</SelectItem>
						<SelectItem value="CLOSED">Đã đóng</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Priority
					</label>
					<Select value={priority} onValueChange={(val) => onPriorityChange(val)}>
					<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="LOW">Thấp</SelectItem>
						<SelectItem value="MEDIUM">Trung bình</SelectItem>
						<SelectItem value="HIGH">Cao</SelectItem>
						<SelectItem value="URGENT">Khẩn cấp</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Thời gian
					</label>
					<Select value={time} onValueChange={(val) => onTimeChange(val)}>
					<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="24h">24 giờ gần đây</SelectItem>
						<SelectItem value="7d">7 ngày gần đây</SelectItem>
						<SelectItem value="30d">30 ngày gần đây</SelectItem>
					</SelectContent>
				</Select>
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
