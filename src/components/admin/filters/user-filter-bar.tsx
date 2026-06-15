"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	CalendarDays,
	RotateCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";

type Props = {
	search: string;
	status: string;
	role: string;
	createdAt?: Date;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onRoleChange: (value: string) => void;
	onCreatedAtChange: (value: Date | undefined) => void;
	onReset: () => void;
};

const formatDate = (date?: Date) => {
	if (!date) return "Tất cả ngày tạo";

	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

export function UserFilterBar({
	search,
	status,
	role,
	createdAt,
	onSearchChange,
	onStatusChange,
	onRoleChange,
	onCreatedAtChange,
	onReset,
}: Props) {
	const hasActiveFilter =
		status !== "all" || role !== "all" || Boolean(createdAt);

	return (
		<div className='flex items-center gap-3'>
			<InputGroup className='h-10 w-full max-w-xl rounded-xl border-white/10 bg-[#111111] text-white'>
				<InputGroupAddon>
					<Search className='h-4 w-4 text-neutral-500' />
				</InputGroupAddon>

				<InputGroupInput
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder='Tìm theo tên hoặc email'
					className='text-white placeholder:text-neutral-500'
				/>
			</InputGroup>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						type='button'
						variant='outline'
						className={`h-10 rounded-xl border-white/10 bg-[#111111] px-4 text-white hover:bg-white/5 ${
							hasActiveFilter
								? "border-sky-500/40 text-sky-400"
								: ""
						}`}
					>
						<SlidersHorizontal className='h-4 w-4' />
					</Button>
				</PopoverTrigger>

				<PopoverContent
					align='end'
					className='w-[380px] rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 text-white'
				>
					<div className='space-y-4'>
						<div>
							<p className='text-sm font-semibold text-white'>
								Bộ lọc người dùng
							</p>
							<p className='mt-1 text-xs text-neutral-500'>
								Lọc theo trạng thái, vai trò hệ thống và ngày
								tạo.
							</p>
						</div>

						<div className='space-y-2'>
							<label className='text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
								Trạng thái
							</label>

							<select
								value={status}
								onChange={(e) => onStatusChange(e.target.value)}
								className='h-10 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-sky-500/50'
							>
								<option value='all'>Tất cả</option>
								<option value='ACTIVE'>Hoạt động</option>
								<option value='LOCKED'>Bị khóa</option>
							</select>
						</div>

						<div className='space-y-2'>
							<label className='text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
								Vai trò hệ thống
							</label>

							<select
								value={role}
								onChange={(e) => onRoleChange(e.target.value)}
								className='h-10 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-sky-500/50'
							>
								<option value='all'>Tất cả</option>
								<option value='SYSTEM_ADMIN'>
									System Admin
								</option>
								<option value='USER'>User</option>
							</select>
						</div>

						<div className='space-y-2'>
							<label className='text-xs font-medium uppercase tracking-[0.14em] text-neutral-500'>
								Ngày tạo
							</label>

							<div className='rounded-xl border border-white/10 bg-[#111111] p-2'>
								<div className='mb-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm'>
									<div className='flex items-center gap-2 text-neutral-300'>
										<CalendarDays className='h-4 w-4 text-neutral-500' />
										{formatDate(createdAt)}
									</div>

									{createdAt && (
										<button
											type='button'
											onClick={() =>
												onCreatedAtChange(undefined)
											}
											className='text-xs text-neutral-500 hover:text-white'
										>
											Xóa
										</button>
									)}
								</div>

								<Calendar
									mode='single'
									selected={createdAt}
									onSelect={onCreatedAtChange}
									className='w-full rounded-lg border border-white/10 bg-[#0b0b0b] p-3
										[&_.rdp-months]:w-full
										[&_.rdp-month]:w-full
										[&_.rdp-table]:w-full
										[&_.rdp-caption]:w-full
										[&_.rdp-head_row]:grid
										[&_.rdp-head_row]:grid-cols-7
										[&_.rdp-row]:grid
										[&_.rdp-row]:grid-cols-7
										[&_.rdp-cell]:flex
										[&_.rdp-cell]:justify-center
										[&_.rdp-head_cell]:text-center'
									captionLayout='dropdown'
								/>
							</div>
						</div>

						<Button
							type='button'
							variant='outline'
							onClick={onReset}
							className='h-10 w-full rounded-xl border-white/10 bg-[#111111] text-white hover:bg-white/5'
						>
							<RotateCcw className='mr-2 h-4 w-4' />
							Đặt lại bộ lọc
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
