"use client";

import { FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { usePageSearch } from "@/entities/page/model/page.queries";
import type { PageSearchResult } from "@/entities/page/model/page.types";
import { useDebounce } from "@/shared/hooks/use-debounce";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/shared/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/shared/ui/dialog";

import { usePageSearchDialog } from "../model/use-page-search-dialog";

function formatUpdated(value: string) {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? ""
		: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ResultIcon({ result }: { result: PageSearchResult }) {
	return result.icon ? (
		<span className='flex size-5 shrink-0 items-center justify-center text-base leading-none'>
			{result.icon}
		</span>
	) : (
		<FileText className='size-4 shrink-0 text-muted-foreground' />
	);
}

export function PageSearchDialog({ workspaceId }: { workspaceId: string }) {
	const router = useRouter();
	const open = usePageSearchDialog((state) => state.open);
	const setOpen = usePageSearchDialog((state) => state.setOpen);
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query.trim(), 250);

	const { data: results = [], isFetching, isError } = usePageSearch(
		workspaceId,
		debouncedQuery,
		open,
	);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen(!usePageSearchDialog.getState().open);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [setOpen]);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setQuery("");
	};

	const openPage = (pageId: string) => {
		handleOpenChange(false);
		router.push(`/page/${pageId}`);
	};

	const isTyping = query.trim() !== debouncedQuery;
	const heading = debouncedQuery ? "Results" : "Recently edited";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				showCloseButton={false}
				className='top-[20%] translate-y-0 overflow-hidden p-0 sm:max-w-xl'
			>
				<DialogTitle className='sr-only'>Search pages</DialogTitle>
				<DialogDescription className='sr-only'>
					Search page titles and content in this workspace.
				</DialogDescription>
				<Command shouldFilter={false} className='rounded-none'>
					<div className='relative'>
						<CommandInput
							value={query}
							onValueChange={setQuery}
							placeholder='Search pages and content…'
							className='h-12 pr-10'
						/>
						{(isFetching || isTyping) && (
							<Loader2 className='absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground' />
						)}
					</div>
					<CommandList className='max-h-[min(60vh,420px)]'>
						{isError ? (
							<div className='py-8 text-center text-sm text-muted-foreground'>
								Search is unavailable right now.
							</div>
						) : (
							!isFetching &&
							!isTyping && (
								<CommandEmpty>
									{debouncedQuery
										? `No pages match “${debouncedQuery}”.`
										: "No pages yet."}
								</CommandEmpty>
							)
						)}
						{results.length > 0 && (
							<CommandGroup heading={heading}>
								{results.map((result) => (
									<CommandItem
										key={result.pageId}
										value={result.pageId}
										onSelect={() => openPage(result.pageId)}
										className='items-start gap-3 py-2'
									>
										<ResultIcon result={result} />
										<div className='min-w-0 flex-1'>
											<div className='truncate text-sm font-medium'>
												{result.title || "Untitled"}
											</div>
											{result.snippet && (
												<div className='line-clamp-2 text-xs text-muted-foreground'>
													{result.snippet}
												</div>
											)}
										</div>
										<span className='shrink-0 pt-0.5 text-[11px] text-muted-foreground'>
											{formatUpdated(result.updatedAt)}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
					<div className='flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground'>
						<span>
							<kbd className='rounded border px-1'>↑</kbd>{" "}
							<kbd className='rounded border px-1'>↓</kbd> to navigate ·{" "}
							<kbd className='rounded border px-1'>Enter</kbd> to open
						</span>
						<span>
							<kbd className='rounded border px-1'>Ctrl</kbd> +{" "}
							<kbd className='rounded border px-1'>K</kbd>
						</span>
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
