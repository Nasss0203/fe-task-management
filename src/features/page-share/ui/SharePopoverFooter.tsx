"use client";

import { Check, Link2, Settings } from "lucide-react";
import { useState } from "react";

import { pageShareApi } from "@/entities/page-share/api/page-share.api";
import { Button } from "@/shared/ui/button";

interface SharePopoverFooterProps {
	pageId: string;
}

export function SharePopoverFooter({ pageId }: SharePopoverFooterProps) {
	const [copied, setCopied] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const [copyError, setCopyError] = useState<string | null>(null);

	const handleCopyLink = async () => {
		if (isCopying) return;

		setIsCopying(true);
		setCopied(false);
		setCopyError(null);

		try {
			const { token } = await pageShareApi.createPageShareLink(pageId);
			const url = `${window.location.origin}/share/${token}`;

			await navigator.clipboard.writeText(url);

			setCopied(true);

			window.setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch {
			setCopied(false);
			setCopyError("Unable to copy the share link. Please try again.");
		} finally {
			setIsCopying(false);
		}
	};

	return (
		<div className='flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5'>
			<span className='flex items-center gap-[5px] text-[12.5px] text-muted-foreground'>
				<Settings className='size-[13px]' />
				Advanced
			</span>

			<Button
				type='button'
				variant='outline'
				onClick={handleCopyLink}
				disabled={isCopying}
				className='h-[30px] gap-1.5 border-input bg-background px-3 text-[12.5px] font-medium text-foreground shadow-none hover:bg-accent'
			>
				{copied ? (
					<>
						<Check className='size-[13px]' />
						Copied
					</>
				) : (
					<>
						<Link2 className='size-[13px]' />
						{isCopying ? "Copying..." : "Copy link"}
					</>
				)}
			</Button>
			{copyError && (
				<p role='alert' className='w-full text-xs text-destructive'>
					{copyError}
				</p>
			)}
		</div>
	);
}
