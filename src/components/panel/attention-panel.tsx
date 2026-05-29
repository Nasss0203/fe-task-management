"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttentionItem } from "@/types/type";
import { AlertCircle } from "lucide-react";

type Props = {
	items: AttentionItem[];
};

const attentionTypeLabel: Record<string, string> = {
	Overdue: "Quá hạn",
	Deadline: "Deadline",
	Unassigned: "Chưa assign",
};

const attentionTone: Record<string, string> = {
	Overdue:
		"border-l-red-500/80 bg-background/45 hover:bg-background/70 [&_.attention-badge]:border-red-500/35 [&_.attention-badge]:bg-red-500/10 [&_.attention-badge]:text-red-500",
	Deadline:
		"border-l-orange-500/80 bg-background/45 hover:bg-background/70 [&_.attention-badge]:border-orange-500/35 [&_.attention-badge]:bg-orange-500/10 [&_.attention-badge]:text-orange-500",
	Unassigned:
		"border-l-yellow-500/80 bg-background/45 hover:bg-background/70 [&_.attention-badge]:border-yellow-500/35 [&_.attention-badge]:bg-yellow-500/10 [&_.attention-badge]:text-yellow-500",
};

export function AttentionPanel({ items }: Props) {
	return (
		<Card className='border-border/60 bg-card/80 shadow-sm'>
			<CardHeader className='pb-3'>
				<CardTitle className='flex items-center gap-2 text-base'>
					<span className='flex size-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500'>
						<AlertCircle className='h-4 w-4' />
					</span>
					Cần chú ý
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-3'>
				{items.map((item) => (
					<div
						key={item.id}
						className={`rounded-xl border border-border/55 border-l-2 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-transparent transition hover:ring-border/60 ${
							attentionTone[item.type] ??
							"border-l-amber-500/70 bg-background/45 hover:bg-background/70"
						}`}
					>
						<div className='mb-2 flex items-center justify-between gap-2'>
							<Badge
								variant='outline'
								className='attention-badge'
							>
								{attentionTypeLabel[item.type] ?? item.type}
							</Badge>
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
