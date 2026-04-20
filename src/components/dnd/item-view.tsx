"use client";

import { cn } from "@/lib/utils";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import * as React from "react";
import { AvaGroup } from "../avatar";
import { DrawerItemView } from "../drawer/DrawerItemView";
import { Separator } from "../ui/separator";

export const STATUS_STYLE = {
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

type ItemViewProps = React.HTMLAttributes<HTMLDivElement> & {
	id: string;
	isOverlay?: boolean;
	status: string;
	name: string;
	priority?: string;
	description?: string;
	onUpdateName?: (id: string, newName: string) => void;
};

export const ItemView = React.forwardRef<HTMLDivElement, ItemViewProps>(
	(
		{
			id,
			isOverlay,
			status,
			name,
			className,
			description,
			priority,
			onUpdateName,
			...props
		},
		ref,
	) => {
		const { currentWorkspaceId, currentProjectId, setCurrentBoardId } =
			useProjectSelectionStore();

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

		const [localName, setLocalName] = React.useState(name);

		React.useEffect(() => {
			setLocalName(name);
		}, [name]);

		React.useEffect(() => {
			const trimmed = localName.trim();
			const original = name.trim();

			if (!trimmed || trimmed === original) return;

			const timer = setTimeout(() => {
				onUpdateName?.(id, trimmed);
			}, 500);

			return () => clearTimeout(timer);
		}, [localName, name, id, onUpdateName]);

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
						<input
							type='text'
							value={localName}
							onChange={(e) => setLocalName(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onPointerDown={(e) => e.stopPropagation()}
							className='w-full resize-none overflow-hidden border-none bg-transparent text-sm font-extrabold outline-none ring-0 placeholder:font-bold focus:outline-none focus:ring-0'
						/>
						<DrawerItemView
							name={localName}
							projectId={currentProjectId as string}
							workspaceId={currentWorkspaceId as string}
							statusName={status}
							taskId={id}
						/>
					</div>

					<div className='text-sm font-medium line-clamp-2 mb-2'>
						{description}
					</div>

					{priority ? (
						<div className='flex items-center gap-1 flex-wrap'>
							<div className='text-[10px] px-1.5 py-1 bg-blue-500 rounded-sm inline-block'>
								{priority}
							</div>
						</div>
					) : (
						<></>
					)}
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
