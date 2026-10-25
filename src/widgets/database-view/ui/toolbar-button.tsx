import { cn } from "@/shared/lib/utils";

export function toolbarIconButtonClass(active = false) {
	return cn(
		"relative flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground",
		active && "text-primary hover:text-primary data-[state=open]:text-primary",
	);
}

export function ToolbarCount({ count }: { count: number }) {
	if (count === 0) return null;

	return (
		<span className='absolute -right-0.5 -top-0.5 flex min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-3.5 text-primary-foreground'>
			{count}
		</span>
	);
}
