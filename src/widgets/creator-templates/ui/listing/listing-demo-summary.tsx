"use client";

import { Eye, PencilRuler, ScanEye } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { useTemplatePreview, type PageTemplate } from "@/entities/template";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { summarizeDemo } from "../../model/demo-visibility";
import type { ListingFormValues } from "../../model/listing-form";
import {
	ListingDemoEditorDialog,
	type DemoEditorTab,
} from "./listing-demo-editor-dialog";
import { FieldMessage } from "./listing-primitives";

interface ListingDemoSummaryProps {
	template: PageTemplate;
	versionId: string;
	versionLabel: string;
	disabled?: boolean;
}

/** Compact overview of a LIMITED demo; editing happens in the full-screen editor. */
export function ListingDemoSummary({
	template,
	versionId,
	versionLabel,
	disabled,
}: ListingDemoSummaryProps) {
	const { control, formState } = useFormContext<ListingFormValues>();
	const [blockIds, databases] = useWatch({
		control,
		name: ["demo_block_ids", "demo_databases"],
	});
	const snapshot = useTemplatePreview(template.id, versionId);
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState<DemoEditorTab>("edit");

	const openEditor = (nextTab: DemoEditorTab) => {
		setTab(nextTab);
		setOpen(true);
	};
	const summary = snapshot.data
		? summarizeDemo(snapshot.data, { blockIds, databases })
		: null;

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex min-w-0 items-center gap-3'>
					<span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
						<ScanEye className='size-5' />
					</span>
					<div className='min-w-0'>
						<p className='text-sm font-medium'>Demo content</p>
						{summary ? (
							<p className='text-sm text-muted-foreground'>
								{summary.shownBlocks === 0
									? "Nothing is shown yet."
									: `${summary.shownBlocks} of ${summary.totalBlocks} blocks · ${summary.shownRows} of ${summary.totalRows} rows shown`}
							</p>
						) : (
							<Skeleton className='mt-1 h-4 w-48' />
						)}
					</div>
				</div>

				<div className='flex shrink-0 flex-wrap gap-2'>
					<Button
						type='button'
						variant='outline'
						size='sm'
						disabled={blockIds.length === 0}
						onClick={() => openEditor("visitor")}
					>
						<Eye className='size-3.5' />
						Preview as visitor
					</Button>
					<Button type='button' size='sm' onClick={() => openEditor("edit")}>
						<PencilRuler className='size-3.5' />
						{blockIds.length === 0 ? "Choose content" : "Edit demo content"}
					</Button>
				</div>
			</div>
			<FieldMessage message={formState.errors.demo_block_ids?.message} />

			<ListingDemoEditorDialog
				open={open}
				onOpenChange={setOpen}
				tab={tab}
				onTabChange={setTab}
				template={template}
				versionId={versionId}
				versionLabel={versionLabel}
				disabled={disabled}
			/>
		</div>
	);
}
