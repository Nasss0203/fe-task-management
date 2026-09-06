"use client";

import { ChevronRight, FileText, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import type { PageTreeBase, PageTreeNode } from "../lib/build-page-tree";

interface PageTreeProps<T extends PageTreeBase> {
	pages: PageTreeNode<T>[];

	activePageId?: string;

	onOpenPage: (page: PageTreeNode<T>) => void;

	onCreateChild?: (page: PageTreeNode<T>) => void;

	/**
	 * Render action riêng của Page.
	 *
	 * Ví dụ:
	 * PageActionsMenu
	 */
	renderActions?: (page: PageTreeNode<T>) => ReactNode;

	depth?: number;
}

export function PageTree<T extends PageTreeBase>({
	pages,
	activePageId,
	onOpenPage,
	onCreateChild,
	renderActions,
	depth = 0,
}: PageTreeProps<T>) {
	return (
		<div className='space-y-0.5'>
			{pages.map((page) => (
				<PageTreeItem<T>
					key={page.id}
					page={page}
					activePageId={activePageId}
					onOpenPage={onOpenPage}
					onCreateChild={onCreateChild}
					renderActions={renderActions}
					depth={depth}
				/>
			))}
		</div>
	);
}

interface PageTreeItemProps<T extends PageTreeBase> {
	page: PageTreeNode<T>;

	activePageId?: string;

	onOpenPage: (page: PageTreeNode<T>) => void;

	onCreateChild?: (page: PageTreeNode<T>) => void;

	renderActions?: (page: PageTreeNode<T>) => ReactNode;

	depth?: number;
}

function PageTreeItem<T extends PageTreeBase>({
	page,
	activePageId,
	onOpenPage,
	onCreateChild,
	renderActions,
	depth = 0,
}: PageTreeItemProps<T>) {
	const [expanded, setExpanded] = useState(true);

	const hasChildren = page.children.length > 0;

	const isActive = page.id === activePageId;

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
				{/* Page Icon / Chevron */}
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
					{/* Page Icon */}
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

					{/* Hover icon -> Chevron */}
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

				{/* Page Title */}
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

				{/* Right Actions */}
				<div
					className={[
						"mr-1 flex shrink-0 items-center gap-0.5",
						"pointer-events-none opacity-0",
						"group-hover/page:pointer-events-auto",
						"group-hover/page:opacity-100",
						"transition-opacity duration-100",
					].join(" ")}
				>
					{/* Page Actions Menu */}
					{renderActions?.(page)}

					{/* Create Child */}
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
					<PageTree<T>
						pages={page.children}
						activePageId={activePageId}
						onOpenPage={onOpenPage}
						onCreateChild={onCreateChild}
						renderActions={renderActions}
						depth={depth + 1}
					/>
				</div>
			)}
		</div>
	);
}
