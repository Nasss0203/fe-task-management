"use client";

import React from "react";
import { Compass, FileText, Layers } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type TemplateGalleryTab = "explore" | "mine" | "workspace";

interface TemplateGalleryTabsProps {
	activeTab: TemplateGalleryTab;
	onTabChange: (tab: TemplateGalleryTab) => void;
	workspaceName?: string;
}

export function TemplateGalleryTabs({
	activeTab,
	onTabChange,
	workspaceName,
}: TemplateGalleryTabsProps) {
	return (
		<div
			role='tablist'
			aria-label='Template gallery tabs'
			className='inline-flex items-center gap-1 bg-muted/70 p-1 rounded-xl border border-border/50'
		>
			<button
				type='button'
				role='tab'
				aria-selected={activeTab === "explore"}
				onClick={() => onTabChange("explore")}
				className={cn(
					"inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
					activeTab === "explore"
						? "bg-background text-foreground shadow-xs font-semibold"
						: "text-muted-foreground hover:text-foreground hover:bg-background/50",
				)}
			>
				<Compass className='size-3.5' />
				<span>Explore</span>
			</button>

			<button
				type='button'
				role='tab'
				aria-selected={activeTab === "mine"}
				onClick={() => onTabChange("mine")}
				className={cn(
					"inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
					activeTab === "mine"
						? "bg-background text-foreground shadow-xs font-semibold"
						: "text-muted-foreground hover:text-foreground hover:bg-background/50",
				)}
			>
				<FileText className='size-3.5' />
				<span>My templates</span>
			</button>

			<button
				type='button'
				role='tab'
				aria-selected={activeTab === "workspace"}
				onClick={() => onTabChange("workspace")}
				className={cn(
					"inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
					activeTab === "workspace"
						? "bg-background text-foreground shadow-xs font-semibold"
						: "text-muted-foreground hover:text-foreground hover:bg-background/50",
				)}
			>
				<Layers className='size-3.5' />
				<span>Workspace</span>
				{workspaceName && (
					<span className='hidden sm:inline-block max-w-[100px] truncate text-[10px] text-muted-foreground ml-0.5 font-normal'>
						({workspaceName})
					</span>
				)}
			</button>
		</div>
	);
}
