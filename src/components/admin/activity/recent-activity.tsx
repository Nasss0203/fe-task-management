"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ActivityItem } from "@/services/admin/dashboard/type";
import {
	Activity,
	AlertTriangle,
	CreditCard,
	UserRound,
	Workflow,
} from "lucide-react";

type Props = {
	items: ActivityItem[];
};

const getLevelClassName = (level: ActivityItem["level"]) => {
	if (level === "success") return "border-green-500/40 text-green-400";
	if (level === "warning") return "border-yellow-500/40 text-yellow-400";
	if (level === "danger") return "border-red-500/40 text-red-400";
	return "border-blue-500/40 text-blue-400";
};

const getIcon = (type: ActivityItem["type"]) => {
	if (type === "workspace") return Workflow;
	if (type === "billing") return CreditCard;
	if (type === "user") return UserRound;
	if (type === "system") return AlertTriangle;

	return Activity;
};

export function RecentActivity({ items }: Props) {
	return (
		<Card className='rounded-2xl border border-neutral-800 bg-neutral-950/80 text-white'>
			<CardHeader>
				<div className='flex items-start justify-between gap-4'>
					<div>
						<CardTitle className='text-lg font-semibold text-white'>
							Recent Activity
						</CardTitle>
						<CardDescription className='text-sm text-neutral-400'>
							Latest system events across workspaces.
						</CardDescription>
					</div>

					<Button
						variant='outline'
						size='sm'
						className='border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-white'
					>
						View all
					</Button>
				</div>
			</CardHeader>

			<CardContent>
				{items.length === 0 ? (
					<div className='flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
						No recent activity
					</div>
				) : (
					<ScrollArea className='h-[280px] pr-3'>
						<div className='space-y-4'>
							{items.map((item, index) => {
								const Icon = getIcon(item.type);

								return (
									<div key={item.id} className='space-y-4'>
										<div className='flex gap-3'>
											<div className='mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900'>
												<Icon className='h-4 w-4 text-neutral-300' />
											</div>

											<div className='min-w-0 flex-1'>
												<div className='flex items-start justify-between gap-3'>
													<div>
														<p className='text-sm font-semibold text-white'>
															{item.title}
														</p>

														<p className='mt-1 text-sm leading-5 text-neutral-400'>
															{item.description}
														</p>
													</div>

													<span className='shrink-0 text-xs text-neutral-500'>
														{item.time}
													</span>
												</div>

												<div className='mt-2 flex items-center gap-2'>
													<Badge
														variant='outline'
														className={getLevelClassName(
															item.level,
														)}
													>
														{item.level}
													</Badge>

													<Badge
														variant='secondary'
														className='bg-neutral-900 text-neutral-400'
													>
														{item.type}
													</Badge>
												</div>
											</div>
										</div>

										{index < items.length - 1 && (
											<Separator className='bg-neutral-800' />
										)}
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</CardContent>
		</Card>
	);
}
