"use client";

import { MessageSquare } from "lucide-react";

import { useBlockCommentCounts } from "@/entities/comment/model/comment.queries";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { CommentThreads, useCanComment } from "./comment-threads";

interface BlockCommentsButtonProps {
	pageId: string;
	blockId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Class để nút chỉ hiện khi hover row (dùng khi block chưa có comment). */
	hoverOnlyClassName?: string;
}

/** Icon 💬 ở lề phải block; bấm mở thread comment của block cạnh nó. */
export function BlockCommentsButton({
	pageId,
	blockId,
	open,
	onOpenChange,
	hoverOnlyClassName,
}: BlockCommentsButtonProps) {
	const canComment = useCanComment(pageId);
	const { data: counts } = useBlockCommentCounts(pageId);

	const count = counts?.[blockId] ?? 0;

	if (count === 0 && !canComment) return <span aria-hidden='true' />;

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label={count > 0 ? `${count} comments` : "Comment on block"}
					className={cn(
						"ml-1 flex h-7 w-8 items-center justify-center gap-0.5 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground",
						// Block chưa có comment: chỉ hiện khi hover; có rồi thì luôn hiện để biết đang có trao đổi
						count === 0 && hoverOnlyClassName,
					)}
				>
					<MessageSquare className='size-3.5' />
					{count > 0 && <span>{count}</span>}
				</button>
			</PopoverTrigger>

			<PopoverContent
				side='right'
				align='start'
				sideOffset={8}
				collisionPadding={12}
				className='max-h-[min(28rem,70vh)] w-80 overflow-y-auto p-3'
			>
				<p className='mb-2 text-xs font-medium text-muted-foreground'>
					Comments
				</p>

				<CommentThreads
					target={{ type: "PAGE_BLOCK", id: blockId }}
					canComment={canComment}
					autoFocusComposer={count === 0}
				/>
			</PopoverContent>
		</Popover>
	);
}
