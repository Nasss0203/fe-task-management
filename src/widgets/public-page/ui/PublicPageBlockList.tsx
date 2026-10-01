import { buildPublicPageBlockTree } from "@/entities/public-site/lib/build-public-page-block-tree";
import type { PublicPageBlock } from "@/entities/public-site/model/public-site.types";
import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";

interface PublicPageBlockListProps {
	blocks: PublicPageBlock[];
}

export function PublicPageBlockList({ blocks }: PublicPageBlockListProps) {
	const blockTree = buildPublicPageBlockTree(blocks);

	if (blockTree.length === 0) {
		return null;
	}

	return (
		<div
			className='pointer-events-auto w-full min-w-0 max-w-full select-text space-y-2'
			data-testid='public-block-list'
		>
			{blockTree.map((block) => (
				<div key={block.id} className='min-w-0 py-0.5'>
					<ReadOnlyPageBlockRenderer
						block={block}
						disableDatabaseView
					/>
				</div>
			))}
		</div>
	);
}
