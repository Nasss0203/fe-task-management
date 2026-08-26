import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { getDatabaseViewConfig } from "@/entities/page-block/lib/get-database-view-config";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { DatabaseViewBlock } from "@/widgets/database-view/ui/database-view-block";

interface PageBlockRendererProps {
	block: PageBlockNode;
}

export function PageBlockRenderer({ block }: PageBlockRendererProps) {
	switch (block.type) {
		case PageBlockType.TEXT:
			return <div>{block.title || "Text"}</div>;

		case PageBlockType.HEADER:
			return (
				<h2 className='text-2xl font-semibold'>
					{block.title || "Untitled"}
				</h2>
			);

		case PageBlockType.DIVIDER:
			return <hr className='my-2' />;

		case PageBlockType.TOGGLE:
			return (
				<div>
					<div>{block.title || "Toggle"}</div>

					{block.is_open && (
						<div className='pl-6'>
							{block.children.map((child) => (
								<PageBlockRenderer
									key={child.id}
									block={child}
								/>
							))}
						</div>
					)}
				</div>
			);

		case PageBlockType.DATABASE_VIEW: {
			const config = getDatabaseViewConfig(block);

			if (!config) {
				return (
					<div className='text-sm text-destructive'>
						Invalid database view configuration
					</div>
				);
			}

			return (
				<DatabaseViewBlock
					databaseId={config.database_id}
					viewId={config.view_id}
				/>
			);
		}

		default:
			return (
				<div className='text-sm text-muted-foreground'>
					Unsupported block: {block.type}
				</div>
			);
	}
}
