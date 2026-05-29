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
		<Card className='border-border/80 bg-card/80 shadow-sm'>
			<CardHeader>
				<CardTitle>Hoạt động gần đây</CardTitle>
				<p className='text-sm text-muted-foreground'>
					Hoạt động gần đây trong workspace
				</p>
			</CardHeader>

			<CardContent className='space-y-0'>
				{items.map((activity, index) => (
					<div key={activity.id}>
						<div className='flex items-start gap-3 py-1'>
							<Avatar className='h-8 w-8 border border-border'>
								<AvatarFallback className='text-xs'>
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
							<Separator className='my-3' />
						)}
					</div>
				))}
			</CardContent>
		</Card>
	);
}
