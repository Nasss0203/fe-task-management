import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface TemplateLoadMoreProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
}

export function TemplateLoadMore({
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
}: TemplateLoadMoreProps) {
	if (!hasNextPage) return null;

	return (
		<div className='flex justify-center pt-8 pb-4 w-full'>
			<Button
				variant='outline'
				size='sm'
				disabled={isFetchingNextPage}
				onClick={onLoadMore}
				className='min-w-[140px] rounded-xl px-5 text-xs font-medium border-border/80 shadow-xs gap-2 hover:bg-accent'
			>
				{isFetchingNextPage ? (
					<>
						<Loader2 className='size-3.5 animate-spin' />
						<span>Loading more...</span>
					</>
				) : (
					<span>Load more</span>
				)}
			</Button>
		</div>
	);
}
