"use client";

import { EyeOff, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import {
	useTemplateDemoPreview,
	type PageTemplate,
	type PreviewTemplateDemoPayload,
} from "@/entities/template";
import { TemplateSnapshotRenderer } from "@/features/template-preview";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { toDemoConfig, type ListingFormValues } from "../../model/listing-form";

/**
 * Renders the backend's own filtered result for the unsaved config, so the
 * creator sees exactly what visitors will receive.
 */
export function ListingDemoLivePreview({
	template,
	fill,
}: {
	template: PageTemplate;
	/** Fill the parent's height (demo editor) instead of a fixed-height box. */
	fill?: boolean;
}) {
	const { control } = useFormContext<ListingFormValues>();
	const values = useWatch({ control }) as ListingFormValues;

	const payload: PreviewTemplateDemoPayload | null =
		!values.demo_version_id ||
		(values.demo_mode === "LIMITED" && values.demo_block_ids.length === 0)
			? null
			: {
					demo_version_id: values.demo_version_id,
					demo_config: toDemoConfig(values),
				};
	// Debounce a JSON key so identical selections never refetch.
	const debouncedKey = useDebounce(JSON.stringify(payload), 500);
	const debouncedPayload = useMemo<PreviewTemplateDemoPayload | null>(
		() => JSON.parse(debouncedKey),
		[debouncedKey],
	);
	const preview = useTemplateDemoPreview(template.id, debouncedPayload);
	const hidden = preview.data?.hiddenContent;

	return (
		<section
			aria-label='Demo preview'
			className={cn(
				"flex flex-col overflow-hidden",
				fill ? "h-full min-h-0" : "rounded-lg border",
			)}
		>
			<div className='flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2'>
				<span className='text-xs font-medium'>What visitors see</span>
				<span className='inline-flex items-center gap-1.5 text-xs text-muted-foreground'>
					{preview.isFetching && <Loader2 className='size-3 animate-spin' />}
					{hidden &&
						`${hidden.blocks} block${hidden.blocks === 1 ? "" : "s"} · ${hidden.rows} row${hidden.rows === 1 ? "" : "s"} hidden`}
				</span>
			</div>

			<div className={cn("overflow-y-auto", fill ? "min-h-0 flex-1" : "max-h-[32rem]")}>
				{!payload ? (
					<Empty text='Tick at least one block to preview the demo.' />
				) : preview.isError ? (
					<Empty
						text={getApiErrorMessage(
							preview.error,
							"Unable to build the demo preview.",
						)}
						tone='error'
					/>
				) : !preview.data ? (
					<Empty text='Building preview…' />
				) : (
					<TemplateSnapshotRenderer
						template={template}
						blocks={preview.data.blocks}
						databases={preview.data.databases}
					/>
				)}
			</div>
		</section>
	);
}

function Empty({ text, tone }: { text: string; tone?: "error" }) {
	return (
		<p
			role={tone === "error" ? "alert" : undefined}
			className={
				tone === "error"
					? "flex items-center gap-2 px-4 py-10 text-sm text-destructive"
					: "flex items-center gap-2 px-4 py-10 text-sm text-muted-foreground"
			}
		>
			<EyeOff className='size-4 shrink-0' />
			{text}
		</p>
	);
}
