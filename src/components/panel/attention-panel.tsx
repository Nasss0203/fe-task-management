"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttentionItem } from "@/types/type";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
	items: AttentionItem[];
};

const attentionTypeLabel: Record<string, string> = {
	Overdue: "Overdue",
	Deadline: "Deadline",
	Unassigned: "Unassigned",
};

const attentionTone: Record<string, string> = {
	Overdue:
		"border-rose-500/20 bg-rose-500/10 text-rose-400",
	Deadline:
		"border-amber-500/20 bg-amber-500/10 text-amber-400",
	Unassigned:
		"border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
};

export function AttentionPanel({ items }: Props) {
	return (
		<Card className='rounded-2xl border-neutral-800 bg-neutral-950/20 shadow-sm'>
			<CardHeader className='pb-3 border-b border-neutral-800/50 bg-neutral-900/40 rounded-t-2xl px-5'>
				<CardTitle className='flex items-center gap-2 text-base text-neutral-100'>
					<span className='flex size-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400'>
						<AlertCircle className='h-4 w-4' />
					</span>
					Needs Attention
				</CardTitle>
			</CardHeader>

			<CardContent className='space-y-3 p-5'>
				{items.map((item) => (
					<div
						key={item.id}
						className={`rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition-all hover:bg-neutral-900/60 hover:border-neutral-700 shadow-sm`}
					>
						<div className='mb-2 flex items-center justify-between gap-2'>
							<div
								className={cn(
									"inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
									attentionTone[item.type] ?? "border-neutral-700 bg-neutral-800/60 text-neutral-300"
								)}
							>
								{attentionTypeLabel[item.type] ?? item.type}
							</div>
						</div>
						<p className='text-[13px] font-medium leading-6 text-neutral-200'>
							{item.title}
						</p>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
