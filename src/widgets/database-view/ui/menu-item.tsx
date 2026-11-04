import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface MenuItemProps extends ComponentProps<"button"> {
	icon?: LucideIcon;
	/** Muted text on the right, e.g. the current value. */
	hint?: ReactNode;
	/** Shows a chevron: the item opens a sub-page. */
	submenu?: boolean;
	destructive?: boolean;
}

/** One row of a Notion-style settings menu. */
export function MenuItem({
	icon: Icon,
	hint,
	submenu,
	destructive,
	className,
	children,
	...props
}: MenuItemProps) {
	return (
		<button
			type='button'
			{...props}
			className={cn(
				"flex h-[30px] w-full items-center gap-[9px] rounded-md px-2 text-left text-[13.5px] outline-none transition-colors hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50",
				destructive && "text-destructive hover:bg-destructive/10",
				className,
			)}
		>
			{Icon && (
				<Icon
					className={cn(
						"size-[15px] shrink-0",
						destructive ? "text-destructive" : "text-muted-foreground",
					)}
				/>
			)}
			<span className='min-w-0 flex-1 truncate'>{children}</span>
			{hint && (
				<span className='max-w-[45%] truncate text-xs text-faint'>
					{hint}
				</span>
			)}
			{submenu && (
				<ChevronRight className='size-3.5 shrink-0 text-faint' />
			)}
		</button>
	);
}

/** Header of a sub-page inside a menu, with a back button. */
export function MenuPageHeader({
	title,
	onBack,
	action,
}: {
	title: string;
	onBack: () => void;
	action?: ReactNode;
}) {
	return (
		<div className='mb-1 flex h-8 items-center gap-1 pl-0.5'>
			<button
				type='button'
				aria-label='Back'
				onClick={onBack}
				className='flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
			>
				<ChevronLeft className='size-3.5' />
			</button>
			<span className='flex-1 truncate text-[13px] font-semibold'>{title}</span>
			{action}
		</div>
	);
}

export function MenuSectionLabel({ children }: { children: ReactNode }) {
	return (
		<div className='px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground'>
			{children}
		</div>
	);
}

export function MenuSeparator() {
	return <div className='-mx-1 my-1 border-t border-border' />;
}
