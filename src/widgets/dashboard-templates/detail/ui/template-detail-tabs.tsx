"use client";

import React from "react";
import { BarChart3, Eye, GitBranch, MessageSquare, Store } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { TabsList, TabsTrigger } from "@/shared/ui/tabs";

export type TemplateDetailTab =
	| "preview"
	| "versions"
	| "marketplace"
	| "comments"
	| "analytics";

export interface TemplateTabDefinition {
	id: TemplateDetailTab;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

export const TEMPLATE_DETAIL_TABS: TemplateTabDefinition[] = [
	{
		id: "preview",
		label: "Preview",
		icon: Eye,
	},
	{
		id: "versions",
		label: "Versions",
		icon: GitBranch,
	},
	{
		id: "marketplace",
		label: "Marketplace",
		icon: Store,
	},
	{
		id: "comments",
		label: "Comments",
		icon: MessageSquare,
	},
	{
		id: "analytics",
		label: "Analytics",
		icon: BarChart3,
	},
];

interface TemplateDetailTabsListProps {
	activeTab: TemplateDetailTab;
	versionsCount?: number;
	className?: string;
}

export function TemplateDetailTabsList({
	versionsCount,
	className = "",
}: TemplateDetailTabsListProps) {
	return (
		<div className={`border-b border-border/60 pb-px overflow-x-auto scrollbar-none ${className}`}>
			<TabsList className='bg-muted/40 p-1 rounded-xl h-auto gap-1 border border-border/40 inline-flex flex-nowrap'>
				{TEMPLATE_DETAIL_TABS.map((tab) => {
					const Icon = tab.icon;
					const isVersions = tab.id === "versions";

					return (
						<TabsTrigger
							key={tab.id}
							value={tab.id}
							className='px-3.5 py-1.5 text-xs font-medium gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all whitespace-nowrap shrink-0'
						>
							<Icon className='size-3.5 text-muted-foreground' />
							<span>{tab.label}</span>
							{isVersions && typeof versionsCount === "number" && (
								<Badge
									variant='secondary'
									className='text-[10px] px-1.5 py-0 h-4 min-w-4 rounded-md font-mono bg-muted/80 text-foreground/80'
								>
									{versionsCount}
								</Badge>
							)}
						</TabsTrigger>
					);
				})}
			</TabsList>
		</div>
	);
}
