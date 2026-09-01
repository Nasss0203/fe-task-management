"use client";

import { ChevronRight, FileText, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";

import type { PageTreeNode } from "../lib/build-page-tree";

interface PageTreeProps {
	pages: PageTreeNode[];

	activePageId?: string;

	onOpenPage: (page: PageTreeNode) => void;

	onCreateChild?: (page: PageTreeNode) => void;

	onOpenActions?: (page: PageTreeNode) => void;

	depth?: number;
}

export function PageTree({
	pages,
	activePageId,
	onOpenPage,
	onCreateChild,
	onOpenActions,
	depth = 0,
}: PageTreeProps) {
	return (
		<div className='space-y-0.5'>
			{pages.map((page) => (
				<PageTreeItem
					key={page.id}
					page={page}
					activePageId={activePageId}
					onOpenPage={onOpenPage}
					onCreateChild={onCreateChild}
					onOpenActions={onOpenActions}
					depth={depth}
				/>
			))}
		</div>
	);
}

interface PageTreeItemProps {
	page: PageTreeNode;

	activePageId?: string;

	onOpenPage: (page: PageTreeNode) => void;

	onCreateChild?: (page: PageTreeNode) => void;

	onOpenActions?: (page: PageTreeNode) => void;

	depth?: number;
}

function PageTreeItem({
	page,
	activePageId,
	onOpenPage,
	onCreateChild,
	onOpenActions,
	depth = 0,
}: PageTreeItemProps) {
	const [expanded, setExpanded] = useState(true);

	const hasChildren = page.children.length > 0;

	const isActive = page.id === activePageId;

	/**
	 * Level càng sâu càng compact.
	 */
	const rowSizeClass =
		depth === 0
			? "h-8 text-sm"
			: depth === 1
				? "h-7 text-[13px]"
				: "h-7 text-xs";

	const iconSizeClass =
		depth === 0 ? "size-4" : depth === 1 ? "size-3.5" : "size-3";

	const iconButtonSizeClass = depth === 0 ? "size-6" : "size-5";

	const actionButtonSizeClass = depth === 0 ? "size-6" : "size-5";

	const actionIconSizeClass = depth === 0 ? "size-3.5" : "size-3";

	const pageIconTextClass =
		depth === 0 ? "text-sm" : depth === 1 ? "text-[13px]" : "text-xs";

	return (
		<div>
			{/* Page row */}
			<div
				className={[
					"group/page flex items-center rounded-md",
					rowSizeClass,
					"hover:bg-sidebar-accent/60",
					isActive
						? "bg-sidebar-accent text-sidebar-accent-foreground"
						: "",
				].join(" ")}
			>
				{/* Page icon / Chevron */}
				<button
					type='button'
					aria-label={
						hasChildren
							? expanded
								? "Collapse page"
								: "Expand page"
							: "Page icon"
					}
					className={[
						"group/icon relative flex shrink-0 items-center justify-center rounded-sm",
						iconButtonSizeClass,
						hasChildren
							? "cursor-pointer hover:bg-sidebar-accent-foreground/10"
							: "cursor-default",
					].join(" ")}
					onClick={(event) => {
						event.stopPropagation();

						if (!hasChildren) {
							return;
						}

						setExpanded((current) => !current);
					}}
				>
					{/* Page icon */}
					<span
						className={[
							"flex items-center justify-center",
							hasChildren ? "group-hover/icon:hidden" : "",
						].join(" ")}
					>
						{page.icon ? (
							<span className={pageIconTextClass}>
								{page.icon}
							</span>
						) : (
							<FileText className={iconSizeClass} />
						)}
					</span>

					{/* Chevron chỉ hiện khi hover icon */}
					{hasChildren && (
						<ChevronRight
							className={[
								iconSizeClass,
								"absolute hidden",
								"group-hover/icon:block",
								"transition-transform duration-150",
								expanded ? "rotate-90" : "",
							].join(" ")}
						/>
					)}
				</button>

				{/* Page title */}
				<button
					type='button'
					className='flex min-w-0 flex-1 items-center overflow-hidden text-left'
					onClick={() => {
						onOpenPage(page);
					}}
				>
					<span className='min-w-0 truncate'>
						{page.title || "Untitled"}
					</span>
				</button>

				{/* Right actions */}
				<div
					className={[
						"mr-1 hidden shrink-0 items-center gap-0.5",
						"group-hover/page:flex",
					].join(" ")}
				>
					{/* More */}
					{onOpenActions && (
						<button
							type='button'
							aria-label='More page actions'
							className={[
								"flex shrink-0 items-center justify-center rounded-sm",
								"text-muted-foreground",
								"hover:bg-sidebar-accent-foreground/10",
								"hover:text-sidebar-foreground",
								actionButtonSizeClass,
							].join(" ")}
							onClick={(event) => {
								event.stopPropagation();

								onOpenActions(page);
							}}
						>
							<MoreHorizontal className={actionIconSizeClass} />
						</button>
					)}

					{/* Create child */}
					{onCreateChild && (
						<button
							type='button'
							aria-label='Create child page'
							className={[
								"flex shrink-0 items-center justify-center rounded-sm",
								"text-muted-foreground",
								"hover:bg-sidebar-accent-foreground/10",
								"hover:text-sidebar-foreground",
								actionButtonSizeClass,
							].join(" ")}
							onClick={(event) => {
								event.stopPropagation();

								onCreateChild(page);
							}}
						>
							<Plus className={actionIconSizeClass} />
						</button>
					)}
				</div>
			</div>

			{/* Children */}
			{expanded && hasChildren && (
				<div className='ml-4'>
					<PageTree
						pages={page.children}
						activePageId={activePageId}
						onOpenPage={onOpenPage}
						onCreateChild={onCreateChild}
						onOpenActions={onOpenActions}
						depth={depth + 1}
					/>
				</div>
			)}
		</div>
	);
}
