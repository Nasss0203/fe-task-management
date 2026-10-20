"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";

import { useTogglePageFavorite } from "@/entities/page/model/page.mutations";
import { usePageFavorites } from "@/entities/page/model/page.queries";
import type { Page } from "@/entities/page/model/page.types";

import { Button } from "@/shared/ui/button";

interface FavoritePageButtonProps {
	page: Page;
}

export function FavoritePageButton({ page }: FavoritePageButtonProps) {
	const { data: favorites = [] } = usePageFavorites(page.workspace_id);
	const toggleFavorite = useTogglePageFavorite();

	const isFavorite = favorites.some((favorite) => favorite.id === page.id);

	return (
		<Button
			variant='ghost'
			size='icon'
			className='h-7 w-7'
			aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
			aria-pressed={isFavorite}
			disabled={toggleFavorite.isPending}
			onClick={() =>
				toggleFavorite.mutate(
					{ page, isFavorite },
					{
						onError: () => {
							toast.error("Unable to update favorites. Please try again.");
						},
					},
				)
			}
		>
			<Star
				className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
			/>
		</Button>
	);
}
