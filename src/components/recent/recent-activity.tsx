"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActivityItem } from "@/types/type";

type Props = {
	items: ActivityItem[];
};

export function RecentActivity({ items }: Props) {
	return (
		<Card className='shadow-sm'>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<p className='text-sm text-muted-foreground'>
					Hoạt động gần đây trong workspace
				</p>
			</CardHeader>

			<CardContent className='space-y-4'>
				{items.map((activity, index) => (
					<div key={activity.id}>
						<div className='flex items-start gap-3'>
							<Avatar className='h-9 w-9'>
								<AvatarFallback>
									{activity.user.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>

							<div className='min-w-0 flex-1'>
								<p className='text-sm leading-6'>
									<span className='font-medium'>
										{activity.user}
									</span>{" "}
									<span className='text-muted-foreground'>
										{activity.action}
									</span>{" "}
									<span className='font-medium'>
										{activity.target}
									</span>
								</p>
								<p className='text-xs text-muted-foreground'>
									{activity.time}
								</p>
							</div>
						</div>

						{index !== items.length - 1 && (
							<Separator className='mt-4' />
						)}
					</div>
				))}
			</CardContent>
		</Card>
	);
}
