import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { CollapsibleTrigger } from "../../ui/collapsible";

function SidebarMenuItemCustom({
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<div>
			{/* {item.icon && <item.icon />} */}
			<li
				data-slot='sidebar-menu-item'
				data-sidebar='menu-item'
				className={cn("group/menu-item relative", className)}
				{...props}
			/>
			<CollapsibleTrigger asChild>
				<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
			</CollapsibleTrigger>
		</div>
	);
}

export default SidebarMenuItemCustom;
