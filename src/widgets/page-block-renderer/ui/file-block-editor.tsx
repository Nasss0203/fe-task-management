"use client";

import {
	ChevronDownIcon,
	ChevronRightIcon,
	DownloadIcon,
	FileIcon,
	Loader2Icon,
	UploadIcon,
} from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import {
	useCreateAttachmentDownloadUrl,
	useUploadAttachment,
} from "@/entities/attachment/model/page.mutations";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { usePage } from "@/entities/page/model/page.queries";

interface FileBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

type FileContent = Record<string, unknown> & {
	attachmentId: string;
	fileName: string;
	mimeType: string;
	size: number;
};

function getFileContent(block: PageBlockNode): FileContent {
	const content = block.content;

	if (content && typeof content === "object" && !Array.isArray(content)) {
		return {
			attachmentId:
				"attachmentId" in content &&
				typeof content.attachmentId === "string"
					? content.attachmentId
					: "",

			fileName:
				"fileName" in content && typeof content.fileName === "string"
					? content.fileName
					: "",

			mimeType:
				"mimeType" in content && typeof content.mimeType === "string"
					? content.mimeType
					: "",

			size:
				"size" in content && typeof content.size === "number"
					? content.size
					: 0,
		};
	}

	return {
		attachmentId: "",
		fileName: "",
		mimeType: "",
		size: 0,
	};
}

function formatFileSize(size: number): string {
	if (size <= 0) {
		return "";
	}

	if (size < 1024) {
		return `${size} B`;
	}

	if (size < 1024 * 1024) {
		return `${(size / 1024).toFixed(1)} KB`;
	}

	if (size < 1024 * 1024 * 1024) {
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	}

	return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function isPdfFile(content: FileContent): boolean {
	return (
		content.mimeType === "application/pdf" ||
		content.fileName.toLowerCase().endsWith(".pdf")
	);
}

export function FileBlockEditor({ block, shareToken }: FileBlockEditorProps) {
	const [content, setContent] = useState<FileContent>(() =>
		getFileContent(block),
	);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: page } = usePage(block.page_id, !shareToken);

	const uploadAttachment = useUploadAttachment();
	const createDownloadUrl = useCreateAttachmentDownloadUrl();
	const updateBlock = useUpdatePageBlock(shareToken);

	useEffect(() => {
		setContent(getFileContent(block));
	}, [block]);

	const isPdf = Boolean(content.attachmentId) && isPdfFile(content);
	const [previewOpen, setPreviewOpen] = useState(true);
	const [previewUrl, setPreviewUrl] = useState("");
	const [previewFailed, setPreviewFailed] = useState(false);
	const { mutateAsync: requestDownloadUrl } = createDownloadUrl;

	useEffect(() => {
		if (!isPdf || !previewOpen) {
			return;
		}

		let active = true;
		setPreviewUrl("");
		setPreviewFailed(false);

		requestDownloadUrl(content.attachmentId)
			.then((result) => {
				if (active) setPreviewUrl(result.downloadUrl);
			})
			.catch(() => {
				if (active) setPreviewFailed(true);
			});

		return () => {
			active = false;
		};
	}, [isPdf, previewOpen, content.attachmentId, requestDownloadUrl]);

	const saveContent = (nextContent: FileContent) => {
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

			saveContent({
				attachmentId: attachment.id,
				fileName: attachment.fileName,
				mimeType: attachment.mimeType,
				size: attachment.size,
			});
		} finally {
			event.target.value = "";
		}
	};

	const handleDownload = async () => {
		if (!content.attachmentId) {
			return;
		}

		const result = await createDownloadUrl.mutateAsync(
			content.attachmentId,
		);

		window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
	};

	if (!content.attachmentId) {
		return (
			<div className='w-full rounded-md border border-border bg-muted/20 p-3'>
				<input
					ref={fileInputRef}
					type='file'
					disabled={Boolean(shareToken)}
					className='hidden'
					onChange={handleUpload}
				/>

				<div className='flex items-center gap-3'>
					<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
						<FileIcon className='size-4 text-muted-foreground' />
					</div>

					<div className='min-w-0 flex-1'>
						<div className='text-sm font-medium'>Add a file</div>

						<div className='mt-2'>
							<button
								type='button'
								disabled={
									!page?.workspace_id ||
									Boolean(shareToken) ||
									uploadAttachment.isPending
								}
								onClick={() => fileInputRef.current?.click()}
								className='inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
							>
								{uploadAttachment.isPending ? (
									<Loader2Icon className='size-3.5 animate-spin' />
								) : (
									<UploadIcon className='size-3.5' />
								)}

								{uploadAttachment.isPending
									? "Uploading..."
									: "Upload"}
							</button>
						</div>
					</div>
				</div>

				{shareToken && (
					<p className='mt-2 text-xs text-muted-foreground'>
						File uploads are not supported through share links.
					</p>
				)}

				{uploadAttachment.isError && (
					<p className='mt-2 text-xs text-destructive'>
						Upload file failed.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className='w-full overflow-hidden rounded-md border border-border'>
			<div className='flex items-center gap-3 p-3'>
				{isPdf ? (
					<button
						type='button'
						onClick={() => setPreviewOpen((open) => !open)}
						aria-label={previewOpen ? "Hide preview" : "Show preview"}
						aria-expanded={previewOpen}
						className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted transition-colors hover:bg-muted/70'
					>
						{previewOpen ? (
							<ChevronDownIcon className='size-4 text-muted-foreground' />
						) : (
							<ChevronRightIcon className='size-4 text-muted-foreground' />
						)}
					</button>
				) : (
					<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
						<FileIcon className='size-4 text-muted-foreground' />
					</div>
				)}

				<div className='min-w-0 flex-1'>
					<p className='truncate text-sm font-medium'>
						{content.fileName}
					</p>

					<p className='text-xs text-muted-foreground'>
						{isPdf ? "PDF · " : ""}
						{formatFileSize(content.size)}
					</p>
				</div>

				<button
					type='button'
					onClick={handleDownload}
					className='inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted'
					aria-label='Download file'
				>
					<DownloadIcon className='size-4' />
				</button>
			</div>

			{isPdf && previewOpen && (
				<div className='h-[75vh] min-h-[480px] max-h-[1000px] border-t bg-muted/30'>
					{previewFailed ? (
						<div className='flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground'>
							Could not load the preview. Use the download button instead.
						</div>
					) : previewUrl ? (
						<iframe
							src={`${previewUrl}#view=FitH`}
							title={content.fileName}
							loading='lazy'
							className='size-full'
						/>
					) : (
						<div className='flex h-full items-center justify-center'>
							<Loader2Icon className='size-5 animate-spin text-muted-foreground' />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
