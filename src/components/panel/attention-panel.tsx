"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttentionItem } from "@/types/type";
import { AlertCircle } from "lucide-react";

type Props = {
	items: AttentionItem[];
};

export function AttentionPanel({ items }: Props) {
	return (
		<Card className='border-amber-200 bg-amber-50/50 shadow-sm dark:border-amber-900 dark:bg-amber-950/20'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-base'>
					<AlertCircle className='h-5 w-5 text-amber-600' />
					Cần chú ý
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-3'>
				{items.map((item) => (
					<div
						key={item.id}
						className='rounded-xl border border-amber-200 bg-background/80 p-3 dark:border-amber-900'
					>
						<div className='mb-2 flex items-center justify-between gap-2'>
							<Badge variant='outline'>{item.type}</Badge>
						</div>
						<p className='text-sm font-medium leading-6'>
							{item.title}
						</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
