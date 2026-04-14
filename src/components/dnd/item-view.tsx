"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import * as React from "react";
import { AvaGroup } from "../avatar";
import { Separator } from "../ui/separator";

type ItemViewProps = React.HTMLAttributes<HTMLDivElement> & {
	id: string;
	isOverlay?: boolean;
	status: string;
	name: string;
};

const STATUS_STYLE = {
	todo: {
		background: "bg-neutral-600/60",
	},
	inprogress: {
		background: "bg-blue-500/20",
	},
	done: {
		background: "bg-emerald-500/30",
	},
} as const;

export const ItemView = React.forwardRef<HTMLDivElement, ItemViewProps>(
	({ id, isOverlay, status, name, className, ...props }, ref) => {
		const normalizedStatus = status
			.trim()
			.toLowerCase()
			.replace(/[\s_-]+/g, "");

		const statusKey: keyof typeof STATUS_STYLE =
			normalizedStatus === "inprogress"
				? "inprogress"
				: normalizedStatus === "done"
					? "done"
					: "todo";

		const s = STATUS_STYLE[statusKey];

		return (
			<div
				ref={ref}
				{...props}
				className={cn(
					"w-full border border-neutral-400 px-4 py-2 rounded-lg bg-stone-100 dark:border-none cursor-pointer hover:opacity-70 transition-opacity",
					"select-none touch-none",
					s.background,
					isOverlay && "shadow-lg",
					className,
				)}
			>
				<div className='flex flex-col gap-1'>
					<div className='flex items-center gap-1'>
						<Plus size={14} />
						<div>{name}</div>
					</div>

					<div className='text-sm font-medium line-clamp-2 mb-2'>
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Nisi sunt necessitatibus odio sed, perferendis dicta
						voluptatem animi voluptatum consequuntur, obcaecati
						fugit aspernatur. Autem unde voluptatem nostrum
						voluptatibus quaerat, soluta alias.
					</div>

					<div className='flex items-center gap-1 flex-wrap'>
						<div className='text-[10px] px-1.5 py-1 bg-blue-500 rounded-sm inline-block'>
							Trung bình
						</div>
						<div className='text-[10px] px-1.5 py-1 bg-blue-500 rounded-sm inline-block'>
							Trung bình
						</div>
						<div className='text-[10px] px-1.5 py-1 bg-blue-500 rounded-sm inline-block'>
							Trung bình
						</div>
						<div className='text-[10px] px-1.5 py-1 bg-green-500 rounded-sm inline-block'>
							Ai biết gì đâu
						</div>
					</div>

					<Separator className='my-1.5' />

					<div className='flex items-center justify-between'>
						<AvaGroup />
						<time className='text-xs'>Mar 10, 2020</time>
					</div>
				</div>
			</div>
		);
	},
);

ItemView.displayName = "ItemView";
