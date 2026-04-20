import { RotateCcw, Search } from "lucide-react";

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
		<div className='rounded-[26px] border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end'>
				<div className='lg:col-span-4'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Tìm kiếm
					</label>

					<div className='relative'>
						<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500' />
						<input
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder='Tìm theo tên, slug hoặc owner'
							className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20'
						/>
					</div>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Trạng thái
					</label>
					<select
						value={status}
						onChange={(e) => onStatusChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='ACTIVE'>Đang hoạt động</option>
						<option value='LOCKED'>Bị khóa</option>
						<option value='DELETED'>Đã xóa mềm</option>
					</select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Gói dịch vụ
					</label>
					<select
						value={plan}
						onChange={(e) => onPlanChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='FREE'>Free</option>
						<option value='PRO'>Pro</option>
						<option value='ENTERPRISE'>Enterprise</option>
					</select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Ngày tạo
					</label>
					<select
						value={createdAt}
						onChange={(e) => onCreatedAtChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						<option value='all'>Tất cả</option>
						<option value='7d'>7 ngày gần đây</option>
						<option value='30d'>30 ngày gần đây</option>
						<option value='90d'>90 ngày gần đây</option>
					</select>
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
