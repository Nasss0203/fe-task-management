"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import * as React from "react";

type ItemViewProps = React.HTMLAttributes<HTMLDivElement> & {
	id: string;
	isOverlay?: boolean;
	status: string;
};

export const ItemView = React.forwardRef<HTMLDivElement, ItemViewProps>(
	({ id, isOverlay, status, className, ...props }, ref) => {
		const STATUS_STYLE: Record<string, { background: string }> = {
			todo: {
				background: "bg-neutral-600/80",
			},
			inProgress: {
				background: "bg-blue-500/40",
			},
			done: {
				background: "bg-emerald-500/50",
			},
		};

		const s = STATUS_STYLE[status] ?? STATUS_STYLE.todo;
		return (
			<div
				ref={ref}
				{...props}
				className={cn(
					"w-full border border-neutral-400 px-4 py-2 rounded-lg bg-stone-100  dark:border-none cursor-pointer hover:opacity-70  transition-opacity",
					"select-none touch-none",
					s.background,
					isOverlay ? "shadow-lg" : "",
					className ?? "",
				)}
			>
				<div className=''>
					<div className='flex items-center gap-1'>
						<div className=''>
							<Plus size={14}></Plus>
						</div>
						<div className='font-medium'>{id}</div>
					</div>
					<div></div>
				</div>
			</div>
		);
	},
);

ItemView.displayName = "ItemView";
