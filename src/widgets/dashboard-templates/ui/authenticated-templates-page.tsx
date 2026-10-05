"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useUser } from "@/features/auth";
import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import {
	useInfiniteTemplates,
	type PageTemplate,
} from "@/entities/template";
import {
	MARKETING_TEMPLATES,
	type MarketingTemplate,
} from "@/widgets/landing/data/marketing-data";
import { TemplatesHeader } from "./templates-header";
import {
	TemplateGalleryTabs,
	type TemplateGalleryTab,
} from "./template-gallery-tabs";
import { TemplatesSearchAndFilters } from "./templates-search-and-filters";
import { ExploreTemplateCard } from "./explore-template-card";
import { AuthenticatedTemplateCard } from "./authenticated-template-card";
import { TemplateCardSkeleton } from "./template-card-skeleton";
import { TemplateEmptyState } from "./template-empty-state";
import { TemplateErrorState } from "./template-error-state";
import { TemplateLoadMore } from "./template-load-more";
import { TemplatePreviewDialog } from "./template-preview-dialog";

export function AuthenticatedTemplatesPage() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Tab state with URL param sync (if present)
	const initialTab = useMemo<TemplateGalleryTab>(() => {
		const param = searchParams?.get("tab") || searchParams?.get("view");
		if (param === "mine" || param === "workspace" || param === "explore") {
			return param;
		}
		return "explore";
	}, [searchParams]);

	const [activeTab, setActiveTab] = useState<TemplateGalleryTab>(initialTab);

	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);

	const debouncedSearch = useDebounce(searchQuery, 350);

	// Workspace info
	const { data: workspaces = [], isLoading: isWorkspacesLoading } = useWorkspaces();
	const { user } = useUser();

	const hasLastActiveWorkspace =
		Boolean(user?.lastActiveWorkspaceId) &&
		workspaces.some((w) => w.id === user?.lastActiveWorkspaceId);

	const currentWorkspaceId = hasLastActiveWorkspace
		? user?.lastActiveWorkspaceId
		: workspaces[0]?.id;

	const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

	// Tab change handler
	const handleTabChange = (newTab: TemplateGalleryTab) => {
		setActiveTab(newTab);
		if (searchParams) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", newTab);
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		}
	};

	// 1. Explore Tab Data: Static curated marketing data with local search & category filter
	const filteredExploreTemplates = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return MARKETING_TEMPLATES.filter((template) => {
			const matchesCategory =
				selectedCategory === "All" || template.category === selectedCategory;

			const matchesSearch =
				!query ||
				(template.name && template.name.toLowerCase().includes(query)) ||
				(template.title && template.title.toLowerCase().includes(query)) ||
				(template.description && template.description.toLowerCase().includes(query)) ||
				template.tags.some((tag) => tag.toLowerCase().includes(query));

			return matchesCategory && matchesSearch;
		});
	}, [searchQuery, selectedCategory]);

	// 2. My Templates Tab Data: Backend query
	const myTemplatesQuery = useInfiniteTemplates({
		scope: "mine",
		search: debouncedSearch,
		enabled: activeTab === "mine",
	});

	// 3. Workspace Templates Tab Data: Backend query
	const workspaceTemplatesQuery = useInfiniteTemplates({
		scope: "workspace",
		workspaceId: currentWorkspaceId || undefined,
		search: debouncedSearch,
		enabled: activeTab === "workspace" && Boolean(currentWorkspaceId),
	});

	// Deduplicated items
	const myTemplatesList = useMemo(() => {
		const all = myTemplatesQuery.data?.pages.flatMap((page) => page.items) ?? [];
		const seen = new Set<string>();
		return all.filter((item) => {
			if (seen.has(item.id)) return false;
			seen.add(item.id);
			return true;
		});
	}, [myTemplatesQuery.data]);

	const workspaceTemplatesList = useMemo(() => {
		const all =
			workspaceTemplatesQuery.data?.pages.flatMap((page) => page.items) ?? [];
		const seen = new Set<string>();
		return all.filter((item) => {
			if (seen.has(item.id)) return false;
			seen.add(item.id);
			return true;
		});
	}, [workspaceTemplatesQuery.data]);

	return (
		<div className='flex flex-col flex-1 min-h-0 w-full overflow-y-auto'>
			<div className='mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-8'>
				{/* Header Section */}
				<div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border/50 pb-6'>
					<TemplatesHeader />

					{/* Top Tabs Switcher */}
					<TemplateGalleryTabs
						activeTab={activeTab}
						onTabChange={handleTabChange}
						workspaceName={currentWorkspace?.name}
					/>
				</div>

				{/* Search & Category Filter Controls */}
				<TemplatesSearchAndFilters
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedCategory={selectedCategory}
					onCategoryChange={setSelectedCategory}
					showCategories={activeTab === "explore"}
				/>

				{/* Tab 1: Explore Tab */}
				{activeTab === "explore" && (
					<div className='space-y-6' role='tabpanel' aria-label='Explore templates'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
							{filteredExploreTemplates.map((template: MarketingTemplate) => (
								<ExploreTemplateCard
									key={template.id}
									template={template}
								/>
							))}

							{filteredExploreTemplates.length === 0 && (
								<TemplateEmptyState
									variant='explore'
									hasSearch={Boolean(searchQuery.trim()) || selectedCategory !== "All"}
									onResetSearch={() => {
										setSearchQuery("");
										setSelectedCategory("All");
									}}
								/>
							)}
						</div>
					</div>
				)}

				{/* Tab 2: My Templates Tab */}
				{activeTab === "mine" && (
					<div className='space-y-6' role='tabpanel' aria-label='My templates'>
						{myTemplatesQuery.isLoading ? (
							<TemplateCardSkeleton count={6} />
						) : myTemplatesQuery.isError ? (
							<TemplateErrorState
								onRetry={() => myTemplatesQuery.refetch()}
							/>
						) : (
							<>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
									{myTemplatesList.map((template: PageTemplate) => (
										<AuthenticatedTemplateCard
											key={template.id}
											template={template}
											onPreview={(t) => setPreviewTemplate(t)}
											onUse={(t) => setPreviewTemplate(t)}
										/>
									))}

									{myTemplatesList.length === 0 && (
										<TemplateEmptyState
											variant='mine'
											hasSearch={Boolean(debouncedSearch)}
											onResetSearch={() => setSearchQuery("")}
										/>
									)}
								</div>

								<TemplateLoadMore
									hasNextPage={Boolean(myTemplatesQuery.hasNextPage)}
									isFetchingNextPage={myTemplatesQuery.isFetchingNextPage}
									onLoadMore={() => myTemplatesQuery.fetchNextPage()}
								/>
							</>
						)}
					</div>
				)}

				{/* Tab 3: Workspace Templates Tab */}
				{activeTab === "workspace" && (
					<div className='space-y-6' role='tabpanel' aria-label='Workspace templates'>
						{!isWorkspacesLoading && !currentWorkspaceId ? (
							<TemplateEmptyState variant='no-workspace' />
						) : workspaceTemplatesQuery.isLoading ? (
							<TemplateCardSkeleton count={6} />
						) : workspaceTemplatesQuery.isError ? (
							<TemplateErrorState
								onRetry={() => workspaceTemplatesQuery.refetch()}
							/>
						) : (
							<>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
									{workspaceTemplatesList.map((template: PageTemplate) => (
										<AuthenticatedTemplateCard
											key={template.id}
											template={template}
											onPreview={(t) => setPreviewTemplate(t)}
											onUse={(t) => setPreviewTemplate(t)}
										/>
									))}

									{workspaceTemplatesList.length === 0 && (
										<TemplateEmptyState
											variant='workspace'
											hasSearch={Boolean(debouncedSearch)}
											onResetSearch={() => setSearchQuery("")}
										/>
									)}
								</div>

								<TemplateLoadMore
									hasNextPage={Boolean(workspaceTemplatesQuery.hasNextPage)}
									isFetchingNextPage={workspaceTemplatesQuery.isFetchingNextPage}
									onLoadMore={() => workspaceTemplatesQuery.fetchNextPage()}
								/>
							</>
						)}
					</div>
				)}
			</div>

			{/* Template Preview Dialog */}
			<TemplatePreviewDialog
				template={previewTemplate}
				open={Boolean(previewTemplate)}
				onOpenChange={(open) => !open && setPreviewTemplate(null)}
			/>
		</div>
	);
}
