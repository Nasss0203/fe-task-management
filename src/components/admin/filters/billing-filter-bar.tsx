import { RotateCcw, Search } from "lucide-react";
import type { BillingSection } from "../shared/billing-admin.types";
import { getBillingSearchPlaceholder } from "../shared/billing-admin.utils";

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
	{ value: "PLANS", label: "Gói dịch vụ" },
	{ value: "SUBSCRIPTIONS", label: "Subscriptions" },
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

	return (
		<div className='space-y-3 rounded-[26px] border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='flex flex-wrap gap-2'>
				{SECTION_ITEMS.map((item) => (
					<button
						key={item.value}
						onClick={() => onSectionChange(item.value)}
						className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
							section === item.value
								? "border border-white/10 bg-white/10 text-white"
								: "border border-white/10 bg-[#111111] text-neutral-400 hover:bg-white/5 hover:text-white"
						}`}
					>
						{item.label}
					</button>
				))}
			</div>

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
							placeholder={getBillingSearchPlaceholder(section)}
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
						{statusOptions.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						{kindLabel}
					</label>
					<select
						value={kind}
						onChange={(e) => onKindChange(e.target.value)}
						className='h-11 w-full rounded-2xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-white/20'
					>
						{kindOptions.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</select>
				</div>

				<div className='lg:col-span-2'>
					<label className='mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500'>
						Thời gian
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
