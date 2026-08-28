"use client";

import { BookmarkIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useResolveBookmarkMetadata,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

interface BookmarkBlockEditorProps {
	block: PageBlockNode;
}

type BookmarkContent = Record<string, unknown> & {
	url: string;
	title: string;
	description: string;
	siteName: string;
	faviconUrl: string | null;
	imageUrl: string | null;
};

function getBookmarkContent(block: PageBlockNode): BookmarkContent {
	const content = block.content;

	if (content && typeof content === "object" && !Array.isArray(content)) {
		return {
			url:
				"url" in content && typeof content.url === "string"
					? content.url
					: "",

			title:
				"title" in content && typeof content.title === "string"
					? content.title
					: "",

			description:
				"description" in content &&
				typeof content.description === "string"
					? content.description
					: "",

			siteName:
				"siteName" in content && typeof content.siteName === "string"
					? content.siteName
					: "",

			faviconUrl:
				"faviconUrl" in content &&
				typeof content.faviconUrl === "string"
					? content.faviconUrl
					: null,

			imageUrl:
				"imageUrl" in content && typeof content.imageUrl === "string"
					? content.imageUrl
					: null,
		};
	}

	return {
		url: "",
		title: "",
		description: "",
		siteName: "",
		faviconUrl: null,
		imageUrl: null,
	};
}

function normalizeUrl(value: string): string {
	const url = value.trim();

	if (!url) {
		return "";
	}

	if (/^https?:\/\//i.test(url)) {
		return url;
	}

	return `https://${url}`;
}

function getHostname(url: string): string {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

export function BookmarkBlockEditor({ block }: BookmarkBlockEditorProps) {
	const [content, setContent] = useState<BookmarkContent>(() =>
		getBookmarkContent(block),
	);

	const [urlInput, setUrlInput] = useState("");

	const updateBlock = useUpdatePageBlock();
	const resolveMetadata = useResolveBookmarkMetadata();

	useEffect(() => {
		setContent(getBookmarkContent(block));
	}, [block]);

	const saveContent = (nextContent: BookmarkContent) => {
		setContent(nextContent);

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: nextContent,
		});
	};

	const handleSaveUrl = async () => {
		const url = normalizeUrl(urlInput);

		if (!url) {
			return;
		}

		try {
			const metadata = await resolveMetadata.mutateAsync(url);

			saveContent({
				url: metadata.url,
				title: metadata.title,
				description: metadata.description ?? "",
				siteName: metadata.siteName ?? "",
				faviconUrl: metadata.faviconUrl,
				imageUrl: metadata.imageUrl,
			});

			setUrlInput("");
		} catch {
			// Nếu website không lấy được metadata
			// vẫn tạo bookmark cơ bản.
			saveContent({
				url,
				title: getHostname(url),
				description: url,
				siteName: getHostname(url),
				faviconUrl: null,
				imageUrl: null,
			});

			setUrlInput("");
		}
	};

	if (!content.url) {
		return (
			<div className='flex w-full items-center gap-2 rounded-md border border-border bg-muted/20 p-2'>
				<BookmarkIcon className='size-4 shrink-0 text-muted-foreground' />

				<input
					type='text'
					value={urlInput}
					autoFocus
					disabled={resolveMetadata.isPending}
					placeholder='Paste a link...'
					onChange={(event) => setUrlInput(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							void handleSaveUrl();
						}
					}}
					className='h-8 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50'
				/>

				<button
					type='button'
					disabled={
						!urlInput.trim() ||
						resolveMetadata.isPending ||
						updateBlock.isPending
					}
					onClick={() => void handleSaveUrl()}
					className='inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-50'
				>
					{resolveMetadata.isPending && (
						<Loader2Icon className='size-3.5 animate-spin' />
					)}

					{resolveMetadata.isPending ? "Loading..." : "Bookmark"}
				</button>
			</div>
		);
	}

	return (
		<a
			href={content.url}
			target='_blank'
			rel='noopener noreferrer'
			className='group flex w-full max-w-3xl overflow-hidden rounded-md border border-border transition-colors hover:bg-muted/30'
		>
			<div className='min-w-0 flex flex-1 flex-col justify-between p-3'>
				<div className='min-w-0'>
					<p className='line-clamp-2 text-sm font-medium'>
						{content.title || getHostname(content.url)}
					</p>

					{content.description && (
						<p className='mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground'>
							{content.description}
						</p>
					)}
				</div>

				<div className='mt-3 flex min-w-0 items-center gap-2'>
					{content.faviconUrl ? (
						<img
							src={content.faviconUrl}
							alt=''
							className='size-4 shrink-0 rounded-sm object-contain'
						/>
					) : (
						<BookmarkIcon className='size-4 shrink-0 text-muted-foreground' />
					)}

					<span className='truncate text-xs text-muted-foreground'>
						{content.siteName || getHostname(content.url)}
					</span>

					<ExternalLinkIcon className='ml-auto size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
				</div>
			</div>

			{content.imageUrl && (
				<div className='w-40 shrink-0 border-l'>
					<img
						src={content.imageUrl}
						alt=''
						className='h-full min-h-28 w-full object-cover'
					/>
				</div>
			)}
		</a>
	);
}
