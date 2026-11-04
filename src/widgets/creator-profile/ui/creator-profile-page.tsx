"use client";

import { ArrowRight, Check, ImageIcon, ImageUp, Trash2 } from "lucide-react";
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
		<div className='flex flex-col gap-6'>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex min-w-0 flex-col gap-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>Profile</h1>
					<p className='text-[13.5px] text-muted-foreground'>
						Your public creator page on the marketplace. Only what you fill in here is shown.
					</p>
				</div>
				{query.data?.has_profile && (
					<Button asChild variant='outline' size='sm'>
						<Link href={`/creators/${query.data.handle}`} target='_blank'>
							<ArrowRight className='size-3.5' />
							View public profile
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
			className='flex flex-col gap-4 rounded-[12px] border bg-card p-5'
		>
			<div className='flex flex-col gap-0.5'>
				<h2 id='creator-images-title' className='text-[15px] font-semibold'>
					Images
				</h2>
				<p className='text-[13px] text-muted-foreground'>
					PNG, JPEG or WebP. Avatar up to 2 MB, cover up to 5 MB.
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]'>
				{/* Avatar Card */}
				<div className='flex flex-col justify-between gap-3 rounded-[10px] border border-border/70 bg-muted/20 p-3.5'>
					<div className='flex h-28 w-full items-center justify-center rounded-[8px] border border-border/50 bg-background/60 sm:h-32'>
						<CreatorAvatar
							src={profile.avatar_url}
							name={profile.display_name || profile.handle}
							className='size-20 shrink-0 rounded-full text-[24px] shadow-xs ring-2 ring-background sm:size-[84px]'
						/>
					</div>
					<div className='flex flex-wrap items-center justify-between gap-2'>
						<div className='flex flex-col'>
							<span className='text-[13px] font-medium text-foreground'>
								Avatar
							</span>
							<span className='text-[11.5px] text-muted-foreground'>
								Square · max 2 MB
							</span>
						</div>
						{profile.has_profile && (
							<ImageControl kind='avatar' profile={profile} userId={userId} />
						)}
					</div>
				</div>

				{/* Cover Image Card */}
				<div className='flex flex-col justify-between gap-3 rounded-[10px] border border-border/70 bg-muted/20 p-3.5'>
					<div className='relative flex h-28 w-full items-center justify-center overflow-hidden rounded-[8px] border border-border/50 bg-gradient-to-r from-[#c9d6f2]/50 to-[#eadff2]/50 text-muted-foreground sm:h-32 dark:from-slate-800/80 dark:to-indigo-950/60'>
						{profile.cover_url ? (
							/* eslint-disable-next-line @next/next/no-img-element */
							<img
								src={profile.cover_url}
								alt=''
								className='h-full w-full object-cover'
							/>
						) : (
							<div className='flex flex-col items-center gap-1.5 text-muted-foreground/70'>
								<ImageIcon className='size-6' />
								<span className='text-xs'>No cover image</span>
							</div>
						)}
					</div>
					<div className='flex flex-wrap items-center justify-between gap-2'>
						<div className='flex flex-col'>
							<span className='text-[13px] font-medium text-foreground'>
								Cover image
							</span>
							<span className='text-[11.5px] text-muted-foreground'>
								Wide banner · max 5 MB
							</span>
						</div>
						{profile.has_profile && (
							<ImageControl kind='cover' profile={profile} userId={userId} />
						)}
					</div>
				</div>
			</div>

			{!profile.has_profile && (
				<p className='text-[13px] text-muted-foreground'>
					Save your profile below first, then you can upload an avatar and a cover image.
				</p>
			)}
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
		<form onSubmit={handleSubmit} className='flex flex-col gap-4 rounded-[12px] border bg-card p-5'>
			<div className='flex flex-col gap-4'>
				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='creator-handle' className='text-[13px] font-medium'>
						Handle
					</Label>
					<div className='flex h-9 items-center overflow-hidden rounded-[8px] border focus-within:ring-2 focus-within:ring-ring/50'>
						<span className='flex h-full shrink-0 items-center border-r bg-muted/60 px-2.5 text-[13px] text-muted-foreground'>
							/creators/
						</span>
						<input
							id='creator-handle'
							value={handle}
							onChange={(event) => setHandle(event.target.value)}
							maxLength={30}
							aria-invalid={!handleIsValid}
							aria-describedby='creator-handle-help'
							className='min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-[13.5px] outline-none'
						/>
					</div>
					<p
						id='creator-handle-help'
						className={cn("text-[12px]", handleIsValid ? "text-muted-foreground" : "text-destructive")}
					>
						3–30 characters: lowercase letters, numbers and hyphens. Changing it changes your public link.
					</p>
				</div>

				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='creator-display-name' className='text-[13px] font-medium'>
						Display name
					</Label>
					<Input
						id='creator-display-name'
						value={displayName}
						onChange={(event) => setDisplayName(event.target.value)}
						maxLength={60}
						placeholder='Shown instead of your username'
						className='rounded-[8px] text-[13.5px]'
					/>
				</div>

				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='creator-headline' className='text-[13px] font-medium'>
						Headline
					</Label>
					<Input
						id='creator-headline'
						value={headline}
						onChange={(event) => setHeadline(event.target.value)}
						maxLength={120}
						placeholder='e.g. Notion-style templates for product teams'
						className='rounded-[8px] text-[13.5px]'
					/>
				</div>

				<div className='flex flex-col gap-1.5'>
					<Label htmlFor='creator-bio' className='text-[13px] font-medium'>
						Bio
					</Label>
					<textarea
						id='creator-bio'
						value={bio}
						onChange={(event) => setBio(event.target.value)}
						maxLength={MAX_BIO_LENGTH}
						rows={4}
						className='w-full resize-y rounded-[8px] border bg-transparent px-3 py-2 text-[13.5px] shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
						placeholder='Tell buyers who you are and what you build.'
					/>
					<p className='text-right text-[11px] tabular-nums text-muted-foreground'>
						{bio.length}/{MAX_BIO_LENGTH}
					</p>
				</div>
			</div>

			<fieldset className='flex flex-col gap-2 pt-1'>
				<legend className='mb-1.5 text-[13px] font-medium'>Links</legend>
				<div className='flex flex-col gap-2'>
					{CREATOR_LINK_KEYS.map((key) => (
						<div
							key={key}
							className='flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5'
						>
							<Label
								htmlFor={`creator-link-${key}`}
								className='w-[90px] shrink-0 text-[13px] font-normal text-muted-foreground'
							>
								{LINK_FIELDS[key].label}
							</Label>
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
								className='flex-1 rounded-[8px] text-[13.5px]'
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

			<div className='flex items-center justify-end gap-2.5 pt-1'>
				{saved && !mutation.isPending && (
					<span
						role='status'
						className='inline-flex items-center gap-1 text-[12.5px] text-emerald-600 dark:text-emerald-400'
					>
						<Check className='size-3.5' />
						Saved
					</span>
				)}
				<Button
					type='submit'
					size='sm'
					disabled={!handleIsValid || mutation.isPending}
				>
					{mutation.isPending ? "Saving…" : profile.has_profile ? "Save changes" : "Create profile"}
				</Button>
			</div>
		</form>
	);
}
