import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarningItem } from "@/lib/mock-data";
import { AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface NeedsAttentionProps {
	items: WarningItem[];
	slug: string;
}

export const NeedsAttention = ({ items, slug }: NeedsAttentionProps) => {
	const typeConfig = {
		overdue: {
			color: "text-red-400",
			bg: "bg-red-500/10",
			border: "border-red-500/10",
		},
		deadline: {
			color: "text-amber-400",
			bg: "bg-amber-500/10",
			border: "border-amber-500/10",
		},
		unassigned: {
			color: "text-orange-400",
			bg: "bg-orange-500/10",
			border: "border-orange-500/10",
		},
	};

	return (
		<Card className='relative overflow-hidden border-white/5 bg-zinc-900/50 backdrop-blur-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]'>
			<CardHeader className='pt-8 px-8 pb-4'>
				<CardTitle className='text-lg font-semibold tracking-tight text-foreground'>
					Cần chú ý
				</CardTitle>
			</CardHeader>
			<CardContent className='px-8 pb-8 space-y-3'>
				{items.map((item) => {
					const config = typeConfig[item.type];
					return (
						<Link
							key={item.id}
							href={`/dashboard/${slug}${item.link}`}
							className='group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] p-3.5 transition-all hover:bg-white/[0.04] hover:border-white/10'
						>
							<div className='flex items-center gap-4'>
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ${config.color} border ${config.border}`}
								>
									<AlertCircle className='h-4.5 w-4.5' />
								</div>
								<div className='space-y-1'>
									<p
										className={`text-[10px] font-bold uppercase tracking-[0.12em] ${config.color}`}
									>
										{item.badge}
									</p>
									<p className='text-[13px] font-medium text-foreground/80 group-hover:text-foreground transition-colors'>
										{item.text}
									</p>
								</div>
							</div>
							<ChevronRight className='h-4 w-4 text-muted-foreground/30 transition-all group-hover:text-muted-foreground/60 group-hover:translate-x-0.5' />
						</Link>
					);
				})}
			</CardContent>
		</Card>
	);
};
