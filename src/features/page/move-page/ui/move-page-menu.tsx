"use client";

import {
	Check,
	FileText,
	LockKeyhole,
	MoveRight,
	Search,
	UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useMovePage } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";

import { collectDescendantIds } from "@/features/page/move-page/lib/collect-descendant-ids";

import {
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";

export interface TeamspaceOption {
	id: string;
	name: string;
}

interface MovePageMenuProps {
	page: Page;
	pages: Page[];
	teamspaces: TeamspaceOption[];
	onMoved?: () => void;
}

export function MovePageMenu({
	page,
	pages,
	teamspaces,
	onMoved,
}: MovePageMenuProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const movePage = useMovePage();

	const filteredPages = useMemo(() => {
		if (!open) {
			return [];
		}

		const keyword = search.trim().toLowerCase();
		const descendantIds = collectDescendantIds(pages, page.id);

		return pages.filter((target) => {
			if (
				target.id === page.id ||
				descendantIds.has(target.id) ||
				target.deletedAt !== null
			) {
				return false;
			}

			return (
				!keyword ||
				(target.title || "Untitled").toLowerCase().includes(keyword)
			);
		});
	}, [open, page.id, pages, search]);

	const runMove = async (input: {
		parent_page_id: string | null;
		teamspace_id: string | null;
	}) => {
		try {
			await movePage.mutateAsync({
				pageId: page.id,
				workspaceId: page.workspace_id,
				input,
			});

			onMoved?.();
		} catch {
			toast.error("Unable to move page. Please try again.");
		}
	};

	const handleMoveToPrivate = async () => {
		await runMove({
			parent_page_id: null,
			teamspace_id: null,
		});
	};

	const handleMoveToTeamspace = async (teamspaceId: string) => {
		await runMove({
			parent_page_id: null,
			teamspace_id: teamspaceId,
		});
	};

	const handleMoveToPage = async (parentPageId: string) => {
		await runMove({
			parent_page_id: parentPageId,
			teamspace_id: null,
		});
	};

	const isPrivateRoot =
		page.parent_page_id === null && page.teamspace_id === null;

	return (
		<DropdownMenuSub
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);

				if (!nextOpen) {
					setSearch("");
				}
			}}
		>
			<DropdownMenuSubTrigger>
				<MoveRight className='mr-2 size-4' />
				Move to
			</DropdownMenuSubTrigger>

			<DropdownMenuSubContent
				sideOffset={8}
				alignOffset={-4}
				collisionPadding={12}
				className={[
					"flex h-[500px] max-h-[var(--radix-dropdown-menu-content-available-height)]",
					"w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden",
					"rounded-xl bg-popover p-0 shadow-xl",
				].join(" ")}
			>
				<div className='shrink-0 border-b p-3'>
					<div className='relative'>
						<Search className='absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />

						<Input
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
							}}
							onKeyDown={(event) => {
								event.stopPropagation();
							}}
							onPointerDown={(event) => {
								event.stopPropagation();
							}}
							placeholder='Move page to...'
							aria-label='Search page destinations'
							className='pl-8'
							autoFocus
						/>
					</div>
				</div>

				<div className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'>
					<DropdownMenuLabel className='px-2 pb-1 pt-3 text-xs font-medium text-muted-foreground'>
						Suggested
					</DropdownMenuLabel>

					<DropdownMenuItem
						disabled={movePage.isPending || isPrivateRoot}
						onSelect={(event) => {
							event.preventDefault();
							void handleMoveToPrivate();
						}}
					>
						<LockKeyhole className='size-4' />
						<span className='truncate'>Private pages</span>
						{isPrivateRoot ? <Check className='ml-auto size-4' /> : null}
					</DropdownMenuItem>

					{filteredPages.map((target) => {
						const isCurrentParent = target.id === page.parent_page_id;

						return (
							<DropdownMenuItem
								key={target.id}
								disabled={movePage.isPending || isCurrentParent}
								onSelect={(event) => {
									event.preventDefault();
									void handleMoveToPage(target.id);
								}}
							>
								{target.icon ? (
									<span className='flex size-4 items-center justify-center text-sm'>
										{target.icon}
									</span>
								) : (
									<FileText className='size-4' />
								)}
								<span className='truncate'>
									{target.title || "Untitled"}
								</span>
								{isCurrentParent ? (
									<Check className='ml-auto size-4' />
								) : null}
							</DropdownMenuItem>
						);
					})}

					{filteredPages.length === 0 ? (
						<p className='px-2 py-3 text-sm text-muted-foreground'>
							No pages found
						</p>
					) : null}

					<DropdownMenuLabel className='mt-2 px-2 pb-1 pt-3 text-xs font-medium text-muted-foreground'>
						Teamspaces
					</DropdownMenuLabel>

					{teamspaces.map((teamspace) => {
						const isCurrentTeamspaceRoot =
							page.parent_page_id === null &&
							page.teamspace_id === teamspace.id;

						return (
							<DropdownMenuItem
								key={teamspace.id}
								disabled={
									movePage.isPending || isCurrentTeamspaceRoot
								}
								onSelect={(event) => {
									event.preventDefault();
									void handleMoveToTeamspace(teamspace.id);
								}}
							>
								<UsersRound className='size-4' />
								<span className='truncate'>{teamspace.name}</span>
								{isCurrentTeamspaceRoot ? (
									<Check className='ml-auto size-4' />
								) : null}
							</DropdownMenuItem>
						);
					})}
				</div>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
