"use client";

import { LinkIcon } from "lucide-react";
import { useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { resolveEmbed } from "@/entities/page-block/lib/resolve-embed";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import {
	EmbedFrame,
	getContent,
	getString,
} from "@/entities/page-block/ui/read-only-block-content";

interface EmbedBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function EmbedBlockEditor({ block, shareToken }: EmbedBlockEditorProps) {
	const url = getString(getContent(block), "url");
	const embed = url ? resolveEmbed(url) : null;

	const [editing, setEditing] = useState(false);
	const [urlInput, setUrlInput] = useState(url);
	const [invalid, setInvalid] = useState(false);

	const updateBlock = useUpdatePageBlock(shareToken);

	const handleSave = () => {
		const nextUrl = urlInput.trim();
		const resolved = resolveEmbed(nextUrl);

		if (!resolved) {
			setInvalid(true);
			return;
		}

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			type: resolved.type,
			content: { url: nextUrl },
		});

		setInvalid(false);
		setEditing(false);
	};

	if (!embed || editing) {
		return (
			<div className='w-full rounded-md border border-border bg-muted/20 p-3'>
				<div className='flex items-center gap-2'>
					<LinkIcon className='size-4 shrink-0 text-muted-foreground' />

					<input
						type='url'
						value={urlInput}
						autoFocus={editing}
						aria-label='Embed link'
						aria-invalid={invalid}
						placeholder='Paste a Figma, Google Maps, GitHub Gist or tweet link...'
						onChange={(event) => {
							setUrlInput(event.target.value);
							setInvalid(false);
						}}
						onKeyDown={(event) => {
							if (event.key === "Enter") handleSave();

							if (event.key === "Escape" && embed) setEditing(false);
						}}
						className='h-8 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
					/>

					<button
						type='button'
						onClick={handleSave}
						className='rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted'
					>
						Embed
					</button>
				</div>

				{(invalid || (url && !embed)) && (
					<p role='alert' className='mt-2 text-xs text-destructive'>
						Only Figma, Google Maps, GitHub Gist and X/Twitter links
						can be embedded.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className='group/embed relative w-full max-w-3xl'>
			<EmbedFrame embed={embed} title={url} />

			<button
				type='button'
				onClick={() => {
					setUrlInput(url);
					setEditing(true);
				}}
				className='absolute right-2 top-2 rounded-md border bg-background/90 px-2 py-1 text-xs font-medium opacity-0 shadow-sm transition-opacity hover:bg-muted focus-visible:opacity-100 group-hover/embed:opacity-100'
			>
				Change link
			</button>
		</div>
	);
}
