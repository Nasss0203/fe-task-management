"use client";

import { LinkIcon, Loader2Icon, UploadIcon, VideoIcon } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import {
	useCreateAttachmentDownloadUrl,
	useUploadAttachment,
} from "@/entities/attachment/model/page.mutations";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { useUpdatePageBlock } from "@/entities/page-block/model/page-block.mutations";
import { usePage } from "@/entities/page/model/page.queries";

interface VideoBlockEditorProps {
	block: PageBlockNode;
}

type VideoContent = Record<string, unknown> & {
	url: string;
	attachmentId: string | null;
	fileName: string;
	mimeType: string;
	caption: string;
};

function getVideoContent(block: PageBlockNode): VideoContent {
	const content = block.content;

	if (content && typeof content === "object" && !Array.isArray(content)) {
		return {
			url:
				"url" in content && typeof content.url === "string"
					? content.url
					: "",

			attachmentId:
				"attachmentId" in content &&
				typeof content.attachmentId === "string"
					? content.attachmentId
					: null,

			fileName:
				"fileName" in content && typeof content.fileName === "string"
					? content.fileName
					: "",

			mimeType:
				"mimeType" in content && typeof content.mimeType === "string"
					? content.mimeType
					: "",

			caption:
				"caption" in content && typeof content.caption === "string"
					? content.caption
					: "",
		};
	}

	return {
		url: "",
		attachmentId: null,
		fileName: "",
		mimeType: "",
		caption: "",
	};
}

function getYoutubeEmbedUrl(url: string): string | null {
	try {
		const parsedUrl = new URL(url);

		if (parsedUrl.hostname === "youtu.be") {
			const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];

			return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
		}

		if (
			parsedUrl.hostname === "youtube.com" ||
			parsedUrl.hostname === "www.youtube.com"
		) {
			if (parsedUrl.pathname === "/watch") {
				const videoId = parsedUrl.searchParams.get("v");

				return videoId
					? `https://www.youtube.com/embed/${videoId}`
					: null;
			}

			if (parsedUrl.pathname.startsWith("/embed/")) {
				return url;
			}

			if (parsedUrl.pathname.startsWith("/shorts/")) {
				const videoId = parsedUrl.pathname
					.split("/")
					.filter(Boolean)[1];

				return videoId
					? `https://www.youtube.com/embed/${videoId}`
					: null;
			}
		}
	} catch {
		return null;
	}

	return null;
}

function isDirectVideoUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url);

		const pathname = parsedUrl.pathname.toLowerCase();

		return (
			pathname.endsWith(".mp4") ||
			pathname.endsWith(".webm") ||
			pathname.endsWith(".ogg")
		);
	} catch {
		return false;
	}
}

export function VideoBlockEditor({ block }: VideoBlockEditorProps) {
	const [content, setContent] = useState<VideoContent>(() =>
		getVideoContent(block),
	);

	const [urlInput, setUrlInput] = useState("");
	const [showEmbedInput, setShowEmbedInput] = useState(false);
	const [signedVideoUrl, setSignedVideoUrl] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: page } = usePage(block.page_id);

	const uploadAttachment = useUploadAttachment();
	const createDownloadUrl = useCreateAttachmentDownloadUrl();
	const updateBlock = useUpdatePageBlock();

	useEffect(() => {
		setContent(getVideoContent(block));
	}, [block]);

	useEffect(() => {
		if (!content.attachmentId) {
			setSignedVideoUrl("");
			return;
		}

		let active = true;

		const loadVideoUrl = async () => {
			try {
				const result = await createDownloadUrl.mutateAsync(
					content.attachmentId!,
				);

				if (active) {
					setSignedVideoUrl(result.downloadUrl);
				}
			} catch {
				if (active) {
					setSignedVideoUrl("");
				}
			}
		};

		void loadVideoUrl();

		return () => {
			active = false;
		};
	}, [content.attachmentId]);

	const saveContent = (nextContent: VideoContent) => {
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
				url: "",
				attachmentId: attachment.id,
				fileName: attachment.fileName,
				mimeType: attachment.mimeType,
				caption: "",
			});
		} finally {
			event.target.value = "";
		}
	};

	const handleSaveUrl = () => {
		const url = urlInput.trim();

		if (!url) {
			return;
		}

		saveContent({
			url,
			attachmentId: null,
			fileName: "",
			mimeType: "",
			caption: "",
		});

		setUrlInput("");
		setShowEmbedInput(false);
	};

	const isEmpty = !content.url && !content.attachmentId;

	if (isEmpty) {
		return (
			<div className='w-full rounded-md border border-border bg-muted/20 p-3'>
				<input
					ref={fileInputRef}
					type='file'
					accept='video/mp4,video/webm,video/ogg'
					className='hidden'
					onChange={handleUpload}
				/>

				{showEmbedInput ? (
					<div className='flex items-center gap-2'>
						<LinkIcon className='size-4 shrink-0 text-muted-foreground' />

						<input
							type='url'
							value={urlInput}
							autoFocus
							placeholder='Paste a YouTube or video URL...'
							onChange={(event) =>
								setUrlInput(event.target.value)
							}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									handleSaveUrl();
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
							onClick={handleSaveUrl}
							className='rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted'
						>
							Embed
						</button>
					</div>
				) : (
					<div className='flex items-center gap-3'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-md bg-muted'>
							<VideoIcon className='size-4 text-muted-foreground' />
						</div>

						<div className='min-w-0 flex-1'>
							<div className='text-sm font-medium'>
								Add a video
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
									{uploadAttachment.isPending ? (
										<Loader2Icon className='size-3.5 animate-spin' />
									) : (
										<UploadIcon className='size-3.5' />
									)}

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
						Upload video failed.
					</p>
				)}
			</div>
		);
	}

	const youtubeEmbedUrl = content.url
		? getYoutubeEmbedUrl(content.url)
		: null;

	const directVideo = content.url ? isDirectVideoUrl(content.url) : false;

	return (
		<div className='w-full'>
			{content.attachmentId ? (
				createDownloadUrl.isPending && !signedVideoUrl ? (
					<div className='flex aspect-video w-full max-w-3xl items-center justify-center rounded-md border bg-muted/20'>
						<Loader2Icon className='size-5 animate-spin text-muted-foreground' />
					</div>
				) : signedVideoUrl ? (
					<video
						src={signedVideoUrl}
						controls
						className='max-h-[520px] max-w-full rounded-md'
					/>
				) : (
					<div className='rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive'>
						Unable to load video.
					</div>
				)
			) : youtubeEmbedUrl ? (
				<div className='aspect-video w-full max-w-3xl overflow-hidden rounded-md'>
					<iframe
						src={youtubeEmbedUrl}
						title={content.caption || "YouTube video"}
						className='size-full border-0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
						allowFullScreen
					/>
				</div>
			) : directVideo ? (
				<video
					src={content.url}
					controls
					className='max-h-[520px] max-w-full rounded-md'
				/>
			) : (
				<div className='rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive'>
					Unsupported video URL.
				</div>
			)}

			<input
				value={content.caption}
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
