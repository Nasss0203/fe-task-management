"use client";

import { ImageIcon, MousePointerClick } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import {
	useTemplateVersionThumbnail,
	type PageTemplate,
	type TemplateVersion,
} from "@/entities/template";
import { Skeleton } from "@/shared/ui/skeleton";

import type { ListingFormValues } from "../../model/listing-form";
import { ListingPaidDemoSettings } from "./listing-paid-demo-settings";
import { ListingSection, OptionCard } from "./listing-primitives";

interface ListingPreviewSectionProps {
	template: PageTemplate;
	publishedVersions: TemplateVersion[];
	/** The version currently sold on the marketplace, if any. */
	officialVersionId?: string | null;
	disabled?: boolean;
}

export function ListingPreviewSection({
	template,
	publishedVersions,
	officialVersionId,
	disabled,
}: ListingPreviewSectionProps) {
	const { control, setValue, formState } = useFormContext<ListingFormValues>();
	const [previewMode, offerType, demoMode, demoVersionId] = useWatch({
		control,
		name: ["preview_mode", "offer_type", "demo_mode", "demo_version_id"],
	});
	// Visitors of a paid listing with a separate demo see that demo's screenshot.
	const isSeparateDemo =
		previewMode === "INTERACTIVE" &&
		offerType === "PAID" &&
		demoMode === "SEPARATE";
	const imageVersionId = isSeparateDemo
		? demoVersionId || undefined
		: (officialVersionId ?? publishedVersions[0]?.id);

	return (
		<ListingSection
			id='listing-preview'
			title='Preview'
			description='What visitors see before they get the template.'
		>
			<div className='grid gap-3 sm:grid-cols-2'>
				<OptionCard
					name='preview_mode'
					value='IMAGE'
					checked={previewMode === "IMAGE"}
					onChange={() =>
						setValue("preview_mode", "IMAGE", {
							shouldDirty: true,
							shouldValidate: formState.isSubmitted,
						})
					}
					title='Screenshot'
					description='Show an image of the template.'
					icon={<ImageIcon className='size-4' />}
					disabled={disabled}
				/>
				<OptionCard
					name='preview_mode'
					value='INTERACTIVE'
					checked={previewMode === "INTERACTIVE"}
					onChange={() =>
						setValue("preview_mode", "INTERACTIVE", {
							shouldDirty: true,
							shouldValidate: formState.isSubmitted,
						})
					}
					title='Live demo'
					description='Let visitors browse a read-only copy.'
					icon={<MousePointerClick className='size-4' />}
					disabled={disabled}
				/>
			</div>

			{previewMode === "INTERACTIVE" && offerType === "FREE" && (
				<p className='rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
					Visitors can browse a read-only copy of the version you release.
				</p>
			)}

			{previewMode === "INTERACTIVE" && offerType === "PAID" && (
				<ListingPaidDemoSettings
					template={template}
					publishedVersions={publishedVersions}
					officialVersionId={officialVersionId}
					disabled={disabled}
				/>
			)}

			<ThumbnailPreview
				templateId={template.id}
				versionId={imageVersionId}
				fromDemo={isSeparateDemo}
			/>
		</ListingSection>
	);
}

function ThumbnailPreview({
	templateId,
	versionId,
	fromDemo,
}: {
	templateId: string;
	versionId?: string;
	fromDemo: boolean;
}) {
	const { data: thumbnail, isPending, isError } = useTemplateVersionThumbnail(
		templateId,
		versionId,
	);

	return (
		<div className='flex flex-col gap-2'>
			<div className='overflow-hidden rounded-lg border bg-muted/40'>
				{!versionId || isError ? (
					<div className='flex aspect-video items-center justify-center px-6 text-center text-sm text-muted-foreground'>
						{versionId
							? "The screenshot isn't ready yet."
							: fromDemo
								? "Choose a demo version to see its screenshot."
								: "A screenshot is generated after you publish a version."}
					</div>
				) : isPending ? (
					<Skeleton className='aspect-video w-full rounded-none' />
				) : (
					// eslint-disable-next-line @next/next/no-img-element -- signed URL from the API
					<img
						src={thumbnail.url}
						alt='Template screenshot'
						className='aspect-video w-full object-cover object-top'
					/>
				)}
			</div>
			<p className='text-xs text-muted-foreground'>
				Generated automatically from the{" "}
				{fromDemo ? "demo" : "released"} version.
			</p>
		</div>
	);
}
