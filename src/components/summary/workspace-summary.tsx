"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock3, Users } from "lucide-react";

export function WorkspaceSummary() {
	return (
		<Card className='shadow-sm'>
			<CardHeader>
				<CardTitle>Tóm tắt hôm nay</CardTitle>
			</CardHeader>

			<CardContent className='space-y-4'>
				<div className='flex items-center gap-3 rounded-xl bg-muted/50 p-3'>
					<div className='rounded-lg bg-emerald-500/10 p-2 text-emerald-600'>
						<CheckCircle2 className='h-5 w-5' />
					</div>
					<div>
						<p className='text-sm font-medium'>
							18 task đã hoàn thành
						</p>
						<p className='text-xs text-muted-foreground'>
							Tăng 12% so với hôm qua
						</p>
					</div>
				</div>

				<div className='flex items-center gap-3 rounded-xl bg-muted/50 p-3'>
					<div className='rounded-lg bg-blue-500/10 p-2 text-blue-600'>
						<Clock3 className='h-5 w-5' />
					</div>
					<div>
						<p className='text-sm font-medium'>
							7 task đến hạn hôm nay
						</p>
						<p className='text-xs text-muted-foreground'>
							Cần theo dõi và cập nhật
						</p>
					</div>
				</div>

				<div className='flex items-center gap-3 rounded-xl bg-muted/50 p-3'>
					<div className='rounded-lg bg-violet-500/10 p-2 text-violet-600'>
						<Users className='h-5 w-5' />
					</div>
					<div>
						<p className='text-sm font-medium'>
							5 thành viên đang hoạt động
						</p>
						<p className='text-xs text-muted-foreground'>
							Có cập nhật trong 1 giờ gần nhất
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
