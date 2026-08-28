"use client";

import { DownloadIcon, FileIcon, Loader2Icon, UploadIcon } from "lucide-react";
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

export function FileBlockEditor({ block }: FileBlockEditorProps) {
	const [content, setContent] = useState<FileContent>(() =>
		getFileContent(block),
	);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: page } = usePage(block.page_id);

	const uploadAttachment = useUploadAttachment();
	const createDownloadUrl = useCreateAttachmentDownloadUrl();
	const updateBlock = useUpdatePageBlock();

	useEffect(() => {
		setContent(getFileContent(block));
	}, [block]);

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

		if (!file || !page?.workspace_id) {
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

				{uploadAttachment.isError && (
					<p className='mt-2 text-xs text-destructive'>
						Upload file failed.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className='flex w-full items-center gap-3 rounded-md border border-border p-3'>
			<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
				<FileIcon className='size-4 text-muted-foreground' />
			</div>

			<div className='min-w-0 flex-1'>
				<p className='truncate text-sm font-medium'>
					{content.fileName}
				</p>

				<p className='text-xs text-muted-foreground'>
					{formatFileSize(content.size)}
				</p>
			</div>

			<button
				type='button'
				disabled={createDownloadUrl.isPending}
				onClick={handleDownload}
				className='inline-flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
				aria-label='Download file'
			>
				{createDownloadUrl.isPending ? (
					<Loader2Icon className='size-4 animate-spin' />
				) : (
					<DownloadIcon className='size-4' />
				)}
			</button>
		</div>
	);
}
