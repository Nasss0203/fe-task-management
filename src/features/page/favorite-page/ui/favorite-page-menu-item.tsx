"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";

import { useTogglePageFavorite } from "@/entities/page/model/page.mutations";
import { usePageFavorites } from "@/entities/page/model/page.queries";
import type { Page } from "@/entities/page/model/page.types";

import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";

interface FavoritePageMenuItemProps {
	page: Page;
}

export function FavoritePageMenuItem({ page }: FavoritePageMenuItemProps) {
	const { data: favorites = [] } = usePageFavorites(page.workspace_id);
	const toggleFavorite = useTogglePageFavorite();

	const isFavorite = favorites.some((favorite) => favorite.id === page.id);

	const handleToggleFavorite = () => {
		toggleFavorite.mutate(
			{
				page,
				isFavorite,
			},
			{
				onError: () => {
					toast.error("Unable to update favorites. Please try again.");
				},
			},
		);
	};

	return (
		<DropdownMenuItem
			disabled={toggleFavorite.isPending}
			onSelect={(event) => {
				event.preventDefault();

				if (!toggleFavorite.isPending) {
					handleToggleFavorite();
				}
			}}
		>
			<Star
				className={`mr-2 size-4 ${
					isFavorite ? "fill-yellow-400 text-yellow-400" : ""
				}`}
			/>

			{isFavorite ? "Remove from Favorites" : "Add to Favorites"}
		</DropdownMenuItem>
	);
}
