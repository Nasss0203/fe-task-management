"use client";

import { Button } from "@/components/ui/button";
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
	if (!date) return "";

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
	if (!value) return undefined;

	const [year, month, day] = value.split("-").map(Number);

	if (!year || !month || !day) return undefined;

	return new Date(year, month - 1, day);
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
		"h-9 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

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
					className='w-[300px] rounded-2xl border border-border bg-white p-3 text-foreground shadow-xl'
				>
					<div className='space-y-3'>
						<div>
							<p className='text-sm font-semibold text-[#0F172A]'>
								Bộ lọc người dùng
							</p>
							<p className='mt-1 text-xs text-[#64748B]'>
								Lọc theo trạng thái
								{showRoleFilter ? ", vai trò hệ thống" : ""} và ngày tạo.
							</p>
						</div>

						<div className='space-y-1.5'>
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
								showRoleFilter ? "space-y-1.5" : "hidden"
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

						<div className='space-y-1.5'>
							<label className={adminFieldLabelClass}>Ngày tạo</label>
							<div className='flex items-center gap-2'>
								<div className='relative min-w-0 flex-1'>
									<CalendarDays className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]' />
									<input
										type='date'
										value={formatDate(createdAt)}
										onChange={(event) =>
											onCreatedAtChange(parseDate(event.target.value))
										}
										className='h-9 w-full rounded-xl border border-input bg-white pl-9 pr-3 text-sm text-[#334155] outline-none transition hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15'
									/>
								</div>

								{createdAt && (
									<button
										type='button'
										onClick={() => onCreatedAtChange(undefined)}
										className='h-9 shrink-0 rounded-xl border border-border bg-white px-3 text-xs font-medium text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]'
									>
										Xóa
									</button>
								)}
							</div>
						</div>

						<Button
							type='button'
							variant='outline'
							onClick={onReset}
							className={`h-9 w-full ${adminActionButtonClass}`}
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
