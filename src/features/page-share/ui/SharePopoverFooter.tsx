"use client";

import { Check, Link2, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

interface SharePopoverFooterProps {
	pageId: string;
}

export function SharePopoverFooter({ pageId }: SharePopoverFooterProps) {
	const [copied, setCopied] = useState(false);

	const handleCopyLink = async () => {
		try {
			const url = `${window.location.origin}/page/${pageId}`;

			await navigator.clipboard.writeText(url);

			setCopied(true);

			window.setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className='flex min-h-14 items-center justify-between border-t border-[#303030] px-4 py-2'>
			<span className='flex items-center gap-1.5 px-2 text-xs text-[#aaa]'>
				<Settings className='size-4' />
				Advanced
			</span>

			<Button
				type='button'
				variant='outline'
				onClick={handleCopyLink}
				className='h-9 gap-1.5 border-[#444] bg-transparent px-3 text-xs text-[#ededed] hover:bg-white/5'
			>
				{copied ? (
					<>
						<Check className='size-4' />
						Copied
					</>
				) : (
					<>
						<Link2 className='size-4' />
						Copy link
					</>
				)}
			</Button>
		</div>
	);
}
