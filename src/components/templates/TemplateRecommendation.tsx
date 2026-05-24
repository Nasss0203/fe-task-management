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
		<div className='flex flex-col gap-5'>
			<div>Được đề xuất</div>

			<div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
				{TEMPLATE_OPTIONS.map((item) => {
					const Icon = item.icon;

					return (
						<button
							key={item.key}
							type='button'
							onClick={() => onSelect(item.key)}
							className='cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 text-left transition hover:border-neutral-600 disabled:cursor-not-allowed disabled:opacity-60'
						>
							<div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800'>
								<Icon size={18} />
							</div>

							<div className='mb-1 text-base font-semibold'>
								{item.title}
							</div>

							<div className='text-sm text-neutral-400'>
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
