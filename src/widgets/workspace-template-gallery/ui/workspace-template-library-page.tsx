"use client";

import { Library, RotateCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

import {
	useInfiniteTemplates,
	useMyClaimedTemplates,
	type TemplateEntitlementSource,
} from "@/entities/template";
import { useUser } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import {
	toClaimedTemplateCard,
	toCreatedTemplateCard,
} from "../model/claimed-template-card.model";
import { ClaimedTemplateCard } from "./claimed-template-card";
import { LibraryUseTemplateDialog } from "./library-use-template-dialog";
import { PurchaseHistoryList } from "./purchase-history-list";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { WorkspaceTemplatesHeader } from "./workspace-templates-header";

type LibraryTab = {
	id: "all" | "purchased" | "claimed" | "created" | "history";
	label: string;
	source?: TemplateEntitlementSource;
	empty?: { title: string; text: string; href: string; cta: string };
};

const LIBRARY_TABS: LibraryTab[] = [
	{
		id: "all",
		label: "All",
		empty: {
			title: "Your library is empty",
			text: "Templates you get from the marketplace show up here.",
			href: "/dashboard/templates",
			cta: "Browse the marketplace",
		},
	},
	{
		id: "purchased",
		label: "Purchased",
		source: "PAID_PURCHASE",
		empty: {
			title: "No purchased templates",
			text: "Paid templates you buy show up here.",
			href: "/dashboard/templates",
			cta: "Browse the marketplace",
		},
	},
	{
		id: "claimed",
		label: "Claimed",
		source: "FREE_CLAIM",
		empty: {
			title: "No claimed templates",
			text: "Free templates you use show up here.",
			href: "/dashboard/templates",
			cta: "Browse the marketplace",
		},
	},
	{
		id: "created",
		label: "Created",
		empty: {
			title: "You have not created a template",
			text: "Save a page as a template, then manage it in Creator Studio.",
			href: "/creator/templates",
			cta: "Open Creator Studio",
		},
	},
	{ id: "history", label: "Purchase history" },
];

type Selection = { id: string; action: "details" | "use" };

/** Templates the user purchased, claimed or created, ready to use again. */
export function WorkspaceTemplateLibraryPage() {
	return (
		<Suspense fallback={null}>
			<LibraryContent />
		</Suspense>
	);
}

function LibraryContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { user } = useUser();
	const tab =
		LIBRARY_TABS.find((item) => item.id === searchParams.get("tab")) ??
		LIBRARY_TABS[0];

	const selectTab = (id: LibraryTab["id"]) => {
		const params = new URLSearchParams(searchParams.toString());
		if (id === "all") params.delete("tab");
		else params.set("tab", id);
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	};

	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8'>
			<WorkspaceTemplatesHeader description='Templates you purchased, claimed or created. Use them again in any workspace.' />

			<div
				role='tablist'
				aria-label='Library sections'
				className='-mt-4 flex gap-1 overflow-x-auto'
			>
				{LIBRARY_TABS.map((item) => (
					<button
						key={item.id}
						type='button'
						role='tab'
						aria-selected={item.id === tab.id}
						onClick={() => selectTab(item.id)}
						className={cn(
							"shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
							item.id === tab.id
								? "bg-foreground text-background"
								: "bg-muted text-muted-foreground hover:text-foreground",
						)}
					>
						{item.label}
					</button>
				))}
			</div>

			{!user ? (
				<LibrarySkeleton />
			) : tab.id === "history" ? (
				<PurchaseHistoryList userId={user.id} />
			) : (
				<LibraryTemplateGrid key={tab.id} tab={tab} userId={user.id} />
			)}
		</div>
	);
}

function LibraryTemplateGrid({ tab, userId }: { tab: LibraryTab; userId: string }) {
	const router = useRouter();
	const [selection, setSelection] = useState<Selection | null>(null);
	const isCreated = tab.id === "created";
	const claimed = useMyClaimedTemplates({
		userId,
		source: tab.source,
		enabled: !isCreated,
	});
	const created = useInfiniteTemplates({ scope: "mine", enabled: isCreated });
	const query = isCreated ? created : claimed;

	const templates = useMemo(() => {
		if (isCreated) {
			return (created.data?.pages.flatMap((page) => page.items) ?? []).map(
				toCreatedTemplateCard,
			);
		}
		// Cursor pages can repeat a template after re-claims; show each once.
		const seen = new Set<string>();
		return (claimed.data?.pages.flatMap((page) => page.items) ?? [])
			.filter((item) => {
				if (seen.has(item.template_id)) return false;
				seen.add(item.template_id);
				return true;
			})
			.map(toClaimedTemplateCard);
	}, [isCreated, created.data, claimed.data]);
	const selected = templates.find((item) => item.id === selection?.id);
	const closeSelection = useCallback(() => setSelection(null), []);

	if (query.isPending) return <LibrarySkeleton />;

	if (query.isError && !query.data) {
		return (
			<div role='alert' className='flex flex-col items-center gap-3 py-16 text-center'>
				<p className='text-sm text-muted-foreground'>
					Unable to load your library.
				</p>
				<Button variant='outline' size='sm' onClick={() => query.refetch()}>
					<RotateCw className='size-3.5' />
					Try again
				</Button>
			</div>
		);
	}

	if (templates.length === 0 && tab.empty) {
		return (
			<div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center'>
				<span className='flex size-11 items-center justify-center rounded-xl bg-muted'>
					<Library className='size-5 text-muted-foreground' />
				</span>
				<div className='flex flex-col gap-1'>
					<p className='text-sm font-medium'>{tab.empty.title}</p>
					<p className='max-w-sm text-sm text-muted-foreground'>
						{tab.empty.text}
					</p>
				</div>
				<Button asChild size='sm' variant='outline'>
					<Link href={tab.empty.href}>{tab.empty.cta}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6'>
			<div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{templates.map((template) => (
					<ClaimedTemplateCard
						key={template.id}
						template={template}
						onDetails={() =>
							isCreated
								? router.push(`/creator/templates/${template.id}`)
								: template.canNavigateToPublicDetail
									? router.push(`/dashboard/templates/${template.id}`)
									: setSelection({ id: template.id, action: "details" })
						}
						onUse={() => setSelection({ id: template.id, action: "use" })}
					/>
				))}
			</div>

			{query.isError && (
				<p role='alert' className='text-center text-sm text-destructive'>
					Unable to load more templates.
				</p>
			)}
			{query.hasNextPage && (
				<Button
					variant='outline'
					size='sm'
					className='self-center'
					disabled={query.isFetchingNextPage}
					onClick={() => query.fetchNextPage()}
				>
					{query.isFetchingNextPage ? "Loading..." : "Load more"}
				</Button>
			)}

			{selected?.allowDetails && selection?.action === "details" && (
				<TemplatePreviewDialog
					template={selected}
					open
					onOpenChange={(open) => !open && closeSelection()}
					onUse={
						selected.allowUseAttempt
							? () => setSelection({ id: selected.id, action: "use" })
							: undefined
					}
				/>
			)}
			{selected?.allowUseAttempt && selection?.action === "use" && (
				<LibraryUseTemplateDialog
					template={selected}
					userId={userId}
					onClose={closeSelection}
				/>
			)}
		</div>
	);
}

function LibrarySkeleton() {
	return (
		<div
			aria-label='Loading your library'
			className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
		>
			{Array.from({ length: 3 }, (_, index) => (
				<Skeleton key={index} className='h-72 w-full rounded-2xl' />
			))}
		</div>
	);
}
