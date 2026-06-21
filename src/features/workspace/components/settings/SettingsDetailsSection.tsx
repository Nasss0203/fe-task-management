import { formatPlanName } from "./types";

interface SettingsDetailsSectionProps {
	workspaceName: string;
	workspaceSlug: string;
	planName?: string | null;
	createdByName?: string | null;
}

export function SettingsDetailsSection({
	workspaceName,
	workspaceSlug,
	planName,
	createdByName,
}: SettingsDetailsSectionProps) {
	return (
		<div className='max-w-3xl space-y-4'>
			<div className='rounded-md border border-border bg-muted/50 p-5'>
				<div className='mb-4 text-sm font-semibold'>
					Chi tiết workspace
				</div>

				<div className='grid gap-4'>
					<div className='flex items-center justify-between gap-4 border-b border-border pb-3'>
						<span className='text-sm text-muted-foreground'>
							Tên
						</span>
						<span className='text-sm font-medium'>
							{workspaceName}
						</span>
					</div>

					<div className='flex items-center justify-between gap-4 border-b border-border pb-3'>
						<span className='text-sm text-muted-foreground'>
							Đường dẫn (Slug)
						</span>
						<span className='text-sm font-medium'>
							{workspaceSlug}
						</span>
					</div>

					<div className='flex items-center justify-between gap-4'>
						<span className='text-sm text-muted-foreground'>
							Gói
						</span>
						<span className='inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-semibold'>
							{formatPlanName(planName)}
						</span>
					</div>

					{createdByName && (
						<div className='flex items-center justify-between gap-4 border-t border-border pt-3'>
							<span className='text-sm text-muted-foreground'>
								Người tạo
							</span>
							<span className='text-sm font-medium'>
								{createdByName}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
