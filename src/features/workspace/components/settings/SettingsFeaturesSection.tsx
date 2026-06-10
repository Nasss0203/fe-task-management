import { Switch } from "@/components/ui/switch";
import type { WorkspaceFeatureItem } from "@/services/workspace-feature/type";

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
			<div className='rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100'>
				Feature settings decide what this workspace can
				use after the plan allows it.
			</div>

			<div className='rounded-md border border-border bg-muted/50'>
				<div className='flex items-center justify-between gap-4 border-b border-border px-5 py-4'>
					<div>
						<div className='text-sm font-semibold'>
							Sprint
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Enable sprint planning, backlog
							views, and sprint task workflows.
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
							Plan
						</div>
						<div className='mt-1 font-medium'>
							{sprintPlanEnabled
								? "Allowed"
								: "Not allowed"}
						</div>
					</div>
					<div>
						<div className='text-xs uppercase text-muted-foreground'>
							Workspace
						</div>
						<div className='mt-1 font-medium'>
							{sprintFeature?.workspaceEnabled ===
							false
								? "Off"
								: "On"}
						</div>
					</div>
					<div>
						<div className='text-xs uppercase text-muted-foreground'>
							Result
						</div>
						<div className='mt-1 font-medium'>
							{sprintEnabled
								? "Enabled"
								: "Disabled"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
