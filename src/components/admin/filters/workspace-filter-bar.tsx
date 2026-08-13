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
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { adminActionButtonClass } from "../shared/theme";

type Props = {
	search: string;
	status: string;
	createdAt: string;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onCreatedAtChange: (value: string) => void;
	onReset: () => void;
};

const selectClass =
	"h-9 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";
const compactLabelClass =
	"text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground";

export function WorkspaceFilterBar({
	search,
	status,
	createdAt,
	onSearchChange,
	onStatusChange,
	onCreatedAtChange,
	onReset,
}: Props) {
	const hasActiveFilter = status !== "all" || createdAt !== "all";

	return (
		<div className='flex w-full items-center gap-3'>
				<InputGroup className='h-10 w-full max-w-xl rounded-xl border border-input bg-white text-foreground shadow-sm'>
					<InputGroupInput
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder='Tìm theo tên, slug hoặc owner'
						className='text-foreground placeholder:text-muted-foreground'
					/>
					<InputGroupAddon>
						<Search className='size-4 text-muted-foreground' />
					</InputGroupAddon>
				</InputGroup>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							type='button'
							variant='outline'
							size='icon'
							aria-label='Mở bộ lọc workspace'
							className={cn(
								"size-10 rounded-xl border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
								hasActiveFilter &&
									"border-primary/20 bg-primary/10 text-primary",
							)}
						>
							<SlidersHorizontal />
						</Button>
					</PopoverTrigger>

					<PopoverContent
						align='end'
						className='w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-3 text-foreground shadow-xl sm:w-[300px]'
					>
						<div className='flex flex-col gap-3'>
							<div>
								<p className='text-sm font-semibold text-foreground'>
									Bộ lọc workspace
								</p>
								<p className='mt-1 text-xs text-muted-foreground'>
									Trạng thái và ngày tạo.
								</p>
							</div>

							<div className='flex flex-col gap-1.5'>
								<label className={compactLabelClass}>Trạng thái</label>
								<Select value={status} onValueChange={onStatusChange}>
									<SelectTrigger className={selectClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value='all'>Tất cả</SelectItem>
											<SelectItem value='ACTIVE'>Đang hoạt động</SelectItem>
											<SelectItem value='DELETED'>Đã xóa</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className='flex flex-col gap-1.5'>
								<label className={compactLabelClass}>Ngày tạo</label>
								<Select value={createdAt} onValueChange={onCreatedAtChange}>
									<SelectTrigger className={selectClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value='all'>Tất cả</SelectItem>
											<SelectItem value='7d'>7 ngày gần đây</SelectItem>
											<SelectItem value='30d'>30 ngày gần đây</SelectItem>
											<SelectItem value='90d'>90 ngày gần đây</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<Button
								type='button'
								variant='outline'
								onClick={onReset}
								className={cn("h-9 w-full", adminActionButtonClass)}
							>
								<RotateCcw data-icon='inline-start' />
								Đặt lại bộ lọc
							</Button>
						</div>
					</PopoverContent>
				</Popover>
		</div>
	);
}
