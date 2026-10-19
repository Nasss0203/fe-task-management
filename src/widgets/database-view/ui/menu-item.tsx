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
				"flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted disabled:pointer-events-none disabled:opacity-50",
				destructive && "hover:bg-destructive/10 hover:text-destructive",
				className,
			)}
		>
			{Icon && <Icon className='size-4 shrink-0 text-muted-foreground' />}
			<span className='min-w-0 flex-1 truncate'>{children}</span>
			{hint && (
				<span className='max-w-[45%] truncate text-xs text-muted-foreground'>
					{hint}
				</span>
			)}
			{submenu && (
				<ChevronRight className='size-4 shrink-0 text-muted-foreground' />
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
		<div className='mb-1 flex h-8 items-center gap-1'>
			<button
				type='button'
				aria-label='Back'
				onClick={onBack}
				className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
			>
				<ChevronLeft className='size-4' />
			</button>
			<span className='flex-1 truncate text-sm font-medium'>{title}</span>
			{action}
		</div>
	);
}

export function MenuSectionLabel({ children }: { children: ReactNode }) {
	return (
		<div className='px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground'>
			{children}
		</div>
	);
}

export function MenuSeparator() {
	return <div className='-mx-1 my-1 border-t' />;
}
