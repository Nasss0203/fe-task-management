"use client";

import { isAxiosError } from "axios";
import { Check, ExternalLink, Globe2, Link2, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
	usePublishPage,
	useRepublishPage,
	useUnpublishPage,
} from "@/entities/page-publication/model/page-publication.mutations";
import { usePagePublication } from "@/entities/page-publication/model/page-publication.queries";
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
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

interface PagePublishTabProps {
	pageId: string;
}

type PublicationErrorResponse = {
	message?: unknown;
};

function getPublicationErrorMessage(error: unknown, fallback: string) {
	if (isAxiosError<PublicationErrorResponse>(error)) {
		const message = error.response?.data?.message;

		if (typeof message === "string" && message.trim()) {
			return message;
		}
	}

	return getFriendlyApiErrorMessage(error, fallback);
}

function buildPublicPath(subdomain: string, path?: string) {
	const publicPath = path && path !== "/" ? `/${path.replace(/^\/+/, "")}` : "";

	return `/public/${encodeURIComponent(subdomain)}${publicPath}`;
}

function getConfiguredAppDomain() {
	const value = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim().toLowerCase();

	if (!value) return null;

	const domain = value.replace(/:\d+$/, "").replace(/\.$/, "");

	if (!domain || domain.includes("/") || domain.includes(":")) {
		return null;
	}

	return domain;
}

function isLocalHostname(hostname: string) {
	return (
		hostname === "localhost" ||
		hostname.endsWith(".localhost") ||
		hostname === "127.0.0.1" ||
		hostname === "[::1]"
	);
}

function buildAbsolutePublicUrl(subdomain: string, path?: string) {
	const currentUrl = new URL(window.location.origin);
	const appDomain = getConfiguredAppDomain();

	if (!appDomain || isLocalHostname(currentUrl.hostname)) {
		return new URL(buildPublicPath(subdomain, path), currentUrl).toString();
	}

	currentUrl.hostname = `${subdomain}.${appDomain}`;
	currentUrl.pathname =
		path && path !== "/" ? `/${path.replace(/^\/+/, "")}` : "/";

	return currentUrl.toString();
}

function PublicationLoadingState() {
	return (
		<div className='space-y-4 px-4 py-5' role='status' aria-label='Loading publication status'>
			<div className='space-y-2'>
				<Skeleton className='h-4 w-36' />
				<Skeleton className='h-3 w-64 max-w-full' />
			</div>
			<Skeleton className='h-9 w-full' />
			<div className='flex justify-end'>
				<Skeleton className='h-9 w-24' />
			</div>
		</div>
	);
}

export function PagePublishTab({ pageId }: PagePublishTabProps) {
	const publicationQuery = usePagePublication(pageId);
	const publishPage = usePublishPage(pageId);
	const unpublishPage = useUnpublishPage(pageId);
	const republishPage = useRepublishPage(pageId);

	const [subdomain, setSubdomain] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [copyError, setCopyError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [unpublishOpen, setUnpublishOpen] = useState(false);

	if (publicationQuery.isPending) {
		return <PublicationLoadingState />;
	}

	if (publicationQuery.isError || !publicationQuery.data) {
		return (
			<div className='space-y-3 px-4 py-5'>
				<div className='space-y-1'>
					<p className='text-sm font-medium'>Unable to load publication status</p>
					<p className='text-xs text-muted-foreground'>
						Check your connection and try again.
					</p>
				</div>
				<Button
					type='button'
					variant='outline'
					size='sm'
					disabled={publicationQuery.isFetching}
					onClick={() => void publicationQuery.refetch()}
				>
					{publicationQuery.isFetching ? "Retrying..." : "Try again"}
				</Button>
			</div>
		);
	}

	const publication = publicationQuery.data;
	const hasExistingSite = Boolean(publication.site_id && publication.subdomain);
	const publicPath = publication.subdomain
		? buildPublicPath(publication.subdomain, publication.path)
		: null;

	const handleCopyLink = async () => {
		if (!publication.subdomain || !publicPath) return;

		setCopied(false);
		setCopyError(null);

		try {
			await navigator.clipboard.writeText(
				buildAbsolutePublicUrl(publication.subdomain, publication.path),
			);
			setCopied(true);

			window.setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch {
			setCopyError("Unable to copy the public link.");
		}
	};

	const handleViewSite = () => {
		if (!publication.subdomain || !publicPath) return;

		window.open(
			buildAbsolutePublicUrl(publication.subdomain, publication.path),
			"_blank",
			"noopener,noreferrer",
		);
	};

	const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (publishPage.isPending) return;

		const normalizedSubdomain = subdomain.trim().toLowerCase();

		if (!normalizedSubdomain) {
			setFormError("Site address is required.");
			return;
		}

		if (/\s/.test(normalizedSubdomain)) {
			setFormError("Site address cannot contain whitespace.");
			return;
		}

		if (normalizedSubdomain.length > 63) {
			setFormError("Site address must be 63 characters or fewer.");
			return;
		}

		setFormError(null);

		try {
			await publishPage.mutateAsync({ subdomain: normalizedSubdomain });
		} catch (error) {
			const message = getPublicationErrorMessage(
				error,
				"Unable to publish this page.",
			);

			setFormError(message);
		}
	};

	const handleUnpublish = async () => {
		if (unpublishPage.isPending) return;

		setActionError(null);

		try {
			await unpublishPage.mutateAsync();
			setUnpublishOpen(false);
		} catch (error) {
			const message = getPublicationErrorMessage(
				error,
				"Unable to unpublish this site.",
			);

			setActionError(message);
		}
	};

	const handleRepublish = async () => {
		if (republishPage.isPending) return;

		setActionError(null);

		try {
			await republishPage.mutateAsync();
		} catch (error) {
			const message = getPublicationErrorMessage(
				error,
				"Unable to republish this site.",
			);

			setActionError(message);
		}
	};

	if (publication.published) {
		if (!publication.subdomain || !publicPath) {
			return (
				<p role='alert' className='px-4 py-5 text-sm text-destructive'>
					Published site information is incomplete.
				</p>
			);
		}

		return (
			<>
				<div className='space-y-4 px-4 py-5'>
					<div className='flex items-start gap-3 rounded-lg border border-border p-3'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
							<Globe2 className='size-4' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-sm font-medium'>
								{publication.subdomain}
							</p>
							<p className='truncate text-xs text-muted-foreground'>
								{publicPath}
							</p>
						</div>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => void handleCopyLink()}
						>
							{copied ? <Check /> : <Link2 />}
							{copied ? "Copied" : "Copy link"}
						</Button>
					</div>

					{copyError ? (
						<p role='alert' className='text-xs text-destructive'>
							{copyError}
						</p>
					) : null}

					<div className='flex flex-wrap justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								setActionError(null);
								setUnpublishOpen(true);
							}}
						>
							Unpublish
						</Button>
						<Button type='button' onClick={handleViewSite}>
							<ExternalLink />
							View site
						</Button>
					</div>
				</div>

				<AlertDialog
					open={unpublishOpen}
					onOpenChange={(open) => {
						if (!unpublishPage.isPending) {
							setUnpublishOpen(open);
						}
					}}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Unpublish this site?</AlertDialogTitle>
							<AlertDialogDescription>
								People with the public link will no longer be able to
								access this page.
							</AlertDialogDescription>
							{actionError ? (
								<p role='alert' className='text-sm text-destructive'>
									{actionError}
								</p>
							) : null}
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={unpublishPage.isPending}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								variant='destructive'
								disabled={unpublishPage.isPending}
								onClick={(event) => {
									event.preventDefault();
									void handleUnpublish();
								}}
							>
								{unpublishPage.isPending ? "Unpublishing..." : "Unpublish"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	}

	if (hasExistingSite && publication.subdomain && publicPath) {
		return (
			<div className='space-y-4 px-4 py-5'>
				<div className='space-y-1'>
					<p className='text-sm font-medium'>Site is currently unpublished</p>
					<p className='text-xs text-muted-foreground'>
						Republish the existing site to make it available again.
					</p>
				</div>

				<div className='flex items-center gap-3 rounded-lg border border-border p-3'>
					<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'>
						<Globe2 className='size-4' />
					</div>
					<div className='min-w-0 flex-1'>
						<p className='truncate text-sm font-medium'>
							{publication.subdomain}
						</p>
						<p className='truncate text-xs text-muted-foreground'>
							{publicPath}
						</p>
					</div>
				</div>

				{actionError ? (
					<p role='alert' className='text-xs text-destructive'>
						{actionError}
					</p>
				) : null}

				<div className='flex flex-wrap justify-end gap-2'>
					<Button
						type='button'
						variant='outline'
						onClick={() => void handleCopyLink()}
					>
						{copied ? <Check /> : <Link2 />}
						{copied ? "Copied" : "Copy previous link"}
					</Button>
					<Button
						type='button'
						disabled={republishPage.isPending}
						onClick={() => void handleRepublish()}
					>
						<RotateCcw />
						{republishPage.isPending ? "Republishing..." : "Republish"}
					</Button>
				</div>

				{copyError ? (
					<p role='alert' className='text-xs text-destructive'>
						{copyError}
					</p>
				) : null}
			</div>
		);
	}

	const previewPath = buildPublicPath(subdomain.trim().toLowerCase() || "your-site");

	return (
		<form className='space-y-4 px-4 py-5' onSubmit={handlePublish}>
			<div className='space-y-1'>
				<h2 className='text-sm font-medium'>Publish this page to the web</h2>
				<p className='text-xs text-muted-foreground'>
					Choose the site address for this public page.
				</p>
			</div>

			<div className='space-y-2'>
				<label htmlFor='page-publication-subdomain' className='text-xs font-medium'>
					Site address
				</label>
				<Input
					id='page-publication-subdomain'
					value={subdomain}
					maxLength={63}
					aria-invalid={Boolean(formError)}
					aria-describedby={formError ? "page-publication-error" : undefined}
					placeholder='abcd'
					autoCapitalize='none'
					autoCorrect='off'
					disabled={publishPage.isPending}
					onChange={(event) => {
						setSubdomain(event.target.value.toLowerCase());
						setFormError(null);
					}}
				/>
				<p className='text-xs text-muted-foreground'>
					Preview: {previewPath}
				</p>
				{formError ? (
					<p id='page-publication-error' role='alert' className='text-xs text-destructive'>
						{formError}
					</p>
				) : null}
			</div>

			<div className='flex justify-end'>
				<Button type='submit' disabled={publishPage.isPending}>
					{publishPage.isPending ? "Publishing..." : "Publish"}
				</Button>
			</div>
		</form>
	);
}
