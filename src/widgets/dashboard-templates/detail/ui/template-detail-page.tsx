"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";
import axios from "axios";

import {
	useTemplateDetail,
	useTemplatePreview,
	useTemplateVersions,
	type PageTemplate,
	type TemplateVersion,
} from "@/entities/template";
import { Button } from "@/shared/ui/button";

import { TemplatePreviewPanel, TemplatePreviewSkeleton } from "./template-preview-panel";
import {
	TemplateManagementSidebar,
	TemplateManagementSidebarSkeleton,
} from "./template-management-sidebar";
import { PublishTemplateDialog } from "./publish-template-dialog";
import { UseTemplateDialog } from "./use-template-dialog";
import { EditTemplateDialog } from "./edit-template-dialog";
import { ArchiveTemplateDialog } from "./archive-template-dialog";

interface TemplateDetailPageProps {
	templateId: string;
}

export function TemplateDetailPage({ templateId }: TemplateDetailPageProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialVersionFromUrl = searchParams.get("version") || undefined;

	const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(
		initialVersionFromUrl,
	);

	// Dialog states
	const [publishOpen, setPublishOpen] = useState(false);
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
	const {
		data: versionsData = [],
		refetch: refetchVersions,
	} = useTemplateVersions(templateId);

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

	// Handle version selection
	const handleSelectVersion = (versionId: string) => {
		setSelectedVersionId(versionId);
		// Update URL optionally without full navigation
		const newUrl = `/dashboard/templates/${templateId}?version=${versionId}`;
		window.history.replaceState(null, "", newUrl);
	};

	// Skeletons during initial load
	const isInitialLoading =
		isLoadingTemplate && !template && !previewData;

	if (isInitialLoading) {
		return (
			<div className='max-w-7xl mx-auto p-4 md:p-6'>
				<div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start'>
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
			(error as unknown as { response?: { status?: number } })?.response?.status ||
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
						The template you are looking for does not exist or may have been deleted.
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
		<div className='max-w-7xl mx-auto p-4 md:p-6 space-y-6'>
			{/* Main Two-Column Layout */}
			<div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start'>
				{/* Left Preview Panel (~70-75%) */}
				<div className='min-w-0'>
					<TemplatePreviewPanel
						template={template}
						version={activeVersion}
						blocks={previewData?.blocks || []}
						isLoading={(isLoadingPreview || isFetchingPreview) && !previewData}
					/>
				</div>

				{/* Right Management Sidebar (~25-30%) */}
				<div className='min-w-0'>
					<TemplateManagementSidebar
						template={template}
						versions={versions}
						selectedVersionId={activeVersion?.id}
						onSelectVersion={handleSelectVersion}
						onOpenPublish={() => setPublishOpen(true)}
						onOpenUse={() => setUseOpen(true)}
						onOpenEdit={() => setEditOpen(true)}
						onOpenArchive={() => setArchiveOpen(true)}
					/>
				</div>
			</div>

			{/* Dialogs */}
			{activeVersion && (
				<PublishTemplateDialog
					template={template}
					version={activeVersion}
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
