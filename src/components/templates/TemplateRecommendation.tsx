import {
	ClipboardList,
	FileText,
	FolderKanban,
	LayoutTemplate,
	Lightbulb,
	type LucideIcon,
} from "lucide-react";

export const getTemplateIcon = (category?: string | null): LucideIcon => {
	switch (category?.toLowerCase()) {
		case "task":
		case "task tracking":
			return ClipboardList;
		case "project":
		case "project management":
			return FolderKanban;
		case "database":
			return FileText;
		case "blank":
			return Lightbulb;
		default:
			return LayoutTemplate;
	}
};

import { type WorkspaceTemplateDto } from "@/services/workspace-template/type";

type TemplateRecommendationProps = {
	templates: WorkspaceTemplateDto[];
	onSelect: (value: string) => void;
};

const TemplateRecommendation = ({
	templates,
	onSelect,
}: TemplateRecommendationProps) => {
	return (
		<div className='flex flex-col gap-4'>
			<div className='text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
				Được đề xuất
			</div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
				{templates.map((item) => {
					const Icon = getTemplateIcon(item.category);

					return (
						<button
							key={item.id}
							type='button'
							onClick={() => onSelect(item.id)}
							className='group cursor-pointer rounded-2xl border border-border/50 bg-muted/10 p-5 text-left transition-all hover:bg-muted/30 hover:border-blue-500/30 hover:shadow-sm hover:shadow-blue-500/5 disabled:cursor-not-allowed disabled:opacity-60'
						>
							<div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-600 text-muted-foreground'>
								<Icon size={18} />
							</div>

							<div className='mb-1.5 text-[15px] font-semibold text-foreground'>
								{item.name}
							</div>

							<div className='text-[13px] leading-relaxed text-muted-foreground'>
								{item.description || "Không có mô tả"}
							</div>
						</button>
					);
				})}
				{templates.length === 0 && (
					<div className='col-span-full py-8 text-center text-sm text-muted-foreground'>
						Không có mẫu nào.
					</div>
				)}
			</div>
		</div>
	);
};

export default TemplateRecommendation;
