import { cn } from "@/lib/utils";
import { Tabs as TabsPrimitive } from "radix-ui";

function TabsTriggerCustom({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot='tabs-trigger'
			className={cn(
				"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-muted-foreground hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				"data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border/60 data-[state=active]:shadow-xs",
				"dark:data-[state=active]:bg-muted dark:data-[state=active]:text-foreground dark:data-[state=active]:border-transparent",
				"px-3.5 py-1.5 bg-transparent cursor-pointer",
				className,
			)}
			{...props}
		/>
	);
}

export default TabsTriggerCustom;
