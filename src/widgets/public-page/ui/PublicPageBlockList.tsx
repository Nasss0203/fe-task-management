import type { MouseEvent } from "react";

import { buildPublicPageBlockTree } from "@/entities/public-site/lib/build-public-page-block-tree";
import type { PublicPageBlock } from "@/entities/public-site/model/public-site.types";
import { cn } from "@/shared/lib/utils";
import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";

interface PublicPageBlockListProps {
	blocks: PublicPageBlock[];
	onBlockClick?: () => void;
}

export function PublicPageBlockList({
	blocks,
	onBlockClick,
}: PublicPageBlockListProps) {
	const blockTree = buildPublicPageBlockTree(blocks);

	if (blockTree.length === 0) {
		return null;
	}

	// Links, controls and text selection keep working as before.
	const handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (
			!onBlockClick ||
			target.closest("a, button, input, video, audio, iframe") ||
			window.getSelection()?.toString()
		) {
			return;
		}
		onBlockClick();
	};

	return (
		<div
			className='pointer-events-auto w-full min-w-0 max-w-full select-text space-y-2'
			data-testid='public-block-list'
		>
			{blockTree.map((block) => (
				<div
					key={block.id}
					className={cn(
						"min-w-0 py-0.5",
						onBlockClick && "cursor-text rounded-md hover:bg-muted/40",
					)}
					onClick={handleClick}
				>
					<ReadOnlyPageBlockRenderer
						block={block}
						disableDatabaseView
					/>
				</div>
			))}
		</div>
	);
}
