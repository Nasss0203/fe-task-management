"use client";

import { useState, type FormEvent } from "react";
import { buildPublicSiteUrl } from "@/entities/page-publication/lib/build-public-site-url";
import { normalizePublicationPath } from "@/entities/page-publication/lib/normalize-publication-path";
import type { useWorkspacePublishedSites } from "@/entities/page-publication/model/page-publication.queries";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface PublishPageToSiteFormProps {
	workspaceId?: string;
	sitesQuery: ReturnType<typeof useWorkspacePublishedSites>;
	isPending: boolean;
	error: string | null;
	onPublish: (siteId: string, path: string) => Promise<void>;
	onChange: () => void;
}

export function PublishPageToSiteForm({ workspaceId, sitesQuery, isPending, error, onPublish, onChange }: PublishPageToSiteFormProps) {
	const [siteId, setSiteId] = useState("");
	const [path, setPath] = useState("");
	const selectedSite = sitesQuery.data?.find((site) => site.id === siteId);
	const normalizedPath = normalizePublicationPath(path);
	const isRootPath = normalizedPath === "/";

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedSite || isRootPath || isPending) return;
		await onPublish(selectedSite.id, normalizedPath);
	};

	if (!workspaceId) {
		return <p className='text-sm text-muted-foreground'>Workspace information is unavailable. Try reopening this page.</p>;
	}
	if (sitesQuery.isPending) {
		return <div role='status' aria-label='Loading published sites' className='space-y-3'><Skeleton className='h-9 w-full' /><Skeleton className='h-9 w-full' /></div>;
	}
	if (sitesQuery.isError) {
		return <div className='space-y-3'><p role='alert' className='text-sm text-destructive'>Unable to load published sites.</p><Button type='button' variant='outline' disabled={sitesQuery.isFetching} onClick={() => void sitesQuery.refetch()}>Try again</Button></div>;
	}
	if (!sitesQuery.data?.length) {
		return <p className='text-sm text-muted-foreground'>No published sites yet. Create a new site first.</p>;
	}

	return (
		<form className='space-y-4' onSubmit={handleSubmit}>
			<div className='space-y-2'>
				<label htmlFor='publication-site' className='text-xs font-medium'>Site</label>
				<Select value={selectedSite?.id ?? ""} disabled={isPending} onValueChange={(value) => { setSiteId(value); onChange(); }}>
					<SelectTrigger id='publication-site' className='w-full'><SelectValue placeholder='Choose a site' /></SelectTrigger>
					<SelectContent>{sitesQuery.data.map((site) => <SelectItem key={site.id} value={site.id}>{site.subdomain}</SelectItem>)}</SelectContent>
				</Select>
			</div>
			<div className='space-y-2'>
				<label htmlFor='publication-path' className='text-xs font-medium'>Path</label>
				<Input id='publication-path' value={path} placeholder='/about' disabled={isPending} aria-invalid={isRootPath} aria-describedby={isRootPath ? 'publication-path-error' : undefined} onChange={(event) => { setPath(event.target.value); onChange(); }} />
				{isRootPath ? <p id='publication-path-error' role='alert' className='text-xs text-destructive'>Root path is reserved for the site&apos;s home page.</p> : null}
			</div>
			{selectedSite ? <p className='break-all text-xs text-muted-foreground'>Preview: {buildPublicSiteUrl({ subdomain: selectedSite.subdomain, path: normalizedPath })}</p> : null}
			{error ? <p role='alert' className='text-xs text-destructive'>{error}</p> : null}
			<div className='flex justify-end'><Button type='submit' disabled={!selectedSite || isRootPath || isPending}>{isPending ? 'Publishing...' : 'Publish'}</Button></div>
		</form>
	);
}
