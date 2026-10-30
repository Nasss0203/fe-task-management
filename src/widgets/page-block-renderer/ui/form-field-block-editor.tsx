"use client";

import { Asterisk } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import type { Database } from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { cn } from "@/shared/lib/utils";

import { useBlockAutoFocus } from "@/widgets/page-block-editor/ui/page-block-editor-context";

import { getFieldLabel, getFormField } from "../lib/form-config";

const FormDatabaseContext = createContext<Database | null>(null);

export const FormDatabaseProvider = FormDatabaseContext.Provider;

interface FormFieldBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function FormFieldBlockEditor({
	block,
	shareToken,
}: FormFieldBlockEditorProps) {
	const database = useContext(FormDatabaseContext);
	const field = getFormField(block.data_config);
	const property = database?.properties.find(
		(item) => item.id === field?.property_id,
	);
	const savedLabel = getFieldLabel(block.content, property?.name ?? "Question");
	const [label, setLabel] = useState(savedLabel);
	const inputRef = useRef<HTMLInputElement>(null);
	const updateBlock = useUpdatePageBlock(shareToken);

	useEffect(() => setLabel(savedLabel), [savedLabel]);
	useBlockAutoFocus(block.id, inputRef);

	if (!field || !property) {
		return (
			<p className='text-sm text-muted-foreground'>
				This question&apos;s field is missing from the form database.
			</p>
		);
	}

	return (
		<div className='w-full rounded-md border border-border/60 bg-background/40 px-3 py-2'>
			<div className='flex items-center gap-2'>
				<input
					ref={inputRef}
					value={label}
					aria-label='Question'
					onChange={(event) => setLabel(event.target.value)}
					onBlur={() => {
						if (label === savedLabel) return;
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							content: { ...block.content, label },
						});
					}}
					className='min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium outline-none'
				/>
				<button
					type='button'
					aria-pressed={field.required}
					title={field.required ? "Required" : "Optional"}
					onClick={() =>
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							dataConfig: { ...block.data_config, required: !field.required },
						})
					}
					className={cn(
						"flex h-6 items-center gap-1 rounded-sm px-1.5 text-xs transition-colors hover:bg-muted",
						field.required ? "text-destructive" : "text-muted-foreground",
					)}
				>
					<Asterisk className='size-3.5' />
					{field.required ? "Required" : "Optional"}
				</button>
			</div>
			<div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
				<PropertyIcon type={property.type} className='size-3.5' />
				Saved to {property.name}
			</div>
		</div>
	);
}
