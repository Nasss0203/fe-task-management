import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

const tabsListVariants = cva(
	"rounded-lg  group-data-[orientation=horizontal]/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
	{
		variants: {
			variant: {
				default: "bg-muted",
				line: "gap-1 bg-transparent",
				none: "",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function TabsListCustom({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
	VariantProps<typeof tabsListVariants>) {
	return (
		<TabsPrimitive.List
			data-slot='tabs-list'
			data-variant={variant}
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	);
}

export default TabsListCustom;
