"use client";

import { ExternalLink, ImageUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import {
	CREATOR_LINK_KEYS,
	CreatorAvatar,
	type CreatorImageKind,
	type CreatorLinkKey,
	type MyCreatorProfile,
	useMyCreatorProfile,
	useSetCreatorImage,
	useUpsertMyCreatorProfile,
} from "@/entities/creator";
import { useUser } from "@/features/auth";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
const MAX_BIO_LENGTH = 1000;

const LINK_FIELDS: Record<CreatorLinkKey, { label: string; placeholder: string }> = {
	website: { label: "Website", placeholder: "https://your-site.com" },
	x: { label: "X", placeholder: "https://x.com/you" },
	github: { label: "GitHub", placeholder: "https://github.com/you" },
	linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
	youtube: { label: "YouTube", placeholder: "https://youtube.com/@you" },
	facebook: { label: "Facebook", placeholder: "https://facebook.com/you" },
};

const IMAGE_RULES: Record<CreatorImageKind, { label: string; maxMb: number }> = {
	avatar: { label: "Avatar", maxMb: 2 },
	cover: { label: "Cover image", maxMb: 5 },
};

export function CreatorProfilePage() {
	const { user } = useUser();
	const query = useMyCreatorProfile(user?.id);

	return (
		<div className='flex flex-col gap-8'>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex min-w-0 flex-col gap-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>Profile</h1>
					<p className='text-sm text-muted-foreground'>
						Your public creator page on the marketplace. Only what you fill in here is shown.
					</p>
				</div>
				{query.data?.has_profile && (
					<Button asChild variant='outline' size='sm'>
						<Link href={`/creators/${query.data.handle}`} target='_blank'>
							View public profile
							<ExternalLink className='ml-1.5 size-3.5' />
						</Link>
					</Button>
				)}
			</header>

			{query.isPending ? (
				<div className='flex flex-col gap-3'>
					<Skeleton className='h-40 w-full rounded-xl' />
					<Skeleton className='h-10 w-1/2 rounded-lg' />
				</div>
			) : query.isError || !query.data ? (
				<div
					role='alert'
					className='flex items-center justify-between gap-3 rounded-xl border bg-card p-5 text-sm text-muted-foreground'
				>
					Unable to load your profile.
					<Button variant='outline' size='sm' onClick={() => query.refetch()}>
						Try again
					</Button>
				</div>
			) : (
				<>
					<ImagesSection profile={query.data} userId={user?.id} />
					<ProfileForm
						key={`${query.data.has_profile}-${query.data.handle}`}
						profile={query.data}
						userId={user?.id}
					/>
				</>
			)}
		</div>
	);
}

function ImagesSection({
	profile,
	userId,
}: {
	profile: MyCreatorProfile;
	userId: string | undefined;
}) {
	return (
		<section
			aria-labelledby='creator-images-title'
			className='overflow-hidden rounded-xl border bg-card'
		>
			<div className='relative h-32 bg-gradient-to-br from-primary/25 via-primary/10 to-muted sm:h-40'>
				{profile.cover_url && (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img src={profile.cover_url} alt='' className='h-full w-full object-cover' />
				)}
			</div>
			<div className='flex flex-col gap-5 p-5 sm:flex-row sm:items-start'>
				<CreatorAvatar
					src={profile.avatar_url}
					className='-mt-14 size-24 shrink-0 rounded-2xl border-4 border-card'
				/>
				<div className='flex flex-1 flex-col gap-3'>
					<h2 id='creator-images-title' className='text-sm font-semibold'>
						Images
					</h2>
					{profile.has_profile ? (
						<div className='flex flex-wrap gap-4'>
							<ImageControl kind='avatar' profile={profile} userId={userId} />
							<ImageControl kind='cover' profile={profile} userId={userId} />
						</div>
					) : (
						<p className='text-sm text-muted-foreground'>
							Save your profile below first, then you can upload an avatar and a cover image.
						</p>
					)}
					<p className='text-xs text-muted-foreground'>
						PNG, JPEG or WebP. Avatar up to 2 MB, cover up to 5 MB.
					</p>
				</div>
			</div>
		</section>
	);
}

function ImageControl({
	kind,
	profile,
	userId,
}: {
	kind: CreatorImageKind;
	profile: MyCreatorProfile;
	userId: string | undefined;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const mutation = useSetCreatorImage(userId);
	const [error, setError] = useState<string | null>(null);
	const rule = IMAGE_RULES[kind];
	const hasImage = kind === "avatar" ? Boolean(profile.avatar_url) : Boolean(profile.cover_url);

	function upload(file: File | null) {
		setError(null);
		if (!file) return;
		if (file.size > rule.maxMb * 1024 * 1024) {
			setError(`${rule.label} must be at most ${rule.maxMb} MB.`);
			return;
		}
		mutation.mutate(
			{ kind, file },
			{ onError: (mutationError) => setError(getApiErrorMessage(mutationError, "Upload failed")) },
		);
	}

	return (
		<div className='flex flex-col gap-1.5'>
			<div className='flex items-center gap-2'>
				<input
					ref={inputRef}
					type='file'
					accept='image/png,image/jpeg,image/webp'
					className='sr-only'
					aria-label={`Upload ${rule.label.toLowerCase()}`}
					onChange={(event) => {
						upload(event.target.files?.[0] ?? null);
						event.target.value = "";
					}}
				/>
				<Button
					type='button'
					variant='outline'
					size='sm'
					disabled={mutation.isPending}
					onClick={() => inputRef.current?.click()}
				>
					<ImageUp className='mr-1.5 size-4' />
					{mutation.isPending ? "Uploading…" : `Upload ${rule.label.toLowerCase()}`}
				</Button>
				{hasImage && (
					<Button
						type='button'
						variant='ghost'
						size='sm'
						aria-label={`Remove ${rule.label.toLowerCase()}`}
						disabled={mutation.isPending}
						onClick={() => mutation.mutate({ kind, file: null })}
					>
						<Trash2 className='size-4' />
					</Button>
				)}
			</div>
			{error && (
				<p role='alert' className='text-xs text-destructive'>
					{error}
				</p>
			)}
		</div>
	);
}

function ProfileForm({
	profile,
	userId,
}: {
	profile: MyCreatorProfile;
	userId: string | undefined;
}) {
	const mutation = useUpsertMyCreatorProfile(userId);
	const [handle, setHandle] = useState(profile.handle);
	const [displayName, setDisplayName] = useState(profile.display_name ?? "");
	const [headline, setHeadline] = useState(profile.headline ?? "");
	const [bio, setBio] = useState(profile.bio ?? "");
	const [links, setLinks] = useState<Record<CreatorLinkKey, string>>(
		() =>
			Object.fromEntries(
				CREATOR_LINK_KEYS.map((key) => [key, profile.links[key] ?? ""]),
			) as Record<CreatorLinkKey, string>,
	);
	const [saved, setSaved] = useState(false);

	const normalizedHandle = handle.trim().toLowerCase();
	const handleIsValid = HANDLE_PATTERN.test(normalizedHandle);

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaved(false);
		if (!handleIsValid) return;

		mutation.mutate(
			{
				handle: normalizedHandle,
				display_name: displayName.trim() || null,
				headline: headline.trim() || null,
				bio: bio.trim() || null,
				...(Object.fromEntries(
					CREATOR_LINK_KEYS.map((key) => [key, links[key].trim() || null]),
				) as Record<CreatorLinkKey, string | null>),
			},
			{ onSuccess: () => setSaved(true) },
		);
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-6 rounded-xl border bg-card p-5 sm:p-6'>
			<div className='grid gap-5 sm:grid-cols-2'>
				<div className='flex flex-col gap-1.5 sm:col-span-2'>
					<Label htmlFor='creator-handle'>Handle</Label>
					<div className='flex items-center overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring/50'>
						<span className='shrink-0 border-r bg-muted/50 px-3 py-2 text-sm text-muted-foreground'>
							/creators/
						</span>
						<input
							id='creator-handle'
							value={handle}
							onChange={(event) => setHandle(event.target.value)}
							maxLength={30}
							aria-invalid={!handleIsValid}
							aria-describedby='creator-handle-help'
							className='min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none'
						/>
					</div>
					<p
						id='creator-handle-help'
						className={cn("text-xs", handleIsValid ? "text-muted-foreground" : "text-destructive")}
					>
						3–30 characters: lowercase letters, numbers and hyphens. Changing it changes your public link.
					</p>
				</div>

				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='creator-display-name'>Display name</Label>
					<Input
						id='creator-display-name'
						value={displayName}
						onChange={(event) => setDisplayName(event.target.value)}
						maxLength={60}
						placeholder='Shown instead of your username'
					/>
				</div>

				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='creator-headline'>Headline</Label>
					<Input
						id='creator-headline'
						value={headline}
						onChange={(event) => setHeadline(event.target.value)}
						maxLength={120}
						placeholder='e.g. Notion-style templates for product teams'
					/>
				</div>

				<div className='flex flex-col gap-1.5 sm:col-span-2'>
					<Label htmlFor='creator-bio'>Bio</Label>
					<textarea
						id='creator-bio'
						value={bio}
						onChange={(event) => setBio(event.target.value)}
						maxLength={MAX_BIO_LENGTH}
						rows={5}
						className='w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
						placeholder='Tell buyers who you are and what you build.'
					/>
					<p className='text-right text-[11px] tabular-nums text-muted-foreground'>
						{bio.length}/{MAX_BIO_LENGTH}
					</p>
				</div>
			</div>

			<fieldset className='flex flex-col gap-4'>
				<legend className='mb-1 text-sm font-semibold'>Links</legend>
				<div className='grid gap-4 sm:grid-cols-2'>
					{CREATOR_LINK_KEYS.map((key) => (
						<div key={key} className='flex flex-col gap-1.5'>
							<Label htmlFor={`creator-link-${key}`}>{LINK_FIELDS[key].label}</Label>
							<Input
								id={`creator-link-${key}`}
								type='url'
								inputMode='url'
								value={links[key]}
								onChange={(event) =>
									setLinks((current) => ({ ...current, [key]: event.target.value }))
								}
								maxLength={255}
								placeholder={LINK_FIELDS[key].placeholder}
							/>
						</div>
					))}
				</div>
			</fieldset>

			{mutation.isError && (
				<p role='alert' className='text-sm text-destructive'>
					{getApiErrorMessage(mutation.error, "Unable to save your profile")}
				</p>
			)}

			<div className='flex items-center gap-3'>
				<Button type='submit' disabled={!handleIsValid || mutation.isPending}>
					{mutation.isPending ? "Saving…" : profile.has_profile ? "Save changes" : "Create profile"}
				</Button>
				{saved && !mutation.isPending && (
					<span role='status' className='text-sm text-emerald-600 dark:text-emerald-400'>
						Saved
					</span>
				)}
			</div>
		</form>
	);
}
