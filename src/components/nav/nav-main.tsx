"use client";

import { ChevronRight, Ellipsis, type LucideIcon } from "lucide-react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { DialogTask } from "../dialog";
import {
	PopoverContentV2,
	PopoverDescriptionV2,
	PopoverHeaderV2,
	PopoverTitleV2,
	PopoverTriggerV2,
	PopoverV2,
} from "../popover/popover-custom";
import { SidebarMenuButtonV2 } from "../sidebar";
import {
	SidebarGroupLabelV2,
	SidebarGroupV2,
	SidebarMenuItemV2,
	SidebarMenuSubButtonV2,
	SidebarMenuSubItemV2,
	SidebarMenuSubV2,
	SidebarMenuV2,
} from "../sidebar/sidebar-custom";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	return (
		<SidebarGroupV2>
			<SidebarGroupLabelV2>Platform</SidebarGroupLabelV2>
			<SidebarMenuV2>
				{items.map((item) => (
					<Collapsible
						key={item.title}
						asChild
						defaultOpen={item.isActive}
						className='group/collapsible'
					>
						<SidebarMenuItemV2>
							<SidebarMenuButtonV2
								tooltip={item.title}
								variant={"default"}
								className=''
							>
								<CollapsibleTrigger
									asChild
									className='hover:bg-neutral-700 rounded-xs '
								>
									<ChevronRight className='transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
								</CollapsibleTrigger>
								<Link href={item.url}>
									<span>{item.title}</span>
								</Link>
								<PopoverV2>
									<PopoverTriggerV2
										asChild
										className='hover:bg-neutral-700 rounded-xs ml-auto'
									>
										<Ellipsis size={12} />
									</PopoverTriggerV2>
									<PopoverContentV2
										align='start'
										side='right'
										sideOffset={15}
									>
										<PopoverHeaderV2>
											<PopoverTitleV2>
												Trang
											</PopoverTitleV2>
											<PopoverDescriptionV2>
												Description text here.
											</PopoverDescriptionV2>
										</PopoverHeaderV2>
									</PopoverContentV2>
								</PopoverV2>
								<DialogTask></DialogTask>
							</SidebarMenuButtonV2>
							<CollapsibleContent>
								<SidebarMenuSubV2>
									{item.items?.map((subItem) => (
										<SidebarMenuSubItemV2
											key={subItem.title}
										>
											<SidebarMenuSubButtonV2 asChild>
												<a href={subItem.url}>
													<span>{subItem.title}</span>
												</a>
											</SidebarMenuSubButtonV2>
										</SidebarMenuSubItemV2>
									))}
								</SidebarMenuSubV2>
							</CollapsibleContent>
						</SidebarMenuItemV2>
					</Collapsible>
				))}
			</SidebarMenuV2>
		</SidebarGroupV2>
	);
}
