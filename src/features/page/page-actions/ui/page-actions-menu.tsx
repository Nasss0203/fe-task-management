"use client";

import {
	Copy,
	ExternalLink,
	Link2,
	MoveRight,
	Star,
	Trash2,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import type { Page } from "@/entities/page/model/page.types";

import { RenamePageMenu } from "@/features/page/rename-page/ui/rename-page-menu";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface PageActionsMenuProps {
	page: Page;

	children: ReactNode;

	onDuplicate?: (page: Page) => void;

	onMove?: (page: Page) => void;

	onMoveToTrash?: (page: Page) => void;

	onAddToFavorites?: (page: Page) => void;
}

export function PageActionsMenu({
	page,
	children,
	onDuplicate,
	onMove,
	onMoveToTrash,
	onAddToFavorites,
}: PageActionsMenuProps) {
	const [open, setOpen] = useState(false);

	/**
	 * Copy URL Page.
	 */
	const handleCopyLink = async () => {
		const url = `${window.location.origin}/page/${page.id}`;

		await navigator.clipboard.writeText(url);

		setOpen(false);
	};

	/**
	 * Mở Page ở tab mới.
	 */
	const handleOpenInNewTab = () => {
		window.open(`/page/${page.id}`, "_blank", "noopener,noreferrer");

		setOpen(false);
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

			<DropdownMenuContent
				side='right'
				align='start'
				sideOffset={4}
				className='w-64'
			>
				{/* Page */}
				<DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
					Page
				</DropdownMenuLabel>

				{/* Favorite */}
				<DropdownMenuItem
					onSelect={() => {
						onAddToFavorites?.(page);
					}}
				>
					<Star className='mr-2 size-4' />
					Add to Favorites
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Copy Link */}
				<DropdownMenuItem
					onSelect={() => {
						void handleCopyLink();
					}}
				>
					<Link2 className='mr-2 size-4' />
					Copy link
				</DropdownMenuItem>

				{/* Duplicate */}
				<DropdownMenuItem
					onSelect={() => {
						onDuplicate?.(page);
					}}
				>
					<Copy className='mr-2 size-4' />
					Duplicate
				</DropdownMenuItem>

				{/* Rename */}
				<RenamePageMenu
					page={page}
					onRenamed={() => {
						setOpen(false);
					}}
				/>

				{/* Move */}
				<DropdownMenuItem
					onSelect={() => {
						onMove?.(page);
					}}
				>
					<MoveRight className='mr-2 size-4' />
					Move to
				</DropdownMenuItem>

				{/* Trash */}
				<DropdownMenuItem
					className='text-destructive focus:text-destructive'
					onSelect={() => {
						onMoveToTrash?.(page);
					}}
				>
					<Trash2 className='mr-2 size-4' />
					Move to Trash
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* New Tab */}
				<DropdownMenuItem onSelect={handleOpenInNewTab}>
					<ExternalLink className='mr-2 size-4' />
					Open in new tab
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
