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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	adminActionButtonClass,
	adminFieldLabelClass,
} from "../shared/theme";

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
	showRoleFilter?: boolean;
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
	showRoleFilter = true,
}: Props) {
	const hasActiveFilter =
		status !== "all" ||
		(showRoleFilter && role !== "all") ||
		Boolean(createdAt);
	const selectClass =
		"h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

	return (
		<div className='flex items-center gap-3'>
			<InputGroup className='h-10 w-full max-w-xl rounded-xl border border-input bg-white text-foreground shadow-sm'>
				<InputGroupAddon>
					<Search className='h-4 w-4 text-[#64748B]' />
				</InputGroupAddon>

				<InputGroupInput
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder='Tìm theo tên hoặc email'
					className='text-foreground placeholder:text-[#94A3B8]'
				/>
			</InputGroup>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						type='button'
						variant='outline'
						className={`h-10 rounded-xl border-[#CBD5E1] bg-white px-4 text-[#334155] hover:bg-[#F8FAFC] ${
							hasActiveFilter
								? "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]"
								: ""
						}`}
					>
						<SlidersHorizontal className='h-4 w-4' />
					</Button>
				</PopoverTrigger>

				<PopoverContent
					align='end'
					className='w-[380px] rounded-2xl border border-border bg-white p-4 text-foreground shadow-xl'
				>
					<div className='space-y-4'>
						<div>
							<p className='text-sm font-semibold text-[#0F172A]'>
								Bộ lọc người dùng
							</p>
							<p className='mt-1 text-xs text-[#64748B]'>
								Lọc theo trạng thái, vai trò hệ thống và ngày tạo.
							</p>
						</div>

						<div className='space-y-2'>
							<label className={adminFieldLabelClass}>Trạng thái</label>
							<Select value={status} onValueChange={(val) => onStatusChange(val)}>
								<SelectTrigger className={selectClass}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Tất cả</SelectItem>
									<SelectItem value='ACTIVE'>Hoạt động</SelectItem>
									<SelectItem value='LOCKED'>Bị khóa</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div
							className={
								showRoleFilter ? "space-y-2" : "hidden"
							}
						>
							<label className={adminFieldLabelClass}>Vai trò hệ thống</label>
							<Select value={role} onValueChange={(val) => onRoleChange(val)}>
								<SelectTrigger className={selectClass}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Tất cả</SelectItem>
									<SelectItem value='USER'>User</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<label className={adminFieldLabelClass}>Ngày tạo</label>
							<div className='rounded-xl border border-border bg-[#F8FAFC] p-2'>
								<div className='mb-2 flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm'>
									<div className='flex items-center gap-2 text-[#334155]'>
										<CalendarDays className='h-4 w-4 text-[#64748B]' />
										{formatDate(createdAt)}
									</div>

									{createdAt && (
										<button
											type='button'
											onClick={() => onCreatedAtChange(undefined)}
											className='text-xs text-[#64748B] hover:text-[#0F172A]'
										>
											Xóa
										</button>
									)}
								</div>

								<Calendar
									mode='single'
									selected={createdAt}
									onSelect={onCreatedAtChange}
									className='w-full rounded-lg border border-border bg-white p-3
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
							className={`w-full ${adminActionButtonClass}`}
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
