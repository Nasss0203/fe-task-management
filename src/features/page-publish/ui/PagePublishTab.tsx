"use client";

import { isAxiosError } from "axios";
import { ExternalLink, Link2 } from "lucide-react";
import { useState } from "react";
import { buildPublicSiteUrl } from "@/entities/page-publication/lib/build-public-site-url";
import { getCurrentPagePublication } from "@/entities/page-publication/lib/get-current-page-publication";
import {
	usePublishPage,
	useRepublishPage,
	useUnpublishPage,
	useUpdatePublicationSettings,
	useUpdatePageVisibility,
} from "@/entities/page-publication/model/page-publication.mutations";
import { usePagePublication, usePagePublications } from "@/entities/page-publication/model/page-publication.queries";
import { usePage } from "@/entities/page/model/page.queries";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

function getErrorMessage(error: unknown, fallback: string): string {
	if (
		isAxiosError<{ message?: unknown }>(error) &&
		typeof error.response?.data?.message === "string"
	) {
		return error.response.data.message;
	}
	return getFriendlyApiErrorMessage(error, fallback);
}

export function PagePublishTab({ pageId }: { pageId: string }) {
	const pageQuery = usePage(pageId);
	const publicationsQuery = usePagePublications(pageId);
	const statusQuery = usePagePublication(pageQuery.data?.parent_page_id ? pageId : undefined);

	const publishPage = usePublishPage(pageId);
	const unpublishPage = useUnpublishPage(pageId);
	const republishPage = useRepublishPage(pageId);
	const updateSettings = useUpdatePublicationSettings(pageId);
	const updateVisibility = useUpdatePageVisibility(pageId);

	const [copied, setCopied] = useState(false);
	const [confirmUnpublish, setConfirmUnpublish] = useState(false);
	const [draftIncludeDescendants, setDraftIncludeDescendants] = useState<boolean | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const page = pageQuery.data;
	const isRootPage = page ? page.parent_page_id === null : false;
	const publications = publicationsQuery.data ?? [];

	const currentPublication = getCurrentPagePublication({
		isRootPage,
		publicSubdomain: page?.public_subdomain,
		publications,
	});

	const isPublished = Boolean(
		currentPublication
			? currentPublication.published
			: (!isRootPage && statusQuery.data?.published),
	);

	const includeDescendants = isPublished && currentPublication
		? currentPublication.include_descendants
		: (draftIncludeDescendants ?? currentPublication?.include_descendants ?? true);

	const busy =
		publishPage.isPending ||
		unpublishPage.isPending ||
		republishPage.isPending ||
		updateSettings.isPending ||
		updateVisibility.isPending;

	if (pageQuery.isPending || publicationsQuery.isPending || (!isRootPage && statusQuery.isPending)) {
		return (
			<div
				className='space-y-3 px-4 py-4'
				role='status'
				aria-label='Loading publication details'
			>
				<Skeleton className='h-4 w-24' />
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-6 w-full' />
			</div>
		);
	}

	if (pageQuery.isError || publicationsQuery.isError || (!isRootPage && statusQuery.isError)) {
		return (
			<div className='space-y-3 px-4 py-4'>
				<p role='alert' className='text-xs text-destructive'>
					Unable to load publication details.
				</p>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => {
						void pageQuery.refetch();
						void publicationsQuery.refetch();
						void statusQuery.refetch();
					}}
				>
					Retry
				</Button>
			</div>
		);
	}

	// Resolve target url
	const effectiveSubdomain =
		currentPublication?.subdomain || statusQuery.data?.subdomain || page?.public_subdomain || "";
	const effectivePath = currentPublication?.path || statusQuery.data?.path || "/";
	const publicUrl = effectiveSubdomain
		? buildPublicSiteUrl({
				subdomain: effectiveSubdomain,
				path: effectivePath,
			})
		: "";
	const domainUrl = effectiveSubdomain
		? buildPublicSiteUrl({ subdomain: effectiveSubdomain, path: "/" })
		: "";

	const displayUrl = domainUrl.replace(/^https?:\/\//, "");

	const handleCopy = async () => {
		if (!domainUrl) return;
		try {
			await navigator.clipboard.writeText(domainUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard API failed fallback
		}
	};

	const handleViewSite = () => {
		if (publicUrl) {
			window.open(publicUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleToggleSubpages = async (checked: boolean) => {
		setFormError(null);
		if (isPublished && currentPublication) {
			try {
				await updateSettings.mutateAsync({
					siteId: currentPublication.site_id,
					include_descendants: checked,
				});
			} catch (error) {
				setFormError(
					getErrorMessage(error, "Unable to update subpage publication settings."),
				);
			}
		} else {
			setDraftIncludeDescendants(checked);
		}
	};

	const handleToggleChild = async (checked: boolean) => {
		setFormError(null);
		try {
			await updateVisibility.mutateAsync(checked);
		} catch (error) {
			setFormError(getErrorMessage(error, "Unable to update page visibility."));
		}
	};

	const handlePublishRoot = async () => {
		setFormError(null);
		try {
			if (currentPublication && !currentPublication.published) {
				await republishPage.mutateAsync(currentPublication.site_id);
				if (includeDescendants !== currentPublication.include_descendants) {
					await updateSettings.mutateAsync({
						siteId: currentPublication.site_id,
						include_descendants: includeDescendants,
					});
				}
			} else {
				await publishPage.mutateAsync({
					include_descendants: includeDescendants,
				});
			}
		} catch (error) {
			setFormError(getErrorMessage(error, "Unable to publish this page."));
		}
	};

	const handleUnpublish = async () => {
		if (!currentPublication) return;
		setFormError(null);
		try {
			await unpublishPage.mutateAsync(currentPublication.site_id);
			setConfirmUnpublish(false);
		} catch (error) {
			setFormError(getErrorMessage(error, "Unable to unpublish this page."));
		}
	};

	return (
		<div className='space-y-4 px-4 py-4 text-sm'>
			<h3 className='text-sm font-semibold text-[#f1f1f1]'>Publish</h3>

			{/* URL row */}
			<div className='space-y-1.5'>
				{!isPublished && isRootPage ? (
					<span className='text-xs font-medium text-[#bbb]'>Site address</span>
				) : null}
				<div className='flex min-w-0 items-center justify-between gap-2 rounded-md border border-[#414141] bg-[#202020] px-3 py-2 text-sm'>
					<span
						className='truncate text-[#e5e5e5]'
						data-testid='public-url'
						title={domainUrl}
					>
						{displayUrl || "Not configured"}
					</span>
					{domainUrl ? (
						<button
							type='button'
							className='shrink-0 rounded p-1 text-[#aaa] transition-colors hover:bg-white/10 hover:text-white'
							aria-label='Copy link'
							onClick={() => void handleCopy()}
						>
							{copied ? (
								<span className='text-xs font-medium text-[#4b9eff]'>Copied</span>
							) : (
								<Link2 className='size-4' />
							)}
						</button>
					) : null}
				</div>
			</div>

			{/* Status / Settings */}
			{isRootPage ? (
				<div className='space-y-1'>
					<label className='flex cursor-pointer items-center justify-between gap-3 text-sm text-[#e5e5e5]'>
						<span>Publish subpages</span>
						<input
							type='checkbox'
							role='checkbox'
							aria-label='Publish subpages'
							className='size-4 accent-[#2e8de6]'
							checked={includeDescendants}
							disabled={busy}
							onChange={(e) => void handleToggleSubpages(e.target.checked)}
						/>
					</label>
					<p className='text-xs text-[#888]'>
						Default for subpages. You can change individual pages separately.
					</p>
				</div>
			) : (
				<p className='text-xs text-[#999]'>
					{isPublished
						? "This page is published on the site."
						: "This page is not currently public."}
				</p>
			)}

			{formError ? (
				<p role='alert' className='text-xs text-destructive'>
					{formError}
				</p>
			) : null}

			{/* Divider */}
			<div className='border-t border-[#383838]' />

			{/* Actions */}
			{!isPublished ? (
				<div className='flex justify-end'>
					<Button
						type='button'
						className='w-full bg-[#2e8de6] text-white hover:bg-[#2078ce]'
						disabled={
							busy ||
							(isRootPage
								? !page?.public_subdomain
								: !statusQuery.data?.site_active || !effectiveSubdomain)
						}
						onClick={() => void (isRootPage ? handlePublishRoot() : handleToggleChild(true))}
					>
						{busy ? "Publishing..." : "Publish"}
					</Button>
				</div>
			) : (
				<div className='flex items-center justify-between gap-2'>
					<Button
						type='button'
						variant='outline'
						className='border-[#414141] bg-transparent text-[#eee] hover:bg-white/5'
						disabled={busy}
						onClick={() => {
							if (isRootPage) {
								setConfirmUnpublish(true);
							} else {
								void handleToggleChild(false);
							}
						}}
					>
						Unpublish
					</Button>
					<Button
						type='button'
						className='bg-[#2e8de6] text-white hover:bg-[#2078ce]'
						onClick={handleViewSite}
					>
						<ExternalLink className='mr-1.5 size-4' />
						View site
					</Button>
				</div>
			)}

			{/* Unpublish Confirmation Alert */}
			<AlertDialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Unpublish this page?</AlertDialogTitle>
						<AlertDialogDescription>
							People with this public link will no longer be able to access the page.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant='destructive'
							disabled={busy}
							onClick={(event) => {
								event.preventDefault();
								void handleUnpublish();
							}}
						>
							Unpublish
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
