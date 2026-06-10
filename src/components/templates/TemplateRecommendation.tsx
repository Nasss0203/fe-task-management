import {
	ClipboardList,
	FileText,
	FolderKanban,
	Lightbulb,
	type LucideIcon,
} from "lucide-react";

export type WorkspaceTemplateType =
	| "BLANK_PAGE"
	| "BLANK_DATABASE"
	| "TASK_TRACKER"
	| "PROJECT";

type TemplateOption = {
	key: WorkspaceTemplateType;
	title: string;
	description: string;
	icon: LucideIcon;
};

export const TEMPLATE_OPTIONS: TemplateOption[] = [
	{
		key: "TASK_TRACKER",
		title: "Trình theo dõi nhiệm vụ",
		description: "Sắp xếp hợp lý công việc theo cách của bạn.",
		icon: ClipboardList,
	},
	{
		key: "PROJECT",
		title: "Dự án",
		description: "Quản lý dự án từ đầu đến cuối.",
		icon: FolderKanban,
	},
	{
		key: "BLANK_DATABASE",
		title: "Cơ sở dữ liệu trống",
		description: "Tạo workspace có database cơ bản để tự tùy chỉnh.",
		icon: FileText,
	},
	{
		key: "BLANK_PAGE",
		title: "Trang trống",
		description: "Bắt đầu từ một workspace hoàn toàn trống.",
		icon: Lightbulb,
	},
];

type TemplateRecommendationProps = {
	onSelect: (value: WorkspaceTemplateType) => void;
};

const TemplateRecommendation = ({ onSelect }: TemplateRecommendationProps) => {
	return (
		<div className='flex flex-col gap-4'>
			<div className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>Được đề xuất</div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				{TEMPLATE_OPTIONS.map((item) => {
					const Icon = item.icon;

					return (
						<button
							key={item.key}
							type='button'
							onClick={() => onSelect(item.key)}
							className='group cursor-pointer rounded-2xl border border-border/50 bg-muted/10 p-5 text-left transition-all hover:bg-muted/30 hover:border-blue-500/30 hover:shadow-sm hover:shadow-blue-500/5 disabled:cursor-not-allowed disabled:opacity-60'
						>
							<div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-600 text-muted-foreground'>
								<Icon size={18} />
							</div>

							<div className='mb-1.5 text-[15px] font-semibold text-foreground'>
								{item.title}
							</div>

							<div className='text-[13px] leading-relaxed text-muted-foreground'>
								{item.description}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default TemplateRecommendation;
