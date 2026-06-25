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
	status: string;
	plan: string;
	createdAt: string;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onPlanChange: (value: string) => void;
	onCreatedAtChange: (value: string) => void;
	onReset: () => void;
};

export function WorkspaceFilterBar({
	search,
	status,
	plan,
	createdAt,
	onSearchChange,
	onStatusChange,
	onPlanChange,
	onCreatedAtChange,
	onReset,
}: Props) {
	return (
		<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'>
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end'>
				<div className='lg:col-span-4'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
						Tìm kiếm
					</label>

					<div className='relative'>
						<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
						<input
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder='Tìm theo tên, slug hoặc owner'
							className='h-10 w-full rounded-xl border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-sky-500/50'
						/>
					</div>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
						Trạng thái
					</label>
					<Select value={status} onValueChange={(val) => onStatusChange(val)}>
					<SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-sky-500/50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
						<SelectItem value="DELETED">Đã xóa mềm</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
						Gói dịch vụ
					</label>
					<Select value={plan} onValueChange={(val) => onPlanChange(val)}>
					<SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-sky-500/50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="free">Free</SelectItem>
						<SelectItem value="pro">Pro</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
						Ngày tạo
					</label>
					<Select value={createdAt} onValueChange={(val) => onCreatedAtChange(val)}>
					<SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-sky-500/50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả</SelectItem>
						<SelectItem value="7d">7 ngày gần đây</SelectItem>
						<SelectItem value="30d">30 ngày gần đây</SelectItem>
						<SelectItem value="90d">90 ngày gần đây</SelectItem>
					</SelectContent>
				</Select>
				</div>

				<div className='lg:col-span-2'>
					<button
						onClick={onReset}
						className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-4 text-sm font-medium text-white transition hover:bg-white/5'
					>
						<RotateCcw className='h-4 w-4' />
						Đặt lại
					</button>
				</div>
			</div>
		</div>
	);
}
