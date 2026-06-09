import { cn } from "@/lib/utils";
import { AlertCircle, Clock, UserPlus } from "lucide-react";
import Link from "next/link";
import { getAttentionMeta } from "../workspace-overview.mapper";
import { WorkspaceOverviewAttentionItem } from "../workspace-overview.types";

interface NeedsAttentionProps {
	workspaceSlug: string;
	items: WorkspaceOverviewAttentionItem[];
}

export function NeedsAttention({ workspaceSlug, items }: NeedsAttentionProps) {
	const getIcon = (type: string) => {
		switch (type) {
			case "overdue":
				return AlertCircle;
			case "deadline-soon":
				return Clock;
			case "unassigned":
				return UserPlus;
			default:
				return AlertCircle;
		}
	};

	const getToneStyles = (tone: string) => {
		switch (tone) {
			case "red":
				return "text-red-400 bg-red-400/5 hover:bg-red-400/10 border-red-400/10";
			case "amber":
				return "text-amber-400 bg-amber-400/5 hover:bg-amber-400/10 border-amber-400/10";
			case "blue":
				return "text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 border-blue-400/10";
			default:
				return "text-zinc-400 bg-zinc-400/5 hover:bg-zinc-400/10 border-zinc-400/10";
		}
	};

	if (items?.length === 0) {
		return (
			<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
				<h3 className='mb-4 text-lg font-semibold text-white'>
					Cần chú ý
				</h3>
				<p className='text-sm text-zinc-500'>Không có cảnh báo nào</p>
			</div>
		);
	}

	return (
		<div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-6'>
			<h3 className='mb-4 text-lg font-semibold text-white'>Cần chú ý</h3>
			<div className='space-y-3'>
				{items?.map((item) => {
					const meta = getAttentionMeta(item, workspaceSlug);
					if (!meta) return null;
					const Icon = getIcon(item.type);

					return (
						<Link
							key={item.id}
							href={meta.href}
							className={cn(
								"flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
								getToneStyles(meta.tone),
							)}
						>
							<div className='flex h-8 w-8 items-center justify-center rounded-full bg-current/10'>
								<Icon size={16} />
							</div>
							<div className='flex flex-col'>
								<span className='text-[10px] font-bold uppercase tracking-wider opacity-70'>
									{meta.badge}
								</span>
								<span className='text-sm font-medium text-white'>
									{meta.buildText(item)}
								</span>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
