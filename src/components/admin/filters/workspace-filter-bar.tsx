import { RotateCcw, Search } from "lucide-react";
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
	const selectClass =
		"h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

	return (
		<div className={`${adminPanelCompactClass} p-4`}>
			<div className='grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end'>
				<div className='lg:col-span-4'>
					<label className={adminFieldLabelClass}>Tìm kiếm</label>
					<div className='relative'>
						<Search className={adminSearchIconClass} />
						<input
							value={search}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder='Tìm theo tên, slug hoặc owner'
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
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='ACTIVE'>Đang hoạt động</SelectItem>
							<SelectItem value='DELETED'>Đã xóa mềm</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className={adminFieldLabelClass}>Gói dịch vụ</label>
					<Select value={plan} onValueChange={(val) => onPlanChange(val)}>
						<SelectTrigger className={selectClass}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='free'>Free</SelectItem>
							<SelectItem value='pro'>Pro</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='lg:col-span-2'>
					<label className={adminFieldLabelClass}>Ngày tạo</label>
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
