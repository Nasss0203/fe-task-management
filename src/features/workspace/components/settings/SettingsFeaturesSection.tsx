import { Switch } from "@/components/ui/switch";
import type { WorkspaceFeatureItem } from "@/services/workspace-feature/type";
import { Info } from "lucide-react";

interface SettingsFeaturesSectionProps {
	sprintFeature?: WorkspaceFeatureItem;
	sprintPlanEnabled: boolean;
	sprintEnabled: boolean;
	isFeatureLoading: boolean;
	isUpdatingFeature: boolean;
	canUpdate: boolean;
	onToggleSprint: (enabled: boolean) => void;
}

export function SettingsFeaturesSection({
	sprintFeature,
	sprintPlanEnabled,
	sprintEnabled,
	isFeatureLoading,
	isUpdatingFeature,
	canUpdate,
	onToggleSprint,
}: SettingsFeaturesSectionProps) {
	return (
		<div className='max-w-3xl space-y-4'>
			<div className='rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground flex items-center gap-3 shadow-xs'>
				<Info className="size-4.5 text-blue-500 shrink-0" />
				<span>
					Cài đặt tính năng quyết định những gì workspace này có thể sử dụng nếu gói đăng ký cho phép.
				</span>
			</div>

			<div className='rounded-md border border-border bg-muted/50'>
				<div className='flex items-center justify-between gap-4 border-b border-border px-5 py-4'>
					<div>
						<div className='text-sm font-semibold'>
							Sprint
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Bật tính năng lập kế hoạch sprint, xem backlog
							và luồng công việc sprint.
						</div>
					</div>
					<Switch
						checked={sprintEnabled}
						disabled={
							isFeatureLoading ||
							isUpdatingFeature ||
							!sprintPlanEnabled ||
							!canUpdate
						}
						onCheckedChange={onToggleSprint}
						aria-label='Toggle sprint feature'
					/>
				</div>

				<div className='grid grid-cols-3 gap-4 px-5 py-4 text-sm'>
					<div>
						<div className='text-xs uppercase text-muted-foreground'>
							Gói đăng ký
						</div>
						<div className='mt-1 font-medium'>
							{sprintPlanEnabled
								? "Được phép"
								: "Không được phép"}
						</div>
					</div>
					<div>
						<div className='text-xs uppercase text-muted-foreground'>
							Workspace
						</div>
						<div className='mt-1 font-medium'>
							{sprintFeature?.workspaceEnabled ===
							false
								? "Tắt"
								: "Bật"}
						</div>
					</div>
					<div>
						<div className='text-xs uppercase text-muted-foreground'>
							Kết quả
						</div>
						<div className='mt-1 font-medium'>
							{sprintEnabled
								? "Đã bật"
								: "Đã tắt"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
