"use client";

import { ExternalLink, Layers, ScanEye } from "lucide-react";
import Link from "next/link";
import { useFormContext, useWatch } from "react-hook-form";

import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import type { ListingFormValues } from "../../model/listing-form";
import { ListingDemoSummary } from "./listing-demo-summary";
import { FieldMessage, OptionCard } from "./listing-primitives";

interface ListingPaidDemoSettingsProps {
	template: PageTemplate;
	publishedVersions: TemplateVersion[];
	/** The version currently sold on the marketplace, if any. */
	officialVersionId?: string | null;
	disabled?: boolean;
}

export function ListingPaidDemoSettings({
	template,
	publishedVersions,
	officialVersionId,
	disabled,
}: ListingPaidDemoSettingsProps) {
	const { control, setValue, formState } = useFormContext<ListingFormValues>();
	const [demoMode, demoVersionId] = useWatch({
		control,
		name: ["demo_mode", "demo_version_id"],
	});
	const options = { shouldDirty: true, shouldValidate: formState.isSubmitted };
	const defaultDemoVersionId = officialVersionId ?? publishedVersions[0]?.id;

	// A separate demo is public in full, so it can never be the version buyers pay for.
	const versionOptions =
		demoMode === "SEPARATE"
			? publishedVersions.filter((version) => version.id !== officialVersionId)
			: publishedVersions;

	const changeMode = (mode: ListingFormValues["demo_mode"]) => {
		setValue("demo_mode", mode, options);
		if (mode === "SEPARATE" && demoVersionId === officialVersionId) {
			setValue("demo_version_id", "", options);
		}
		if (mode === "LIMITED" && !demoVersionId) {
			setValue("demo_version_id", defaultDemoVersionId ?? "", options);
		}
	};

	const changeVersion = (versionId: string) => {
		// Radix may echo "" or the current value; neither should wipe the allowlist.
		if (!versionId || versionId === demoVersionId) return;
		setValue("demo_version_id", versionId, options);
		// Allowlists hold ids of one version's snapshot.
		setValue("demo_block_ids", [], options);
		setValue("demo_databases", {}, options);
	};

	return (
		<div className='flex flex-col gap-4'>
			<div className='grid gap-3 sm:grid-cols-2'>
				<OptionCard
					name='demo_mode'
					value='LIMITED'
					checked={demoMode === "LIMITED"}
					onChange={() => changeMode("LIMITED")}
					title='Limited preview'
					description='Show chosen parts of a version, even the one you sell.'
					icon={<ScanEye className='size-4' />}
					disabled={disabled}
				/>
				<OptionCard
					name='demo_mode'
					value='SEPARATE'
					checked={demoMode === "SEPARATE"}
					onChange={() => changeMode("SEPARATE")}
					title='Separate demo version'
					description='Show a lighter version in full.'
					icon={<Layers className='size-4' />}
					disabled={disabled}
				/>
			</div>

			<div className='flex flex-col gap-2'>
				<Label htmlFor='listing-demo-version'>
					{demoMode === "LIMITED" ? "Version to preview" : "Demo version"}
				</Label>
				{versionOptions.length === 0 ? (
					<p className='rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
						{demoMode === "SEPARATE"
							? "Publish another version to use as a demo, or use a limited preview instead."
							: "Publish a version first."}
					</p>
				) : (
					<div className='flex flex-wrap items-center gap-3'>
						<Select
							value={demoVersionId || undefined}
							onValueChange={changeVersion}
							disabled={disabled}
						>
							<SelectTrigger
								id='listing-demo-version'
								className='w-56'
								aria-invalid={Boolean(formState.errors.demo_version_id)}
							>
								<SelectValue placeholder='Choose a version' />
							</SelectTrigger>
							<SelectContent position='popper'>
								{versionOptions.map((version) => (
									<SelectItem key={version.id} value={version.id}>
										v{version.version_number}
										{version.id === officialVersionId ? " · on sale" : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{demoMode === "SEPARATE" && demoVersionId && (
							<Link
								href={`/creator/templates/${template.id}?version=${demoVersionId}`}
								target='_blank'
								className='inline-flex items-center gap-1 text-sm text-primary hover:underline'
							>
								Open version
								<ExternalLink className='size-3.5' />
							</Link>
						)}
					</div>
				)}
				<FieldMessage message={formState.errors.demo_version_id?.message} />
			</div>

			{demoMode === "LIMITED" && demoVersionId && (
				<ListingDemoSummary
					template={template}
					versionId={demoVersionId}
					versionLabel={`v${
						publishedVersions.find((version) => version.id === demoVersionId)
							?.version_number ?? "?"
					}`}
					disabled={disabled}
				/>
			)}

			{demoMode === "SEPARATE" && (
				<p className='text-xs text-muted-foreground'>
					Visitors can browse the whole demo version, so keep paid content out
					of it. A separate demo version can&apos;t be released for sale.
				</p>
			)}

			{demoMode === "SEPARATE" &&
				demoVersionId &&
				publishedVersions.every((version) => version.id === demoVersionId) && (
					<p
						role='alert'
						className='rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400'
					>
						This is your only published version, so nothing would be left to
						sell. Use a limited preview to demo it instead.
					</p>
				)}
		</div>
	);
}
