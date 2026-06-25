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
	action: string;
	target: string;
	time: string;
	onSearchChange: (value: string) => void;
	onActionChange: (value: string) => void;
	onTargetChange: (value: string) => void;
	onTimeChange: (value: string) => void;
	onReset: () => void;
};

export function AuditLogFilterBar({
	search,
	action,
	target,
	time,
	onSearchChange,
	onActionChange,
	onTargetChange,
	onTimeChange,
	onReset,
}: Props) {
	return (
		<div className='rounded-[26px] border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end'>
				<div className='lg:col-span-4'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Actor
					</label>

					<div className='relative'>
						<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
						<input
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder='Tìm theo actor, email hoặc target'
							className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20'
						/>
					</div>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Action
					</label>
					<Select value={action} onValueChange={(val) => onActionChange(val)}>
					<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="WORKSPACE_CREATED">Tạo workspace</SelectItem>
						<SelectItem value="WORKSPACE_DELETED">Xóa workspace</SelectItem>
						<SelectItem value="WORKSPACE_LOCKED">Khóa workspace</SelectItem>
						<SelectItem value="USER_LOCKED">Khóa tài khoản</SelectItem>
						<SelectItem value="USER_UNLOCKED">Mở khóa tài khoản</SelectItem>
						<SelectItem value="ROLE_CHANGED">Đổi role</SelectItem>
						<SelectItem value="BILLING_CHANGED">Billing changed</SelectItem>
						<SelectItem value="ADMIN_LOGIN">Admin login</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Target
					</label>
					<Select value={target} onValueChange={(val) => onTargetChange(val)}>
					<SelectTrigger className="h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="WORKSPACE">Workspace</SelectItem>
						<SelectItem value="USER">User</SelectItem>
						<SelectItem value="ROLE">Role</SelectItem>
						<SelectItem value="BILLING">Billing</SelectItem>
						<SelectItem value="AUTH">Auth</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div className='lg:col-span-2'>
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

				<div className='lg:col-span-2'>
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
