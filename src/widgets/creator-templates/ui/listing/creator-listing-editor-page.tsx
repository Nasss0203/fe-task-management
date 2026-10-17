"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AlertCircle, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	useCreateTemplateListing,
	usePublishTemplateListing,
	useTemplateDetail,
	useTemplateListing,
	useTemplateVersions,
	useUnpublishTemplateListing,
	useUpdateTemplate,
	useUpdateTemplateListing,
	type PageTemplate,
	type TemplateListingDto,
	type TemplateVersion,
} from "@/entities/template";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import {
	LISTING_FIELDS,
	listingFormSchema,
	TEMPLATE_FIELDS,
	toListingFormValues,
	toListingPayload,
	type ListingFormValues,
} from "../../model/listing-form";
import {
	getListingState,
	LISTING_STATE_PRESENTATION,
} from "../../model/listing-state";
import { ConfirmActionDialog } from "./confirm-action-dialog";
import { ListingCardPreview } from "./listing-card-preview";
import { FieldMessage, ListingSection } from "./listing-primitives";
import { ListingPreviewSection } from "./listing-preview-section";
import { ListingPricingSection } from "./listing-pricing-section";
import { ListingReleaseSection } from "./listing-release-section";

export function CreatorListingEditorPage({ templateId }: { templateId: string }) {
	const templateQuery = useTemplateDetail(templateId);
	const versionsQuery = useTemplateVersions(templateId);
	const listingQuery = useTemplateListing(templateId);
	const notListed =
		axios.isAxiosError(listingQuery.error) &&
		listingQuery.error.response?.status === 404;

	const isLoading =
		templateQuery.isPending ||
		versionsQuery.isPending ||
		(listingQuery.isPending && !notListed);

	if (isLoading) return <EditorSkeleton />;

	const failed =
		!templateQuery.data || versionsQuery.isError || (listingQuery.isError && !notListed);

	if (failed) {
		return (
			<div className='flex flex-col items-center gap-3 py-20 text-center'>
				<AlertCircle className='size-6 text-muted-foreground' />
				<h1 className='text-lg font-semibold'>Unable to load the listing</h1>
				<div className='flex gap-2'>
					<Button asChild variant='outline' size='sm'>
						<Link href={`/creator/templates/${templateId}`}>
							<ArrowLeft className='size-3.5' />
							Back to template
						</Link>
					</Button>
					<Button
						size='sm'
						onClick={() => {
							templateQuery.refetch();
							versionsQuery.refetch();
							listingQuery.refetch();
						}}
					>
						Try again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<ListingEditor
			template={templateQuery.data}
			listing={notListed ? null : listingQuery.data}
			versions={versionsQuery.data}
		/>
	);
}

function ListingEditor({
	template,
	listing,
	versions,
}: {
	template: PageTemplate;
	listing: TemplateListingDto | null | undefined;
	versions: TemplateVersion[];
}) {
	const publishedVersions = versions.filter((v) => v.status === "PUBLISHED");
	const form = useForm<ListingFormValues>({
		resolver: zodResolver(listingFormSchema),
		defaultValues: toListingFormValues(template, listing, publishedVersions),
	});
	const { formState, register } = form;
	const [saveError, setSaveError] = useState<string | null>(null);
	const [confirm, setConfirm] = useState<"publish" | "unpublish" | null>(null);

	const updateTemplate = useUpdateTemplate();
	const createListing = useCreateTemplateListing();
	const updateListing = useUpdateTemplateListing();
	const publishListing = usePublishTemplateListing();
	const unpublishListing = useUnpublishTemplateListing();

	const isArchived = template.status === "ARCHIVED";
	const isSaving = formState.isSubmitting;
	const state = getListingState(template, listing);
	const statePresentation = LISTING_STATE_PRESENTATION[state];

	useUnsavedChangesGuard(formState.isDirty && !isSaving);

	const onSubmit = form.handleSubmit(async (values) => {
		const saved = formState.defaultValues ?? {};
		// JSON compare: demo allowlists are arrays/objects.
		const changed = (field: keyof ListingFormValues) =>
			JSON.stringify(values[field]) !== JSON.stringify(saved[field]);
		const templateDirty = TEMPLATE_FIELDS.some(changed);
		const listingDirty = LISTING_FIELDS.some(changed);
		setSaveError(null);

		try {
			let nextTemplate = template;
			let nextListing = listing;
			if (templateDirty) {
				nextTemplate = await updateTemplate.mutateAsync({
					templateId: template.id,
					payload: {
						name: values.name.trim(),
						description: values.description.trim() || null,
					},
				});
			}
			if (listingDirty) {
				const payload = toListingPayload(values);
				nextListing = listing
					? await updateListing.mutateAsync({ templateId: template.id, payload })
					: await createListing.mutateAsync({ templateId: template.id, payload });
			}
			form.reset(toListingFormValues(nextTemplate, nextListing, publishedVersions));
			toast.success("Listing saved");
		} catch (error) {
			const message = getApiErrorMessage(error, "Unable to save your changes.");
			setSaveError(message);
			toast.error("Changes not saved", { description: message });
		}
	});

	const runListingAction = async (action: "publish" | "unpublish") => {
		const mutation = action === "publish" ? publishListing : unpublishListing;
		try {
			await mutation.mutateAsync(template.id);
			toast.success(action === "publish" ? "Listing is live" : "Listing unpublished");
			setConfirm(null);
		} catch (error) {
			toast.error(
				getApiErrorMessage(
					error,
					action === "publish"
						? "Unable to publish the listing."
						: "Unable to unpublish the listing.",
				),
			);
		}
	};

	return (
		<FormProvider {...form}>
			<form onSubmit={onSubmit} noValidate className='flex flex-col gap-6'>
				<Link
					href={`/creator/templates/${template.id}?tab=marketplace`}
					className='inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
				>
					<ArrowLeft className='size-3.5' />
					{template.name}
				</Link>

				<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
					<div className='flex flex-col gap-1'>
						<h1 className='text-2xl font-semibold tracking-tight'>
							Marketplace listing
						</h1>
						<span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
							<span className={cn("size-1.5 rounded-full", statePresentation.dot)} />
							{statePresentation.label}
						</span>
					</div>
					<div className='flex flex-wrap gap-2'>
						{state === "LIVE" && (
							<Button asChild variant='outline' size='sm'>
								<Link href={`/templates/${template.id}`} target='_blank'>
									<ExternalLink className='size-3.5' />
									View public page
								</Link>
							</Button>
						)}
						{state === "LIVE" && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => setConfirm("unpublish")}
								disabled={isArchived}
							>
								Unpublish
							</Button>
						)}
						{state === "UNPUBLISHED" && listing?.status !== "PUBLISHED" && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() => setConfirm("publish")}
								disabled={isArchived}
							>
								Publish listing
							</Button>
						)}
					</div>
				</header>

				{isArchived && (
					<p className='rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400'>
						This template is archived. Restore it before editing the listing.
					</p>
				)}

				<div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
					<div className='flex min-w-0 flex-col gap-6'>
						<ListingSection
							id='listing-basic'
							title='Basic information'
							description='Shown on the marketplace. Also updates the template itself.'
						>
							<div className='flex flex-col gap-2'>
								<Label htmlFor='listing-name'>Name</Label>
								<Input
									id='listing-name'
									disabled={isArchived}
									aria-invalid={Boolean(formState.errors.name)}
									{...register("name")}
								/>
								<FieldMessage message={formState.errors.name?.message} />
							</div>
							<div className='flex flex-col gap-2'>
								<Label htmlFor='listing-description'>Description</Label>
								<textarea
									id='listing-description'
									rows={4}
									disabled={isArchived}
									placeholder='What does this template help people do?'
									className='w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30'
									{...register("description")}
								/>
							</div>
						</ListingSection>

						<ListingPricingSection disabled={isArchived} />

						<ListingPreviewSection
							template={template}
							publishedVersions={publishedVersions}
							officialVersionId={listing?.published_version_id}
							disabled={isArchived}
						/>

						<ListingReleaseSection
							// Re-seed version/category picks whenever the saved listing changes.
							key={listing?.updated_at ?? "new"}
							template={template}
							listing={listing}
							publishedVersions={publishedVersions}
							hasUnsavedChanges={formState.isDirty}
							disabled={isArchived}
						/>
					</div>

					<aside className='flex flex-col gap-4 lg:sticky lg:top-20'>
						<ListingCardPreview
							template={template}
							thumbnailVersionId={
								listing?.published_version_id ?? publishedVersions[0]?.id
							}
							categoryNames={(listing?.categories ?? []).map((c) => c.name)}
						/>
					</aside>
				</div>

				{(formState.isDirty || saveError) && (
					<div className='sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:pl-5'>
						<p
							role={saveError ? "alert" : "status"}
							className={cn(
								"text-sm",
								saveError ? "text-destructive" : "text-muted-foreground",
							)}
						>
							{saveError ?? "You have unsaved changes"}
						</p>
						<div className='flex gap-2'>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								disabled={isSaving || !formState.isDirty}
								onClick={() => {
									form.reset();
									setSaveError(null);
								}}
							>
								Discard
							</Button>
							<Button
								type='submit'
								size='sm'
								disabled={isSaving || isArchived || !formState.isDirty}
							>
								{isSaving && <Loader2 className='size-3.5 animate-spin' />}
								Save changes
							</Button>
						</div>
					</div>
				)}
			</form>

			<ConfirmActionDialog
				open={confirm === "unpublish"}
				onOpenChange={(open) => !open && setConfirm(null)}
				title='Unpublish this listing?'
				description='It disappears from the marketplace. People who already have the template keep it.'
				confirmLabel='Unpublish'
				destructive
				pending={unpublishListing.isPending}
				onConfirm={() => runListingAction("unpublish")}
			/>
			<ConfirmActionDialog
				open={confirm === "publish"}
				onOpenChange={(open) => !open && setConfirm(null)}
				title='Publish this listing again?'
				description='The listing returns to the marketplace with its current release and settings.'
				confirmLabel='Publish'
				pending={publishListing.isPending}
				onConfirm={() => runListingAction("publish")}
			/>
		</FormProvider>
	);
}

function EditorSkeleton() {
	return (
		<div className='flex flex-col gap-6'>
			<Skeleton className='h-4 w-32' />
			<Skeleton className='h-8 w-64' />
			<div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
				<div className='flex flex-col gap-6'>
					<Skeleton className='h-56 w-full rounded-xl' />
					<Skeleton className='h-40 w-full rounded-xl' />
				</div>
				<Skeleton className='h-72 w-full rounded-xl' />
			</div>
		</div>
	);
}
