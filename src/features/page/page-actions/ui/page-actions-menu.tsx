"use client";

import { ExternalLink, Link2, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { useMovePageToTrash } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";

import {
	MovePageMenu,
	type TeamspaceOption,
} from "@/features/page/move-page/ui/move-page-menu";
import { FavoritePageMenuItem } from "@/features/page/favorite-page/ui/favorite-page-menu-item";
import { RenamePageMenu } from "@/features/page/rename-page/ui/rename-page-menu";
import { SaveAsTemplateMenuItem } from "@/features/page/save-as-template/ui/save-as-template-menu-item";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { DuplicatePageMenuItem } from "../../duplicate-page/ui/duplicate-page-menu-item";

interface PageActionsMenuProps {
	page: Page;
	pages?: Page[];
	children: ReactNode;
	teamspaces?: TeamspaceOption[];

	onMoveToTrash?: (page: Page) => void;
}

export function PageActionsMenu({
	page,
	pages,
	children,
	teamspaces,
	onMoveToTrash,
}: PageActionsMenuProps) {
	const [open, setOpen] = useState(false);
	const defaultMoveToTrash = useMovePageToTrash();

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

	const handleTrashAction = () => {
		if (onMoveToTrash) {
			onMoveToTrash(page);
		} else {
			defaultMoveToTrash.mutate({
				pageId: page.id,
				workspaceId: page.workspace_id,
			});
		}
		setOpen(false);
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

			<DropdownMenuContent
				side="right"
				align="start"
				sideOffset={4}
				className="w-64"
			>
				{/* Page */}
				<DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
					Page
				</DropdownMenuLabel>

				{/* Favorite */}
				<FavoritePageMenuItem page={page} />

				<DropdownMenuSeparator />

				{/* Copy Link */}
				<DropdownMenuItem
					onSelect={() => {
						void handleCopyLink();
					}}
				>
					<Link2 className="mr-2 size-4" />
					Copy link
				</DropdownMenuItem>

				{/* Duplicate */}
				<DuplicatePageMenuItem
					page={page}
					onDuplicated={() => {
						setOpen(false);
					}}
				/>

				{/* Save as template */}
				<SaveAsTemplateMenuItem
					page={page}
					onSaved={() => {
						setOpen(false);
					}}
				/>

				{/* Rename */}
				<RenamePageMenu
					page={page}
					onRenamed={() => {
						setOpen(false);
					}}
				/>

				{/* Move */}
				{pages && teamspaces && (
					<MovePageMenu
						page={page}
						pages={pages}
						teamspaces={teamspaces}
						onMoved={() => {
							setOpen(false);
						}}
					/>
				)}

				{/* Trash */}
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
					onSelect={handleTrashAction}
				>
					<Trash2 className="mr-2 size-4" />
					Move to Trash
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* New Tab */}
				<DropdownMenuItem onSelect={handleOpenInNewTab}>
					<ExternalLink className="mr-2 size-4" />
					Open in new tab
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
