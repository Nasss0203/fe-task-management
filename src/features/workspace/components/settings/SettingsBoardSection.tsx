import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { WorkspaceLayoutMode } from "@/services/workspace/type";
import { LayoutList } from "lucide-react";

interface SettingsBoardSectionProps {
	currentLayoutMode?: WorkspaceLayoutMode | null;
	isUpdatingLayout: boolean;
	canUpdate: boolean;
	onUpdateLayoutMode: (layoutMode: string) => void;
}

export function SettingsBoardSection({
	currentLayoutMode,
	isUpdatingLayout,
	canUpdate,
	onUpdateLayoutMode,
}: SettingsBoardSectionProps) {
	return (
		<div className='max-w-3xl space-y-4'>
			<div className='rounded-md border border-border bg-muted/50 p-5'>
				<div className='flex items-start gap-3'>
					<LayoutList className='mt-0.5 size-5 text-muted-foreground' />
					<div className='min-w-0 flex-1'>
						<div className='text-sm font-semibold'>
							Bố cục workspace
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Chọn xem workspace này mở theo bố cục tab (kiểu Jira) 
							hay trang dạng khối (kiểu Notion).
						</div>

						<div className='mt-4 max-w-xs'>
							<Select
								value={
									currentLayoutMode ??
									WorkspaceLayoutMode.TABS
								}
								onValueChange={onUpdateLayoutMode}
								disabled={isUpdatingLayout || !canUpdate}
							>
								<SelectTrigger className='w-full border-border bg-background text-foreground'>
									<SelectValue placeholder='Chọn bố cục' />
								</SelectTrigger>
								<SelectContent className='border-border bg-popover text-foreground'>
									<SelectItem value={WorkspaceLayoutMode.TABS}>
										Tabs
									</SelectItem>
									<SelectItem value={WorkspaceLayoutMode.BLOCKS}>
										Khối
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='mt-3 text-xs text-muted-foreground'>
							Bố cục Tabs hiển thị Tổng quan và các Trang con.
							Bố cục Blocks mở thẳng vào danh sách khối trang.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
