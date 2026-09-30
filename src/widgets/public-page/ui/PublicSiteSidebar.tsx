import { QueryClient, QueryClientContext, QueryClientProvider } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import {
	buildPublicNavigationTree,
	getAncestorPageIds,
} from "@/entities/public-site/lib/build-public-navigation-tree";
import { usePublicSiteNavigation } from "@/entities/public-site/model/public-site.queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { PublicNavigationTree } from "./PublicNavigationTree";

interface PublicSiteSidebarProps {
	subdomain: string;
	currentPath: string;
	onNavigate?: (path: string) => void;
	className?: string;
}

function PublicNavigationSkeleton() {
	return (
		<div
			className='space-y-2 p-3'
			role='status'
			aria-label='Loading navigation'
		>
			<Skeleton className='h-7 w-3/4' />
			<Skeleton className='ml-4 h-7 w-2/3' />
			<Skeleton className='h-7 w-4/5' />
			<Skeleton className='ml-4 h-7 w-1/2' />
			<Skeleton className='h-7 w-3/5' />
		</div>
	);
}

function PublicSiteSidebarInner({
	subdomain,
	currentPath,
	onNavigate,
	className,
}: PublicSiteSidebarProps) {
	const { data, isPending, isError } = usePublicSiteNavigation(subdomain);
	const pages = useMemo(() => data?.pages ?? [], [data?.pages]);

	const tree = useMemo(() => buildPublicNavigationTree(pages), [pages]);

	const [userToggledIds, setUserToggledIds] = useState<Record<string, boolean>>({});

	const autoExpandedIds = useMemo(
		() => getAncestorPageIds(pages, currentPath),
		[pages, currentPath],
	);

	const expandedIds = useMemo(() => {
		const set = new Set(autoExpandedIds);
		for (const [id, expanded] of Object.entries(userToggledIds)) {
			if (expanded) {
				set.add(id);
			} else {
				set.delete(id);
			}
		}
		return set;
	}, [autoExpandedIds, userToggledIds]);

	const handleToggleExpand = (pageId: string) => {
		const isCurrentlyExpanded = expandedIds.has(pageId);
		setUserToggledIds((prev) => ({
			...prev,
			[pageId]: !isCurrentlyExpanded,
		}));
	};

	if (isPending) {
		return (
			<div className={className}>
				<PublicNavigationSkeleton />
			</div>
		);
	}

	if (isError) {
		return (
			<div className={className}>
				<p className='p-4 text-xs text-muted-foreground' role='alert'>
					Unable to load pages
				</p>
			</div>
		);
	}

	if (pages.length === 0) {
		return null;
	}

	return (
		<div className={className}>
			<nav aria-label='Public site navigation' className='p-2'>
				<PublicNavigationTree
					nodes={tree}
					currentPath={currentPath}
					expandedIds={expandedIds}
					onToggleExpand={handleToggleExpand}
					onNavigate={onNavigate}
				/>
			</nav>
		</div>
	);
}

export function PublicSiteSidebar(props: PublicSiteSidebarProps) {
	const client = useContext(QueryClientContext);
	const [fallbackClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: { queries: { retry: false } },
			}),
	);

	if (!client) {
		return (
			<QueryClientProvider client={fallbackClient}>
				<PublicSiteSidebarInner {...props} />
			</QueryClientProvider>
		);
	}

	return <PublicSiteSidebarInner {...props} />;
}
