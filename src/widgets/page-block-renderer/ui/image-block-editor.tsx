"use client";

import { ImageIcon, LinkIcon, UploadIcon } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { useUploadAttachment } from "@/entities/attachment/model/page.mutations";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { usePage } from "@/entities/page/model/page.queries";

interface ImageBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

type ImageContent = Record<string, unknown> & {
	url: string;
	caption: string;
	attachmentId?: string | null;
};

function getImageContent(block: PageBlockNode): ImageContent {
	const content = block.content;

	if (content && typeof content === "object" && !Array.isArray(content)) {
		return {
			url:
				"url" in content && typeof content.url === "string"
					? content.url
					: "",
			caption:
				"caption" in content && typeof content.caption === "string"
					? content.caption
					: "",
			attachmentId:
				"attachmentId" in content &&
				typeof content.attachmentId === "string"
					? content.attachmentId
					: null,
		};
	}

	return {
		url: "",
		caption: "",
		attachmentId: null,
	};
}

export function ImageBlockEditor({ block, shareToken }: ImageBlockEditorProps) {
	const [content, setContent] = useState<ImageContent>(() =>
		getImageContent(block),
	);
	const [urlInput, setUrlInput] = useState("");
	const [showEmbedInput, setShowEmbedInput] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: page } = usePage(block.page_id, !shareToken);

	const updateBlock = useUpdatePageBlock(shareToken);
	const uploadAttachment = useUploadAttachment();

	useEffect(() => {
		setContent(getImageContent(block));
	}, [block]);

	const saveContent = (nextContent: ImageContent) => {
		setContent(nextContent);

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: nextContent,
		});
	};

	const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (shareToken || !file || !page?.workspace_id) {
			return;
		}

		try {
			const attachment = await uploadAttachment.mutateAsync({
				workspaceId: page.workspace_id,
				pageBlockId: block.id,
				file,
			});

			const imageUrl = attachment.secureUrl ?? attachment.url;

			if (!imageUrl) {
				return;
			}

			saveContent({
				url: imageUrl,
				caption: "",
				attachmentId: attachment.id,
			});
		} finally {
			event.target.value = "";
		}
	};

	const handleEmbed = () => {
		const url = urlInput.trim();

		if (!url) {
			return;
		}

		saveContent({
			url,
			caption: "",
			attachmentId: null,
		});

		setUrlInput("");
		setShowEmbedInput(false);
	};

	if (!content.url) {
		return (
			<div className='w-full rounded-md bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted/80'>
				<input
					ref={fileInputRef}
					type='file'
					disabled={Boolean(shareToken)}
					accept='image/*'
					className='hidden'
					onChange={handleUpload}
				/>

				{showEmbedInput ? (
					<div className='flex items-center gap-3'>
						<div className='flex shrink-0 items-center text-muted-foreground'>
							<LinkIcon className='size-4' />
						</div>

						<input
							key='image-url-input'
							type='url'
							value={urlInput}
							autoFocus
							placeholder='Paste an image URL...'
							onChange={(event) =>
								setUrlInput(event.target.value)
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									handleEmbed();
								}

								if (event.key === "Escape") {
									setShowEmbedInput(false);
									setUrlInput("");
								}
							}}
							className='h-8 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
						/>

						<button
							type='button'
							onClick={handleEmbed}
							disabled={!urlInput.trim()}
							className='inline-flex h-8 items-center rounded-md bg-background/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50'
						>
							Embed
						</button>
					</div>
				) : (
					<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
						<div className='flex min-w-0 flex-1 items-center gap-3'>
							<div className='flex shrink-0 items-center text-muted-foreground'>
								<ImageIcon className='size-5' />
							</div>

							<div className='min-w-0'>
								<div className='text-sm text-muted-foreground'>
									Add an image
								</div>
							</div>
						</div>

						<div className='flex shrink-0 items-center gap-2'>
							<button
								type='button'
								disabled={
									!page?.workspace_id ||
									Boolean(shareToken) ||
									uploadAttachment.isPending
								}
								onClick={() =>
									fileInputRef.current?.click()
								}
								className='inline-flex h-8 items-center gap-1.5 rounded-md bg-background/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50'
							>
								<UploadIcon className='size-3.5' />

								{uploadAttachment.isPending
									? "Uploading..."
									: "Upload"}
							</button>

							<button
								type='button'
								disabled={uploadAttachment.isPending}
								onClick={() => setShowEmbedInput(true)}
								className='inline-flex h-8 items-center gap-1.5 rounded-md bg-background/40 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-50'
							>
								<LinkIcon className='size-3.5' />
								Embed link
							</button>
						</div>
					</div>
				)}

				{shareToken && (
					<p className='mt-2 text-xs text-muted-foreground'>
						File uploads are not supported through share links.
					</p>
				)}

				{uploadAttachment.isError && (
					<p className='mt-2 text-xs text-destructive'>
						Upload image failed.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className='w-full'>
			<img
				src={content.url}
				alt={content.caption || "Image"}
				className='max-h-[520px] max-w-full rounded-md object-contain'
			/>

			<input
				key='image-caption-input'
				value={content.caption ?? ""}
				placeholder='Add a caption...'
				onChange={(event) => {
					setContent((current) => ({
						...current,
						caption: event.target.value,
					}));
				}}
				onBlur={() => saveContent(content)}
				className='mt-1 w-full border-0 bg-transparent px-1 text-center text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/60'
			/>
		</div>
	);
}
