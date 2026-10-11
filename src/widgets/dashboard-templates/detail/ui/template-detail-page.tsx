"use client";

import axios from "axios";
import { AlertCircle, ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import {
	useTemplateDetail,
	useTemplatePreview,
	useTemplateVersions,
	type PageTemplate,
	type TemplateVersion,
} from "@/entities/template";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent } from "@/shared/ui/tabs";

import { useCreateTemplateVersion } from "@/entities/template/model/template.mutations";
import { toast } from "sonner";
import { ArchiveTemplateDialog } from "./archive-template-dialog";
import { EditTemplateDialog } from "./edit-template-dialog";
import { PublishTemplateDialog } from "./publish-template-dialog";
import { TemplateAnalyticsShell } from "./template-analytics-shell";
import { TemplateCommentsShell } from "./template-comments-shell";
import {
	TemplateDetailHeader,
	TemplateDetailHeaderSkeleton,
} from "./template-detail-header";
import {
	TemplateDetailTabsList,
	type TemplateDetailTab,
} from "./template-detail-tabs";
import {
	TemplateManagementSidebar,
	TemplateManagementSidebarSkeleton,
} from "./template-management-sidebar";
import { TemplateMarketplaceShell } from "./template-marketplace-shell";
import {
	TemplatePreviewPanel,
	TemplatePreviewSkeleton,
} from "./template-preview-panel";
import { TemplateVersionList } from "./template-version-list";
import { UseTemplateDialog } from "./use-template-dialog";

interface TemplateDetailPageProps {
	templateId: string;
}

function parseTabParam(tabStr: string | null): TemplateDetailTab {
	if (
		tabStr === "versions" ||
		tabStr === "marketplace" ||
		tabStr === "comments" ||
		tabStr === "analytics"
	) {
		return tabStr;
	}
	return "preview";
}

export function TemplateDetailPage({ templateId }: TemplateDetailPageProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Parse URL params with fallback
	const initialTabFromUrl = searchParams.get("tab");
	const initialVersionFromUrl = searchParams.get("version") || undefined;

	const resolvedInitialTab: TemplateDetailTab =
		parseTabParam(initialTabFromUrl);

	const [activeTab, setActiveTab] =
		useState<TemplateDetailTab>(resolvedInitialTab);
	const [selectedVersionId, setSelectedVersionId] = useState<
		string | undefined
	>(initialVersionFromUrl);

	// Sync state with search params changes (e.g. browser back/forward or testing updates)
	React.useEffect(() => {
		const tabFromUrl = searchParams.get("tab");
		setActiveTab(parseTabParam(tabFromUrl));
		const verFromUrl = searchParams.get("version");
		if (verFromUrl) {
			setSelectedVersionId(verFromUrl);
		}
	}, [searchParams]);

	// Dialog states
	const [publishOpen, setPublishOpen] = useState(false);
	const [publishTargetVersion, setPublishTargetVersion] =
		useState<TemplateVersion | null>(null);
	const [useOpen, setUseOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [archiveOpen, setArchiveOpen] = useState(false);

	// Fetch template detail
	const {
		data: templateData,
		isLoading: isLoadingTemplate,
		error: templateError,
		refetch: refetchTemplate,
	} = useTemplateDetail(templateId);

	// Fetch versions
	const { data: versionsData = [], refetch: refetchVersions } =
		useTemplateVersions(templateId);

	// Effective version ID
	const effectiveVersionId =
		selectedVersionId ||
		initialVersionFromUrl ||
		versionsData[0]?.id ||
		undefined;

	// Fetch preview for selected version
	const {
		data: previewData,
		isLoading: isLoadingPreview,
		isFetching: isFetchingPreview,
		error: previewError,
		refetch: refetchPreview,
	} = useTemplatePreview(templateId, effectiveVersionId, {
		enabled: Boolean(templateId && effectiveVersionId),
	});

	const createVersionMutation = useCreateTemplateVersion();

	// Derive unified template and versions objects
	const template: PageTemplate | null =
		templateData || previewData?.template || null;

	const previewVersion = previewData?.version;
	const versions: TemplateVersion[] = React.useMemo(() => {
		if (versionsData.length > 0) return versionsData;
		if (previewVersion) return [previewVersion];
		return [];
	}, [versionsData, previewVersion]);

	const activeVersion: TemplateVersion | null = React.useMemo(() => {
		if (effectiveVersionId) {
			const found = versions.find((v) => v.id === effectiveVersionId);
			if (found) return found;
		}
		return previewVersion || versions[0] || null;
	}, [effectiveVersionId, versions, previewVersion]);

	// Update URL helper without full page reload
	const syncUrl = (newTab: TemplateDetailTab, versionId?: string) => {
		const params = new URLSearchParams();
		if (newTab !== "preview") {
			params.set("tab", newTab);
		}
		const effVersion = versionId || effectiveVersionId;
		if (effVersion) {
			params.set("version", effVersion);
		}
		const query = params.toString();
		const newUrl = query
			? `/dashboard/templates/${templateId}?${query}`
			: `/dashboard/templates/${templateId}`;

		if (typeof window !== "undefined" && window.history?.replaceState) {
			window.history.replaceState(null, "", newUrl);
		}
	};

	// Handle tab switching
	const handleTabChange = (newTab: string) => {
		const targetTab: TemplateDetailTab = parseTabParam(newTab);
		setActiveTab(targetTab);
		syncUrl(targetTab, effectiveVersionId);
	};

	// Handle version selection
	const handleSelectVersion = (
		versionId: string,
		switchToPreview = false,
	) => {
		setSelectedVersionId(versionId);
		const targetTab = switchToPreview ? "preview" : activeTab;
		if (switchToPreview) {
			setActiveTab("preview");
		}
		syncUrl(targetTab, versionId);
	};

	const handleCreateVersion = async () => {
		try {
			const createdVersion = await createVersionMutation.mutateAsync({
				templateId: templateId,
			});

			toast.success("Version created", {
				description: `v${createdVersion.version_number} was created from the latest source page.`,
			});

			handleSelectVersion(createdVersion.id, true);
		} catch (error) {
			if (
				axios.isAxiosError<{ message?: string | string[] }>(error) &&
				error.response?.status === 409
			) {
				toast.error("No changes detected", {
					description:
						"The source page has not changed since the latest version.",
				});

				return;
			}

			let message = "Failed to create a new template version.";

			if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
				const backendMessage = error.response?.data?.message;

				if (typeof backendMessage === "string") {
					message = backendMessage;
				} else if (Array.isArray(backendMessage)) {
					message = backendMessage.join(", ");
				}
			}

			toast.error("Failed to create version", {
				description: message,
			});
		}
	};
	const versionToPublish = publishTargetVersion || activeVersion;

	// Initial loading skeleton
	const isInitialLoading = isLoadingTemplate && !template && !previewData;
	if (isInitialLoading) {
		return (
			<div className='mx-auto w-full max-w-[1480px] px-4 md:px-6 xl:px-8 space-y-6'>
				<TemplateDetailHeaderSkeleton />
				<div className='flex gap-2 border-b border-border/60 pb-px'>
					<Skeleton className='h-8 w-24 rounded-lg' />
					<Skeleton className='h-8 w-28 rounded-lg' />
					<Skeleton className='h-8 w-28 rounded-lg' />
					<Skeleton className='h-8 w-28 rounded-lg' />
					<Skeleton className='h-8 w-28 rounded-lg' />
				</div>
				<div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start'>
					<TemplatePreviewSkeleton />
					<TemplateManagementSidebarSkeleton />
				</div>
			</div>
		);
	}

	// Error handling
	const error = templateError || previewError;
	if (error && !template) {
		let is404 = false;
		let is403 = false;
		const errorMessage = "Unable to load template details.";

		const status =
			(axios.isAxiosError(error) ? error.response?.status : undefined) ||
			(error as unknown as { response?: { status?: number } })?.response
				?.status ||
			(error as unknown as { status?: number })?.status;

		if (status === 404) is404 = true;
		if (status === 403) is403 = true;

		if (is404) {
			return (
				<div className='max-w-2xl mx-auto py-20 px-4 text-center space-y-4'>
					<div className='flex size-12 items-center justify-center rounded-full bg-muted/30 mx-auto text-muted-foreground'>
						<AlertCircle className='size-6' />
					</div>
					<h2 className='text-xl font-bold text-foreground'>
						Template not found
					</h2>
					<p className='text-xs text-muted-foreground max-w-md mx-auto'>
						The template you are looking for does not exist or may
						have been deleted.
					</p>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.push("/dashboard/templates")}
						className='gap-1.5 text-xs'
					>
						<ArrowLeft className='size-3.5' />
						Back to templates
					</Button>
				</div>
			);
		}

		if (is403) {
			return (
				<div className='max-w-2xl mx-auto py-20 px-4 text-center space-y-4'>
					<div className='flex size-12 items-center justify-center rounded-full bg-destructive/10 mx-auto text-destructive'>
						<ShieldAlert className='size-6' />
					</div>
					<h2 className='text-xl font-bold text-foreground'>
						Access restricted
					</h2>
					<p className='text-xs text-muted-foreground max-w-md mx-auto'>
						You don&apos;t have permission to view this template.
					</p>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.push("/dashboard/templates")}
						className='gap-1.5 text-xs'
					>
						<ArrowLeft className='size-3.5' />
						Back to templates
					</Button>
				</div>
			);
		}

		return (
			<div className='max-w-2xl mx-auto py-20 px-4 text-center space-y-4'>
				<div className='flex size-12 items-center justify-center rounded-full bg-muted/30 mx-auto text-muted-foreground'>
					<AlertCircle className='size-6' />
				</div>
				<h2 className='text-xl font-bold text-foreground'>
					Unable to load template
				</h2>
				<p className='text-xs text-muted-foreground max-w-md mx-auto'>
					{errorMessage}
				</p>
				<div className='flex items-center justify-center gap-2 pt-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => router.push("/dashboard/templates")}
						className='gap-1.5 text-xs'
					>
						<ArrowLeft className='size-3.5' />
						Back to templates
					</Button>
					<Button
						size='sm'
						onClick={() => {
							refetchTemplate();
							refetchVersions();
							refetchPreview();
						}}
						className='gap-1.5 text-xs'
					>
						<RefreshCw className='size-3.5' />
						Try again
					</Button>
				</div>
			</div>
		);
	}

	if (!template) {
		return null;
	}

	return (
		<div className='mx-auto w-full max-w-[1480px] px-4 md:px-6 xl:px-8 space-y-6'>
			{/* Page Header (Full Width alignment with Tabs and Content) */}
			<TemplateDetailHeader
				template={template}
				selectedVersion={activeVersion}
			/>

			{/* Detail Tabs Structure */}
			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className='space-y-8'
			>
				<TemplateDetailTabsList
					activeTab={activeTab}
					versionsCount={versions.length}
				/>

				{/* TAB 1: PREVIEW (REAL DATA) */}
				<TabsContent
					value='preview'
					className='mt-0 focus-visible:outline-none'
				>
					<div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start'>
						{/* Left: Template Preview Panel */}
						<div className='min-w-0'>
							<TemplatePreviewPanel
								template={template}
								version={activeVersion}
								blocks={previewData?.blocks || []}
								databases={previewData?.databases || []}
								isLoading={
									(isLoadingPreview || isFetchingPreview) &&
									!previewData
								}
							/>
						</div>

						{/* Right: Consolidated Management Sidebar */}
						<div className='min-w-0'>
							<TemplateManagementSidebar
								template={template}
								versions={versions}
								selectedVersionId={activeVersion?.id}
								onSelectVersion={(vId) =>
									handleSelectVersion(vId, false)
								}
								onOpenPublish={() => {
									setPublishTargetVersion(activeVersion);
									setPublishOpen(true);
								}}
								onOpenUse={() => setUseOpen(true)}
								onOpenEdit={() => setEditOpen(true)}
								onOpenArchive={() => setArchiveOpen(true)}
								onViewAllVersions={() =>
									handleTabChange("versions")
								}
							/>
						</div>
					</div>
				</TabsContent>

				{/* TAB 2: VERSIONS (REAL DATA - FULL WIDTH) */}
				<TabsContent
					value='versions'
					className='mt-0 focus-visible:outline-none'
				>
					<TemplateVersionList
						template={template}
						versions={versions}
						selectedVersionId={activeVersion?.id}
						onPreviewVersion={(vId) =>
							handleSelectVersion(vId, true)
						}
						onPublishVersion={(ver) => {
							setPublishTargetVersion(ver);
							setPublishOpen(true);
						}}
						onCreateVersion={handleCreateVersion}
						isCreatingVersion={createVersionMutation.isPending}
					/>
				</TabsContent>

				{/* TAB 3: MARKETPLACE */}
				<TabsContent
					value='marketplace'
					className='mt-0 focus-visible:outline-none'
				>
					<TemplateMarketplaceShell
						template={template}
						versions={versions}
						selectedVersionId={activeVersion?.id}
						onSwitchTab={handleTabChange}
						onOpenEdit={() => setEditOpen(true)}
					/>
				</TabsContent>

				{/* TAB 4: COMMENTS (UI SHELL ONLY - NO API) */}
				<TabsContent
					value='comments'
					className='mt-0 focus-visible:outline-none'
				>
					<TemplateCommentsShell template={template} />
				</TabsContent>

				{/* TAB 5: ANALYTICS (UI SHELL ONLY - NO API) */}
				<TabsContent
					value='analytics'
					className='mt-0 focus-visible:outline-none'
				>
					<TemplateAnalyticsShell template={template} />
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			{versionToPublish && (
				<PublishTemplateDialog
					template={template}
					version={versionToPublish}
					open={publishOpen}
					onOpenChange={setPublishOpen}
					onPublished={() => {
						refetchTemplate();
						refetchVersions();
						refetchPreview();
					}}
				/>
			)}

			{activeVersion && (
				<UseTemplateDialog
					template={template}
					version={activeVersion}
					open={useOpen}
					onOpenChange={setUseOpen}
				/>
			)}

			<EditTemplateDialog
				template={template}
				open={editOpen}
				onOpenChange={setEditOpen}
				onUpdated={() => {
					refetchTemplate();
					refetchPreview();
				}}
			/>

			<ArchiveTemplateDialog
				template={template}
				open={archiveOpen}
				onOpenChange={setArchiveOpen}
				onArchived={() => {
					refetchTemplate();
					refetchVersions();
				}}
			/>
		</div>
	);
}
