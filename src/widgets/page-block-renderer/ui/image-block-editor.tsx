"use client";

import { ImageIcon, LinkIcon, UploadIcon } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { useUploadAttachment } from "@/entities/attachment/model/page.mutations";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { usePage } from "@/entities/page/model/page.queries";

interface ImageBlockEditorProps {
	block: PageBlockNode;
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

export function ImageBlockEditor({ block }: ImageBlockEditorProps) {
	const [content, setContent] = useState<ImageContent>(() =>
		getImageContent(block),
	);
	const [urlInput, setUrlInput] = useState("");
	const [showEmbedInput, setShowEmbedInput] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: page } = usePage(block.page_id);

	const updateBlock = useUpdatePageBlock();
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

		if (!file || !page?.workspace_id) {
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
			<div className='w-full rounded-md border border-border bg-muted/20 p-3'>
				<input
					ref={fileInputRef}
					type='file'
					accept='image/*'
					className='hidden'
					onChange={handleUpload}
				/>

				{showEmbedInput ? (
					<div className='flex items-center gap-2'>
						<LinkIcon className='size-4 shrink-0 text-muted-foreground' />

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
							className='rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted'
						>
							Embed
						</button>
					</div>
				) : (
					<div className='flex items-center gap-3'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
							<ImageIcon className='size-4 text-muted-foreground' />
						</div>

						<div className='min-w-0 flex-1'>
							<div className='text-sm font-medium'>
								Add an image
							</div>

							<div className='mt-2 flex items-center gap-2'>
								<button
									type='button'
									disabled={
										!page?.workspace_id ||
										uploadAttachment.isPending
									}
									onClick={() =>
										fileInputRef.current?.click()
									}
									className='inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
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
									className='inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
								>
									<LinkIcon className='size-3.5' />
									Embed link
								</button>
							</div>
						</div>
					</div>
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
