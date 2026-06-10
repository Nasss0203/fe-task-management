import { getActivityMeta } from "../workspace-overview.mapper";
import { WorkspaceOverviewActivity } from "../workspace-overview.types";
import { formatRelativeTime } from "../workspace-overview.utils";

interface ActivityFeedProps {
	activities: WorkspaceOverviewActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	if (activities?.length === 0) {
		return (
			<div className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm'>
				<h3 className='mb-6 text-lg font-semibold text-foreground'>
					Hoạt động gần đây
				</h3>
				<p className='text-sm text-muted-foreground'>
					Chưa có hoạt động gần đây
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300'>
			<h3 className='mb-6 text-lg font-semibold text-foreground'>
				Hoạt động gần đây
			</h3>
			<div className='space-y-6'>
				{activities?.map((activity, index) => {
					const meta = getActivityMeta(activity.action);
					const Icon = meta.icon;

					return (
						<div key={activity.id} className='group relative flex gap-4 transition-all duration-300 hover:translate-x-1'>
							{/* Connector line */}
							{index !== activities.length - 1 && (
								<div className='absolute left-[19px] top-10 bottom-[-24px] w-[1px] bg-muted' />
							)}

							<div className='relative'>
								<img
									src={
										activity.actor.avatarUrl ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.actor.name)}&background=random`
									}
									alt={activity.actor.name}
									className='h-10 w-10 rounded-full border-2 border-border object-cover'
								/>
								<div className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border text-muted-foreground'>
									<Icon size={10} />
								</div>
							</div>

							<div className='flex flex-col gap-1 pt-0.5'>
								<p className='text-sm text-muted-foreground'>
									<span className='font-bold text-foreground group-hover:text-primary transition-colors'>
										{activity.actor.name}
									</span>{" "}
									{meta.text}{" "}
									{activity.targetName && (
										<span className='font-bold text-foreground'>
											{activity.targetName}
										</span>
									)}
								</p>
								<span className='text-xs text-muted-foreground'>
									{formatRelativeTime(activity.createdAt)}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
