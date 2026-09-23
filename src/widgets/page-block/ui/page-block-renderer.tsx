import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { getDatabaseViewConfig } from "@/entities/page-block/lib/get-database-view-config";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { Separator } from "@/shared/ui/separator";
import { DatabaseViewBlock } from "@/widgets/database-view/ui/database-view-block";
import { ReadOnlyDatabaseViewBlock } from "@/widgets/database-view/ui/read-only-database-view-block";
import { BookmarkBlockEditor } from "@/widgets/page-block-renderer/ui/bookmark-block-editor";
import { CodeBlockEditor } from "@/widgets/page-block-renderer/ui/code-block-editor";
import { FileBlockEditor } from "@/widgets/page-block-renderer/ui/file-block-editor";
import { HeadingBlockEditor } from "@/widgets/page-block-renderer/ui/heading-block-editor";
import { ImageBlockEditor } from "@/widgets/page-block-renderer/ui/image-block-editor";
import { QuoteBlockEditor } from "@/widgets/page-block-renderer/ui/quote-block-editor";
import { SimpleTableBlockEditor } from "@/widgets/page-block-renderer/ui/simple-table-block-editor";
import { TextBlockEditor } from "@/widgets/page-block-renderer/ui/text-block-editor";
import { TodoBlockEditor } from "@/widgets/page-block-renderer/ui/todo-block-editor";
import { ToggleBlockEditor } from "@/widgets/page-block-renderer/ui/toggle-block-editor";
import { VideoBlockEditor } from "@/widgets/page-block-renderer/ui/video-block-editor";

interface PageBlockRendererProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function PageBlockRenderer({ block, shareToken }: PageBlockRendererProps) {
	switch (block.type) {
		case PageBlockType.TEXT:
			return <TextBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.HEADER:
			return <HeadingBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.DIVIDER:
			return <Separator className='w-full' />;
		case PageBlockType.TODO:
			return <TodoBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.TOGGLE:
			return <ToggleBlockEditor block={block} shareToken={shareToken} />;

		case PageBlockType.QUOTE:
			return <QuoteBlockEditor block={block} shareToken={shareToken} />;

		case PageBlockType.CODE:
			return <CodeBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.TABLE_SIMPLE:
			return <SimpleTableBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.IMAGE:
			return <ImageBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.FILE:
			return <FileBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.VIDEO:
			return <VideoBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.BOOKMARK:
			return <BookmarkBlockEditor block={block} shareToken={shareToken} />;
		case PageBlockType.DATABASE_VIEW: {
			const config = getDatabaseViewConfig(block);

			if (!config) {
				return (
					<div className='text-sm text-destructive'>
						Invalid database view configuration
					</div>
				);
			}

			if (shareToken) {
				return (
					<ReadOnlyDatabaseViewBlock
						databaseId={config.database_id}
						viewId={config.view_id}
						shareToken={shareToken}
					/>
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
