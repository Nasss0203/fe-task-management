import {
	ChartLine,
	LayoutDashboard,
	LayoutTemplate,
	type LucideIcon,
} from "lucide-react";

export interface CreatorNavItem {
	title: string;
	href: string;
	icon: LucideIcon;
	/** Shown but not clickable until the feature ships. */
	comingSoon?: boolean;
}

export interface CreatorNavGroup {
	label?: string;
	items: CreatorNavItem[];
}

// Sales joins the nav once that feature exists.
export const CREATOR_NAV: CreatorNavGroup[] = [
	{
		items: [
			{ title: "Overview", href: "/creator", icon: LayoutDashboard },
			{
				title: "My templates",
				href: "/creator/templates",
				icon: LayoutTemplate,
			},
			{ title: "Analytics", href: "/creator/analytics", icon: ChartLine },
		],
	},
];

export function isCreatorNavActive(pathname: string, href: string) {
	return href === "/creator"
		? pathname === href
		: pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveCreatorNavItem(pathname: string) {
	return CREATOR_NAV.flatMap((group) => group.items).find((item) =>
		isCreatorNavActive(pathname, item.href),
	);
}
