"use client";

import {
	Check,
	ChevronDown,
	FileText,
	Loader2,
	Lock,
	Maximize2,
	Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import {
	pageBlockKeys,
	usePageBlocks,
} from "@/entities/page-block/model/page-block.queries";
import {
	useApplyPagePreset,
	useCreatePage,
	useDeletePagePermanently,
	useMovePage,
	useMovePageToTrash,
	useUpdatePage,
} from "@/entities/page/model/page.mutations";
import { usePagePresets } from "@/entities/page/model/page.queries";
import type { Page, PagePreset } from "@/entities/page/model/page.types";
import { cn } from "@/shared/lib/utils";
import { useTeamspaces } from "@/entities/teamspace/model/teamspace.queries";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EntityEditorDialog } from "@/shared/ui/entity-editor-dialog/entity-editor-dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";

export interface CreatePageLocation {
	teamspaceId: string | null;
	parentPage: Pick<Page, "id" | "title" | "icon"> | null;
}

interface CreatePageDialogProps {
	open: boolean;

	onOpenChange: (open: boolean) => void;

	workspaceId?: string;

	defaultLocation?: CreatePageLocation;
}

const PRIVATE_LOCATION: CreatePageLocation = {
	teamspaceId: null,
	parentPage: null,
};

const TITLE_SAVE_DELAY = 600;

export function CreatePageDialog(props: CreatePageDialogProps) {
	const [session, setSession] = useState(0);
	const [wasOpen, setWasOpen] = useState(props.open);

	if (props.open !== wasOpen) {
		setWasOpen(props.open);
		if (props.open) {
			setSession((current) => current + 1);
		}
	}

	return <CreatePageSession key={session} {...props} />;
}

function CreatePageSession({
	open,
	onOpenChange,
	workspaceId,
	defaultLocation = PRIVATE_LOCATION,
}: CreatePageDialogProps) {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [title, setTitle] = useState("");
	const [location, setLocation] = useState(defaultLocation);
	const [pageId, setPageId] = useState<string | null>(null);

	const titleRef = useRef("");
	const locationRef = useRef(defaultLocation);
	const pageIdRef = useRef<string | null>(null);
	const savedTitleRef = useRef("");
	const creatingRef = useRef<Promise<string> | null>(null);
	const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const createPage = useCreatePage();
	const updatePage = useUpdatePage();
	const movePage = useMovePage();
	const movePageToTrash = useMovePageToTrash();
	const deletePagePermanently = useDeletePagePermanently();
	const applyPreset = useApplyPagePreset();

	const { data: presets = [] } = usePagePresets(open);

	const { data: teamspaces = [] } = useTeamspaces(
		workspaceId ?? "",
		open && Boolean(workspaceId),
	);

	const { data: blocks = [], isPending: isBlocksPending } = usePageBlocks(
		pageId ?? undefined,
	);
	const blockTree = useMemo(() => buildPageBlockTree(blocks), [blocks]);
	const isPresetPristine = blocks.length === 0;

	useEffect(
		() => () => {
			if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
		},
		[],
	);

	const ensurePage = (): Promise<string> => {
		if (pageIdRef.current) {
			return Promise.resolve(pageIdRef.current);
		}

		if (!workspaceId) {
			return Promise.reject(new Error("Missing workspace"));
		}

		if (!creatingRef.current) {
			const target = locationRef.current;
			const initialTitle = titleRef.current.trim();

			creatingRef.current = createPage
				.mutateAsync({
					workspace_id: workspaceId,
					teamspace_id: target.teamspaceId,
					parent_page_id: target.parentPage?.id ?? null,
					title: initialTitle,
				})
				.then((page) => {
					pageIdRef.current = page.id;
					savedTitleRef.current = initialTitle;
					setPageId(page.id);
					return page.id;
				})
				.catch((error: unknown) => {
					creatingRef.current = null;
					toast.error("Unable to create page. Please try again.");
					throw error;
				});
		}

		return creatingRef.current;
	};

	const saveTitle = async (id: string) => {
		const nextTitle = titleRef.current.trim();

		if (nextTitle === savedTitleRef.current) {
			return;
		}

		savedTitleRef.current = nextTitle;

		await updatePage.mutateAsync({
			pageId: id,
			workspaceId: workspaceId ?? "",
			input: { title: nextTitle },
		});
	};

	const flushTitle = async () => {
		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current);
			saveTimerRef.current = null;
		}

		if (!pageIdRef.current && !creatingRef.current) {
			if (!titleRef.current.trim()) {
				return null;
			}
		}

		const id = await ensurePage();
		await saveTitle(id);
		return id;
	};

	const handleTitleChange = (value: string) => {
		setTitle(value);
		titleRef.current = value;

		if (saveTimerRef.current) {
			clearTimeout(saveTimerRef.current);
		}

		saveTimerRef.current = setTimeout(() => {
			saveTimerRef.current = null;
			flushTitle().catch(() => undefined);
		}, TITLE_SAVE_DELAY);
	};

	const handleLocationChange = (next: CreatePageLocation) => {
		const previous = locationRef.current;

		setLocation(next);
		locationRef.current = next;

		const id = pageIdRef.current;
		if (!id || !workspaceId) {
			return;
		}

		movePage.mutate(
			{
				pageId: id,
				workspaceId,
				input: {
					teamspace_id: next.teamspaceId,
					parent_page_id: next.parentPage?.id ?? null,
				},
			},
			{
				onError: () => {
					setLocation(previous);
					locationRef.current = previous;
					toast.error("Unable to move page. Please try again.");
				},
			},
		);
	};

	const discardIfEmpty = async (id: string) => {
		const pageBlocks = queryClient.getQueryData<unknown[]>(
			pageBlockKeys.byPage(id),
		);

		if (titleRef.current.trim() || pageBlocks?.length || !workspaceId) {
			return false;
		}

		await movePageToTrash.mutateAsync({ pageId: id, workspaceId });
		await deletePagePermanently.mutateAsync({ pageId: id, workspaceId });
		return true;
	};

	const handleClose = () => {
		onOpenChange(false);

		flushTitle()
			.then((id) => (id ? discardIfEmpty(id) : false))
			.catch(() => undefined);
	};

	const handleSelectPreset = async (preset: PagePreset) => {
		if (applyPreset.isPending) {
			return;
		}

		let id: string;
		try {
			id = await ensurePage();
		} catch {
			return;
		}

		try {
			if (preset !== "empty") {
				await applyPreset.mutateAsync({ pageId: id, preset });
			}
			await saveTitle(id);
		} catch {
			toast.error("Unable to apply this template. Please try again.");
			return;
		}

		onOpenChange(false);
		router.push(`/page/${id}`);
	};

	const handleOpenFullPage = async () => {
		try {
			const id = await ensurePage();
			await saveTitle(id);
			onOpenChange(false);
			router.push(`/page/${id}`);
		} catch {
			return;
		}
	};

	const selectedTeamspace = teamspaces.find(
		(teamspace) => teamspace.id === location.teamspaceId,
	);

	const selectedLabel = location.parentPage
		? location.parentPage.title || "Untitled"
		: (selectedTeamspace?.name ?? "Private");

	const selectedIcon = location.parentPage ? (
		<PageIcon icon={location.parentPage.icon} />
	) : selectedTeamspace ? (
		<TeamspaceIcon icon={selectedTeamspace.icon} />
	) : (
		<Lock className='size-3.5' />
	);

	const isSelected = (option: CreatePageLocation) =>
		option.teamspaceId === location.teamspaceId &&
		option.parentPage?.id === location.parentPage?.id;

	return (
		<EntityEditorDialog
			open={open}
			onOpenChange={(value) => {
				if (!value) handleClose();
			}}
			title='Create page'
			location={
				<>
					<span className='shrink-0 text-sm text-muted-foreground'>
						Add to
					</span>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type='button'
								aria-label={`Add to ${selectedLabel}`}
								className='flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-medium transition-colors hover:bg-muted'
							>
								<span className='flex shrink-0 items-center text-muted-foreground'>
									{selectedIcon}
								</span>
								<span className='truncate'>{selectedLabel}</span>
								<ChevronDown className='size-3.5 shrink-0 text-muted-foreground' />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='start' className='w-64'>
							{defaultLocation.parentPage && (
								<>
									<DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
										Inside page
									</DropdownMenuLabel>
									<LocationItem
										icon={<PageIcon icon={defaultLocation.parentPage.icon} />}
										label={defaultLocation.parentPage.title || "Untitled"}
										selected={isSelected(defaultLocation)}
										onSelect={() => handleLocationChange(defaultLocation)}
									/>
									<DropdownMenuSeparator />
								</>
							)}

							<LocationItem
								icon={<Lock className='size-3.5' />}
								label='Private'
								selected={isSelected(PRIVATE_LOCATION)}
								onSelect={() => handleLocationChange(PRIVATE_LOCATION)}
							/>

							{teamspaces.length > 0 && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuLabel className='text-xs font-normal text-muted-foreground'>
										Teamspaces
									</DropdownMenuLabel>
									{teamspaces.map((teamspace) => {
										const option = {
											teamspaceId: teamspace.id,
											parentPage: null,
										};

										return (
											<LocationItem
												key={teamspace.id}
												icon={<TeamspaceIcon icon={teamspace.icon} />}
												label={teamspace.name}
												selected={isSelected(option)}
												onSelect={() => handleLocationChange(option)}
											/>
										);
									})}
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</>
			}
			headerActions={
				<button
					type='button'
					aria-label='Open as full page'
					onClick={handleOpenFullPage}
					className='flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
				>
					<Maximize2 className='size-4' />
				</button>
			}
		>
			<input
				autoFocus
				type='text'
				value={title}
				onChange={(event) => handleTitleChange(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.nativeEvent.isComposing) {
						event.preventDefault();
						handleClose();
					}
				}}
				placeholder='New page'
				className='
                    block w-full
                    border-0 bg-transparent p-0
                    text-[40px] font-bold
                    leading-[1.15]
                    tracking-[-0.02em]
                    outline-none
                    placeholder:text-muted-foreground/25
                '
			/>

			<div className='mt-6'>
				{!pageId ? (
					<button
						type='button'
						disabled={createPage.isPending}
						onClick={() => ensurePage().catch(() => undefined)}
						className='w-full rounded-md py-2 text-left text-sm text-muted-foreground/60 transition-colors hover:text-muted-foreground disabled:cursor-wait'
					>
						{createPage.isPending
							? "Creating page..."
							: "Click here to start writing"}
					</button>
				) : isBlocksPending ? (
					<div className='space-y-2'>
						<Skeleton className='h-6 w-2/3' />
						<Skeleton className='h-6 w-1/2' />
					</div>
				) : (
					<PageBlockList pageId={pageId} blocks={blockTree} canEdit />
				)}
			</div>

			{isPresetPristine && presets.length > 0 && (
				<section aria-label='Start with' className='mt-10'>
					<p className='mb-2 px-2 text-xs font-medium text-muted-foreground'>
						Start with
					</p>

					<div className='max-h-[280px] space-y-0.5 overflow-y-auto'>
						{presets.map((preset) => {
							const selected = preset.key === "empty";
							const isApplying =
								applyPreset.isPending &&
								applyPreset.variables?.preset === preset.key;

							return (
								<button
									key={preset.key}
									type='button'
									aria-pressed={selected}
									disabled={applyPreset.isPending}
									onClick={() => handleSelectPreset(preset.key)}
									className={cn(
										"flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-wait",
										selected && "bg-muted text-foreground",
									)}
								>
									<span className='flex size-5 shrink-0 items-center justify-center'>
										{isApplying ? (
											<Loader2 className='size-3.5 animate-spin' />
										) : (
											<span aria-hidden='true'>{preset.icon}</span>
										)}
									</span>
									<span className='min-w-0 flex-1 truncate'>{preset.title}</span>
									{selected && <Check className='size-3.5 shrink-0' />}
								</button>
							);
						})}
					</div>
				</section>
			)}
		</EntityEditorDialog>
	);
}

function LocationItem({
	icon,
	label,
	selected,
	onSelect,
}: {
	icon: ReactNode;
	label: string;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<DropdownMenuItem className='gap-2' onSelect={onSelect}>
			<span className='flex size-4 shrink-0 items-center justify-center text-muted-foreground'>
				{icon}
			</span>
			<span className='min-w-0 flex-1 truncate'>{label}</span>
			{selected && <Check className='size-3.5 shrink-0' />}
		</DropdownMenuItem>
	);
}

function PageIcon({ icon }: { icon: string | null }) {
	return icon ? (
		<span className='text-sm leading-none'>{icon}</span>
	) : (
		<FileText className='size-3.5' />
	);
}

function TeamspaceIcon({ icon }: { icon: string | null }) {
	return icon ? (
		<span className='text-sm leading-none'>{icon}</span>
	) : (
		<Users className='size-3.5' />
	);
}
