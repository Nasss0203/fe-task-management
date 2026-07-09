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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { BillingSection } from "../shared/billing-admin.types";
import { getBillingSearchPlaceholder } from "../shared/billing-admin.utils";
import {
	adminActionButtonClass,
	adminFieldLabelClass,
	adminPanelCompactClass,
} from "../shared/theme";

type Props = {
	section: BillingSection;
	search: string;
	status: string;
	kind: string;
	createdAt: string;
	onSectionChange: (value: BillingSection) => void;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onKindChange: (value: string) => void;
	onCreatedAtChange: (value: string) => void;
	onReset: () => void;
};

const SECTION_ITEMS: { value: BillingSection; label: string }[] = [
	{ value: "SUBSCRIPTIONS", label: "Subscriptions" },
	{ value: "PLANS", label: "Gói dịch vụ" },
];

const selectClass =
	"h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

export function BillingFilterBar({
	section,
	search,
	status,
	kind,
	createdAt,
	onSectionChange,
	onSearchChange,
	onStatusChange,
	onKindChange,
	onCreatedAtChange,
	onReset,
}: Props) {
	const statusOptions =
		section === "PLANS"
			? [
					{ value: "all", label: "Tất cả" },
					{ value: "ACTIVE", label: "Đang bán" },
					{ value: "DISABLED", label: "Đã tắt" },
					{ value: "DRAFT", label: "Bản nháp" },
				]
			: [
					{ value: "all", label: "Tất cả" },
					{ value: "ACTIVE", label: "Active" },
					{ value: "EXPIRED", label: "Expired" },
					{ value: "CANCELED", label: "Canceled" },
				];

	const kindOptions =
		section === "PLANS"
			? [
					{ value: "all", label: "Tất cả" },
					{ value: "enterprise", label: "Enterprise-ready" },
				]
			: [
					{ value: "all", label: "Tất cả" },
					{ value: "MONTHLY", label: "Thanh toán tháng" },
					{ value: "YEARLY", label: "Thanh toán năm" },
				];

	const kindLabel = section === "PLANS" ? "Loại gói" : "Chu kỳ thanh toán";
	const hasActiveFilter =
		status !== "all" || kind !== "all" || createdAt !== "all";

	return (
		<div className={cn(adminPanelCompactClass, "p-4 md:p-5")}>
			<div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
			<ToggleGroup
				type='single'
				variant='outline'
				spacing={2}
				value={section}
				onValueChange={(value) => {
					if (value) onSectionChange(value as BillingSection);
				}}
			>
				{SECTION_ITEMS.map((item) => (
					<ToggleGroupItem
						key={item.value}
						value={item.value}
						className='h-10 rounded-xl border-[#CBD5E1] bg-white px-4 text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] data-[state=on]:border-primary/20 data-[state=on]:bg-primary/10 data-[state=on]:text-primary'
					>
						{item.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<div className='flex w-full items-center gap-3 lg:max-w-xl'>
				<InputGroup className='h-10 w-full max-w-xl rounded-xl border border-input bg-white text-foreground shadow-sm'>
					<InputGroupInput
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder={getBillingSearchPlaceholder(section)}
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
							aria-label='Mở bộ lọc billing'
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
						className='w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-4 text-foreground shadow-xl sm:w-[380px]'
					>
						<div className='flex flex-col gap-4'>
							<div>
								<p className='text-sm font-semibold text-foreground'>
									Bộ lọc {section === "PLANS" ? "gói dịch vụ" : "subscription"}
								</p>
								<p className='mt-1 text-xs text-muted-foreground'>
									Lọc theo trạng thái, {kindLabel.toLowerCase()} và thời gian.
								</p>
							</div>

							<div className='flex flex-col gap-2'>
								<label className={adminFieldLabelClass}>Trạng thái</label>
								<Select value={status} onValueChange={onStatusChange}>
									<SelectTrigger className={selectClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{statusOptions.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className='flex flex-col gap-2'>
								<label className={adminFieldLabelClass}>{kindLabel}</label>
								<Select value={kind} onValueChange={onKindChange}>
									<SelectTrigger className={selectClass}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{kindOptions.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className='flex flex-col gap-2'>
								<label className={adminFieldLabelClass}>Thời gian</label>
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
								className={cn("w-full", adminActionButtonClass)}
							>
								<RotateCcw data-icon='inline-start' />
								Đặt lại bộ lọc
							</Button>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			</div>
		</div>
	);
}
