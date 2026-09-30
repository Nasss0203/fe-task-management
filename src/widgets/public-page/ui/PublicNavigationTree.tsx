"use client";

import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { normalizeNavigationPath } from "@/entities/public-site/lib/build-public-navigation-tree";
import type { PublicNavigationNode } from "@/entities/public-site/model/public-site.types";
import { cn } from "@/shared/lib/utils";

interface PublicNavigationTreeProps {
	nodes: PublicNavigationNode[];
	currentPath: string;
	expandedIds: Set<string>;
	onToggleExpand: (pageId: string) => void;
	onNavigate?: (path: string) => void;
	depth?: number;
}

export function PublicNavigationTree({
	nodes,
	currentPath,
	expandedIds,
	onToggleExpand,
	onNavigate,
	depth = 0,
}: PublicNavigationTreeProps) {
	if (!nodes || nodes.length === 0) {
		return null;
	}

	const normalizedCurrent = normalizeNavigationPath(currentPath);

	return (
		<ul
			role={depth === 0 ? "tree" : "group"}
			className={cn("space-y-0.5", depth > 0 && "mt-0.5")}
			data-testid={depth === 0 ? "public-nav-tree" : undefined}
		>
			{nodes.map((node) => {
				const hasChildren = node.children && node.children.length > 0;
				const isExpanded = expandedIds.has(node.page_id);
				const normalizedNodePath = normalizeNavigationPath(node.path);
				const isCurrent = normalizedNodePath === normalizedCurrent;
				const handleLinkClick = () => {
					if (onNavigate) {
						onNavigate(node.path);
					}
				};

				return (
					<li key={node.page_id} className='select-none'>
						<div
							className={cn(
								"group flex items-center rounded-md text-sm transition-colors",
								isCurrent
									? "bg-accent font-medium text-accent-foreground"
									: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
							)}
							style={{ paddingLeft: `${depth * 14 + 4}px` }}
						>
							{/* Expand / Collapse toggle */}
							{hasChildren ? (
								<button
									type='button'
									aria-label={isExpanded ? `Collapse ${node.title}` : `Expand ${node.title}`}
									aria-expanded={isExpanded}
									className='flex size-6 shrink-0 items-center justify-center rounded p-0 text-muted-foreground hover:bg-accent hover:text-foreground'
									onClick={() => onToggleExpand(node.page_id)}
								>
									<ChevronRight
										className={cn(
											"size-3.5 transition-transform duration-150",
											isExpanded && "rotate-90",
										)}
									/>
								</button>
							) : (
								<span className='size-6 shrink-0' aria-hidden='true' />
							)}

							{/* Page link */}
							<Link
								role='treeitem'
								href={node.path}
								onClick={handleLinkClick}
								aria-current={isCurrent ? "page" : undefined}
								aria-selected={isCurrent}
								data-testid={`nav-item-${node.page_id}`}
								className='flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring'
							>
								{node.icon ? (
									<span className='shrink-0 text-base leading-none' aria-hidden='true'>
										{node.icon}
									</span>
								) : (
									<FileText
										className='size-4 shrink-0 text-muted-foreground group-hover:text-foreground'
										aria-hidden='true'
									/>
								)}
								<span className='truncate'>{node.title || "Untitled"}</span>
							</Link>
						</div>

						{/* Nested children */}
						{hasChildren && isExpanded ? (
							<PublicNavigationTree
								nodes={node.children}
								currentPath={currentPath}
								expandedIds={expandedIds}
								onToggleExpand={onToggleExpand}
								onNavigate={onNavigate}
								depth={depth + 1}
							/>
						) : null}
					</li>
				);
			})}
		</ul>
	);
}
