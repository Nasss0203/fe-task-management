import { getActivityMeta } from "../workspace-overview.mapper";
import { WorkspaceOverviewActivity } from "../workspace-overview.types";
import { formatRelativeTime } from "../workspace-overview.utils";

interface ActivityFeedProps {
	activities: WorkspaceOverviewActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
	if (activities?.length === 0) {
		return (
			<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
				<h3 className='mb-6 text-lg font-semibold text-white'>
					Hoạt động gần đây
				</h3>
				<p className='text-sm text-zinc-500'>
					Chưa có hoạt động gần đây
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
			<h3 className='mb-6 text-lg font-semibold text-white'>
				Hoạt động gần đây
			</h3>
			<div className='space-y-6'>
				{activities?.map((activity, index) => {
					const meta = getActivityMeta(activity.action);
					const Icon = meta.icon;

					return (
						<div key={activity.id} className='relative flex gap-4'>
							{/* Connector line */}
							{index !== activities.length - 1 && (
								<div className='absolute left-[19px] top-10 bottom-[-24px] w-[1px] bg-zinc-800' />
							)}

							<div className='relative'>
								<img
									src={
										activity.actor.avatarUrl ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.actor.name)}&background=random`
									}
									alt={activity.actor.name}
									className='h-10 w-10 rounded-full border-2 border-zinc-800 object-cover'
								/>
								<div className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400'>
									<Icon size={10} />
								</div>
							</div>

							<div className='flex flex-col gap-1 pt-0.5'>
								<p className='text-sm text-zinc-300'>
									<span className='font-bold text-white'>
										{activity.actor.name}
									</span>{" "}
									{meta.text}{" "}
									{activity.targetName && (
										<span className='font-bold text-white'>
											{activity.targetName}
										</span>
									)}
								</p>
								<span className='text-xs text-zinc-500'>
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
