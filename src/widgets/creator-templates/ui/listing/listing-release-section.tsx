"use client";

import { Check, Rocket, RotateCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
	usePublishTemplateToMarketplace,
	useTemplateCategories,
	type PageTemplate,
	type TemplateListingDto,
	type TemplateVersion,
} from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

import { formatVnd, isLimitedDemoConfig } from "../../model/listing-form";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import { ListingSection } from "./listing-primitives";
import { ListingTagsField } from "./listing-tags-field";

interface ListingReleaseSectionProps {
	template: PageTemplate;
	listing?: TemplateListingDto | null;
	publishedVersions: TemplateVersion[];
	/** Release must use the saved offer, so it is blocked while the form is dirty. */
	hasUnsavedChanges: boolean;
	disabled?: boolean;
}

export function ListingReleaseSection({
	template,
	listing,
	publishedVersions,
	hasUnsavedChanges,
	disabled,
}: ListingReleaseSectionProps) {
	const officialVersion = publishedVersions.find(
		(version) => version.id === listing?.published_version_id,
	);
	const isSellable = (id: string) =>
		listing?.offer_type !== "PAID" ||
		id !== listing.demo_version_id ||
		isLimitedDemoConfig(listing.demo_config);
	const [versionId, setVersionId] = useState(
		(publishedVersions.find((version) => isSellable(version.id)) ??
			publishedVersions[0])?.id ?? "",
	);
	const savedCategoryIds = listing?.category_ids ?? [];
	const [categoryIds, setCategoryIds] = useState<string[]>(savedCategoryIds);
	const savedTags = listing?.tags ?? [];
	const [tags, setTags] = useState<string[]>(savedTags);
	const tagsChanged =
		tags.length !== savedTags.length ||
		tags.some((tag) => !savedTags.includes(tag));
	const [confirmOpen, setConfirmOpen] = useState(false);

	const categoriesQuery = useTemplateCategories();
	const release = usePublishTemplateToMarketplace();

	const offerType = listing?.offer_type ?? "FREE";
	const price = listing?.price_amount ?? 0;
	const selectedVersion = publishedVersions.find((v) => v.id === versionId);
	const categoriesChanged =
		categoryIds.length !== savedCategoryIds.length ||
		categoryIds.some((id) => !savedCategoryIds.includes(id));
	// A release may also be the demo only when that demo is a LIMITED preview.
	const isFullDemoVersion =
		offerType === "PAID" &&
		versionId === listing?.demo_version_id &&
		!isLimitedDemoConfig(listing?.demo_config);

	const blocker = !selectedVersion
		? null
		: hasUnsavedChanges
			? "Save your changes before releasing."
			: isFullDemoVersion
				? `v${selectedVersion.version_number} is set as your separate demo, so it can't be sold. In Preview, switch the demo to "Limited preview" to release it.`
				: null;

	const toggleCategory = (id: string) =>
		setCategoryIds((current) =>
			current.includes(id)
				? current.filter((value) => value !== id)
				: [...current, id],
		);

	const handleRelease = async () => {
		if (!selectedVersion) return;
		try {
			await release.mutateAsync({
				templateId: template.id,
				versionId: selectedVersion.id,
				payload: {
					offer_type: offerType,
					price_amount: price,
					currency: "VND",
					category_ids: categoryIds,
					tags,
				},
			});
			toast.success(`v${selectedVersion.version_number} is live on the marketplace`);
			setConfirmOpen(false);
		} catch (error) {
			toast.error("Release failed", {
				description: getApiErrorMessage(error, "Unable to release this version."),
			});
		}
	};

	const categoryNames = (categoriesQuery.data ?? [])
		.filter((category) => categoryIds.includes(category.id))
		.map((category) => category.name);

	return (
		<ListingSection
			id='listing-release'
			title='Marketplace release'
			description='Choose the version buyers get and where it appears.'
			aside={
				<span className='shrink-0 text-xs text-muted-foreground'>
					{officialVersion
						? `Currently v${officialVersion.version_number}`
						: "Not released yet"}
				</span>
			}
		>
			{publishedVersions.length === 0 ? (
				<p className='rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
					Publish a version first. You can do this from the{" "}
					<Link
						href={`/creator/templates/${template.id}?tab=versions`}
						className='font-medium text-primary hover:underline'
					>
						Versions
					</Link>{" "}
					tab.
				</p>
			) : (
				<>
					<div className='flex flex-col gap-2'>
						<Label htmlFor='listing-release-version'>Version to release</Label>
						<Select value={versionId} onValueChange={setVersionId} disabled={disabled}>
							<SelectTrigger id='listing-release-version' className='w-56'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent position='popper'>
								{publishedVersions.map((version) => (
									<SelectItem key={version.id} value={version.id}>
										v{version.version_number}
										{version.id === officialVersion?.id ? " · current" : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className='text-xs text-muted-foreground'>
							Only published versions can be released.
						</p>
					</div>

					<div className='flex flex-col gap-2'>
						<div className='flex items-center justify-between gap-2'>
							<span
								id='listing-categories-label'
								className='text-sm leading-none font-medium'
							>
								Categories
							</span>
							{categoriesChanged && (
								<span className='text-xs text-amber-600 dark:text-amber-400'>
									Applied when you release
								</span>
							)}
						</div>
						{categoriesQuery.isPending ? (
							<div className='flex gap-2'>
								<Skeleton className='h-8 w-24 rounded-full' />
								<Skeleton className='h-8 w-28 rounded-full' />
								<Skeleton className='h-8 w-20 rounded-full' />
							</div>
						) : categoriesQuery.isError ? (
							<Button
								variant='outline'
								size='sm'
								className='w-fit'
								onClick={() => categoriesQuery.refetch()}
							>
								<RotateCw className='size-3.5' />
								Reload categories
							</Button>
						) : categoriesQuery.data.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								No categories available.
							</p>
						) : (
							<div
								role='group'
								aria-labelledby='listing-categories-label'
								className='flex flex-wrap gap-2'
							>
								{categoriesQuery.data.map((category) => {
									const selected = categoryIds.includes(category.id);
									return (
										<button
											key={category.id}
											type='button'
											aria-pressed={selected}
											disabled={disabled}
											onClick={() => toggleCategory(category.id)}
											className={cn(
												"inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50",
												selected
													? "border-primary bg-primary/10 text-foreground"
													: "text-muted-foreground hover:bg-muted",
											)}
										>
											{selected && <Check className='size-3.5 text-primary' />}
											{category.name}
										</button>
									);
								})}
							</div>
						)}
					</div>

					<ListingTagsField
						tags={tags}
						onChange={setTags}
						disabled={disabled}
						changed={tagsChanged}
					/>

					<div className='flex flex-col gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between'>
						<p className='text-xs text-muted-foreground'>
							{blocker ??
								"Releasing makes the template public and updates what new buyers get."}
						</p>
						<Button
							type='button'
							onClick={() => setConfirmOpen(true)}
							disabled={disabled || !selectedVersion || Boolean(blocker)}
							className='shrink-0'
						>
							<Rocket className='size-4' />
							Release{selectedVersion ? ` v${selectedVersion.version_number}` : ""}
						</Button>
					</div>
				</>
			)}

			<ConfirmActionDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title={`Release v${selectedVersion?.version_number ?? ""} to the marketplace?`}
				description='The template becomes public and the listing goes live with these settings.'
				confirmLabel='Release'
				pending={release.isPending}
				onConfirm={handleRelease}
			>
				<dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border p-4 text-sm'>
					<dt className='text-muted-foreground'>Version</dt>
					<dd className='font-medium'>v{selectedVersion?.version_number}</dd>
					<dt className='text-muted-foreground'>Offer</dt>
					<dd className='font-medium'>
						{offerType === "PAID" ? formatVnd(price) : "Free"}
					</dd>
					<dt className='text-muted-foreground'>Categories</dt>
					<dd className='font-medium'>
						{categoryNames.length > 0 ? categoryNames.join(", ") : "None"}
					</dd>
					<dt className='text-muted-foreground'>Tags</dt>
					<dd className='font-medium'>
						{tags.length > 0 ? tags.map((tag) => `#${tag}`).join(" ") : "None"}
					</dd>
				</dl>
			</ConfirmActionDialog>
		</ListingSection>
	);
}
