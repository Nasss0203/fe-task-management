"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useUser } from "@/features/auth";
import { useWorkspaces } from "@/entities/workspace/model/workspace.queries";
import {
	useInfiniteTemplates,
	useMyClaimedTemplates,
	type PageTemplate,
} from "@/entities/template";
import {
	MARKETING_TEMPLATES,
	type MarketingTemplate,
} from "@/widgets/landing/data/marketing-data";
import { toClaimedTemplateCard } from "../model/claimed-template-card.model";
import { ClaimedTemplateCard } from "./claimed-template-card";
import { UseTemplateDialog } from "../detail/ui/use-template-dialog";
import { cn } from "@/shared/lib/utils";
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
	const initialMyTab =
		searchParams?.get("library") === "claimed" ? "claimed" : "created";
	const [myTab, setMyTab] = useState<"created" | "claimed">(initialMyTab);
	useEffect(() => {
		setMyTab(initialMyTab);
	}, [initialMyTab]);
	const [claimedSelection, setClaimedSelection] = useState<{
		id: string;
		userId: string;
		action: "details" | "use";
	} | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(
		null,
	);

	const debouncedSearch = useDebounce(searchQuery, 350);

	// Workspace info
	const { data: workspaces = [], isLoading: isWorkspacesLoading } =
		useWorkspaces();
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
		setClaimedSelection(null);
		if (searchParams) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("tab", newTab);
			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
		}
	};

	const handleMyTabChange = (tab: "created" | "claimed") => {
		setMyTab(tab);
		setClaimedSelection(null);
		setPreviewTemplate(null);
		const params = new URLSearchParams(searchParams?.toString());
		params.set("tab", "mine");
		params.set("library", tab);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
				(template.description &&
					template.description.toLowerCase().includes(query)) ||
				template.tags.some((tag) => tag.toLowerCase().includes(query));

			return matchesCategory && matchesSearch;
		});
	}, [searchQuery, selectedCategory]);

	// 2. My Templates Tab Data: Backend query
	const myTemplatesQuery = useInfiniteTemplates({
		scope: "mine",
		search: debouncedSearch,
		enabled: activeTab === "mine" && myTab === "created",
	});

	const claimedQuery = useMyClaimedTemplates({
		userId: user?.id,
		enabled: activeTab === "mine" && myTab === "claimed",
	});
	const claimedTemplates = useMemo(() => {
		const seen = new Set<string>();
		return (claimedQuery.data?.pages.flatMap((page) => page.items) ?? [])
			.filter((item) => {
				if (seen.has(item.template_id)) return false;
				seen.add(item.template_id);
				return true;
			})
			.map(toClaimedTemplateCard);
	}, [claimedQuery.data]);
	const selectedClaimed =
		activeTab === "mine" && myTab === "claimed" && claimedSelection?.userId === user?.id
			? claimedTemplates.find((item) => item.id === claimedSelection?.id)
			: undefined;

	// 3. Workspace Templates Tab Data: Backend query
	const workspaceTemplatesQuery = useInfiniteTemplates({
		scope: "workspace",
		workspaceId: currentWorkspaceId || undefined,
		search: debouncedSearch,
		enabled: activeTab === "workspace" && Boolean(currentWorkspaceId),
	});

	// Deduplicated items
	const myTemplatesList = useMemo(() => {
		const all =
			myTemplatesQuery.data?.pages.flatMap((page) => page.items) ?? [];
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

				{activeTab === "mine" && (
					<div
						role='tablist'
						aria-label='My templates sections'
						className='inline-flex gap-1 rounded-xl border border-border/50 bg-muted/70 p-1'
					>
						{(["created", "claimed"] as const).map((tab) => (
							<button
								key={tab}
								id={`my-templates-${tab}-tab`}
								type='button'
								role='tab'
								aria-selected={myTab === tab}
								aria-controls={`my-templates-${tab}-panel`}
								tabIndex={myTab === tab ? 0 : -1}
								onClick={() => handleMyTabChange(tab)}
								onKeyDown={(event) => {
									if (
										!["ArrowLeft", "ArrowRight", "Home", "End"].includes(
											event.key,
										)
									)
										return;
									event.preventDefault();
									const next =
										event.key === "Home"
											? "created"
											: event.key === "End"
												? "claimed"
												: tab === "created"
													? "claimed"
													: "created";
									handleMyTabChange(next);
									document.getElementById(`my-templates-${next}-tab`)?.focus();
								}}
								className={cn(
									"rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
									myTab === tab
										? "bg-background text-foreground shadow-xs"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{tab === "created" ? "Created by me" : "Claimed"}
							</button>
						))}
					</div>
				)}
				{/* Search & Category Filter Controls */}
				{!(activeTab === "mine" && myTab === "claimed") && (
					<TemplatesSearchAndFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						selectedCategory={selectedCategory}
						onCategoryChange={setSelectedCategory}
						showCategories={activeTab === "explore"}
					/>
				)}

				{/* Tab 1: Explore Tab */}
				{activeTab === "explore" && (
					<div
						className='space-y-6'
						role='tabpanel'
						aria-label='Explore templates'
					>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
							{filteredExploreTemplates.map((template: MarketingTemplate) => (
								<ExploreTemplateCard key={template.id} template={template} />
							))}

							{filteredExploreTemplates.length === 0 && (
								<TemplateEmptyState
									variant='explore'
									hasSearch={
										Boolean(searchQuery.trim()) || selectedCategory !== "All"
									}
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
				{activeTab === "mine" && myTab === "created" && (
					<div
						id='my-templates-created-panel'
						aria-labelledby='my-templates-created-tab'
						className='space-y-6'
						role='tabpanel'
						aria-label='Created by me'
					>
						{myTemplatesQuery.isLoading ? (
							<TemplateCardSkeleton count={6} />
						) : myTemplatesQuery.isError ? (
							<TemplateErrorState onRetry={() => myTemplatesQuery.refetch()} />
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

				{activeTab === "mine" && myTab === "claimed" && (
					<div
						id='my-templates-claimed-panel'
						role='tabpanel'
						aria-labelledby='my-templates-claimed-tab'
						className='space-y-6'
					>
						{claimedQuery.isLoading || !user ? (
							<TemplateCardSkeleton count={6} />
						) : claimedQuery.isError && !claimedQuery.data ? (
							<TemplateErrorState
								message='Unable to load claimed templates.'
								onRetry={() => claimedQuery.refetch()}
							/>
						) : (
							<>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
									{claimedTemplates.map((template) => (
										<ClaimedTemplateCard
											key={template.id}
											template={template}
											onDetails={() => {
												if (template.canNavigateToPublicDetail) {
													router.push(`/templates/${template.id}`);
												} else {
													setClaimedSelection({
														id: template.id,
														userId: user.id,
														action: "details",
													});
												}
											}}
											onUse={() =>
												setClaimedSelection({
													id: template.id,
													userId: user.id,
													action: "use",
												})
											}
										/>
									))}
									{claimedTemplates.length === 0 && (
										<TemplateEmptyState variant='claimed' />
									)}
								</div>
								{claimedQuery.isError && (
									<TemplateErrorState
										message={
											claimedQuery.isFetchNextPageError
												? "Unable to load more claimed templates."
												: "Unable to refresh claimed templates."
										}
										onRetry={() =>
											claimedQuery.isFetchNextPageError
												? claimedQuery.fetchNextPage()
												: claimedQuery.refetch()
										}
									/>
								)}
								<TemplateLoadMore
									hasNextPage={Boolean(claimedQuery.hasNextPage)}
									isFetchingNextPage={claimedQuery.isFetchingNextPage}
									onLoadMore={() => claimedQuery.fetchNextPage()}
								/>
							</>
						)}
					</div>
				)}
				{/* Tab 3: Workspace Templates Tab */}
				{activeTab === "workspace" && (
					<div
						className='space-y-6'
						role='tabpanel'
						aria-label='Workspace templates'
					>
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
									isFetchingNextPage={
										workspaceTemplatesQuery.isFetchingNextPage
									}
									onLoadMore={() => workspaceTemplatesQuery.fetchNextPage()}
								/>
							</>
						)}
					</div>
				)}
			</div>

			{selectedClaimed?.allowDetails &&
				claimedSelection?.action === "details" && (
					<TemplatePreviewDialog
						template={selectedClaimed}
						open
						onOpenChange={(open) => !open && setClaimedSelection(null)}
						onUse={
							selectedClaimed.allowUseAttempt && selectedClaimed.version && user
								? () =>
										setClaimedSelection({
											id: selectedClaimed.id,
											userId: user.id,
											action: "use",
										})
								: undefined
						}
					/>
				)}
			{selectedClaimed?.allowUseAttempt &&
				selectedClaimed.version &&
				claimedSelection?.action === "use" && (
					<UseTemplateDialog
						template={selectedClaimed}
						version={selectedClaimed.version}
						open
						requireClaim={false}
						onOpenChange={(open) => !open && setClaimedSelection(null)}
					/>
				)}
			{/* Template Preview Dialog */}
			<TemplatePreviewDialog
				template={previewTemplate}
				open={Boolean(previewTemplate)}
				onOpenChange={(open) => !open && setPreviewTemplate(null)}
			/>
		</div>
	);
}
