import { RotateCcw, Search } from "lucide-react";
import type { BillingSection } from "../shared/billing-admin.types";
import { getBillingSearchPlaceholder } from "../shared/billing-admin.utils";
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
	adminInputClass,
	adminPanelCompactClass,
	adminSearchIconClass,
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
	{ value: "COUPONS", label: "Coupons" },
];

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
			: section === "SUBSCRIPTIONS"
				? [
						{ value: "all", label: "Tất cả" },
						{ value: "ACTIVE", label: "Active" },
						{ value: "TRIAL", label: "Trial" },
						{ value: "EXPIRED", label: "Expired" },
						{ value: "CANCELED", label: "Canceled" },
					]
				: [
						{ value: "all", label: "Tất cả" },
						{ value: "ACTIVE", label: "Đang chạy" },
						{ value: "INACTIVE", label: "Đã tắt" },
						{ value: "EXPIRED", label: "Hết hạn" },
					];

	const kindOptions =
		section === "PLANS"
			? [
					{ value: "all", label: "Tất cả" },
					{ value: "with_trial", label: "Có trial" },
					{ value: "no_trial", label: "Không trial" },
					{ value: "enterprise", label: "Enterprise-ready" },
				]
			: section === "SUBSCRIPTIONS"
				? [
						{ value: "all", label: "Tất cả" },
						{ value: "MONTHLY", label: "Thanh toán tháng" },
						{ value: "YEARLY", label: "Thanh toán năm" },
					]
				: [
						{ value: "all", label: "Tất cả" },
						{ value: "PERCENT", label: "Giảm %" },
						{ value: "FIXED", label: "Giảm cố định" },
						{ value: "TRIAL_DAYS", label: "Ngày trial" },
					];

	const kindLabel =
		section === "PLANS"
			? "Loại gói"
			: section === "SUBSCRIPTIONS"
				? "Chu kỳ thanh toán"
				: "Loại coupon";
	const selectClass =
		"h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

	return (
		<div className={`space-y-4 ${adminPanelCompactClass} p-4`}>
			<div className='flex flex-wrap gap-2'>
				{SECTION_ITEMS.map((item) => (
					<button
						key={item.value}
						onClick={() => onSectionChange(item.value)}
						className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
							section === item.value
								? "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]"
								: "border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC]"
						}`}
					>
						{item.label}
					</button>
				))}
			</div>

			<div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end'>
				<div className='lg:col-span-4'>
					<label className={adminFieldLabelClass}>Tìm kiếm</label>
					<div className='relative'>
						<Search className={adminSearchIconClass} />
						<input
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder={getBillingSearchPlaceholder(section)}
							className={`${adminInputClass} pl-10 pr-4`}
						/>
					</div>
				</div>

				<div className='lg:col-span-2'>
					<label className={adminFieldLabelClass}>Trạng thái</label>
					<Select value={status} onValueChange={(val) => onStatusChange(val)}>
						<SelectTrigger className={selectClass}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statusOptions.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className={adminFieldLabelClass}>{kindLabel}</label>
					<Select value={kind} onValueChange={(val) => onKindChange(val)}>
						<SelectTrigger className={selectClass}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{kindOptions.map((item) => (
								<SelectItem key={item.value} value={item.value}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className={adminFieldLabelClass}>Thời gian</label>
					<Select value={createdAt} onValueChange={(val) => onCreatedAtChange(val)}>
						<SelectTrigger className={selectClass}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='7d'>7 ngày gần đây</SelectItem>
							<SelectItem value='30d'>30 ngày gần đây</SelectItem>
							<SelectItem value='90d'>90 ngày gần đây</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='lg:col-span-2'>
					<button
						onClick={onReset}
						className={`inline-flex w-full items-center justify-center gap-2 ${adminActionButtonClass}`}
					>
						<RotateCcw className='h-4 w-4' />
						Đặt lại
					</button>
				</div>
			</div>
		</div>
	);
}
