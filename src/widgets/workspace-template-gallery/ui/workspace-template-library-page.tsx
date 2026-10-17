"use client";

import { Library, RotateCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useMyClaimedTemplates } from "@/entities/template";
import { useUser } from "@/features/auth";
import { UseTemplateDialog } from "@/features/template-use";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { toClaimedTemplateCard } from "../model/claimed-template-card.model";
import { ClaimedTemplateCard } from "./claimed-template-card";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { WorkspaceTemplatesHeader } from "./workspace-templates-header";

type Selection = { id: string; action: "details" | "use" };

/** Templates the user claimed from the marketplace, ready to use again. */
export function WorkspaceTemplateLibraryPage() {
	const router = useRouter();
	const { user } = useUser();
	const [selection, setSelection] = useState<Selection | null>(null);
	const query = useMyClaimedTemplates({ userId: user?.id });

	const templates = useMemo(() => {
		// Cursor pages can repeat a template after re-claims; show each once.
		const seen = new Set<string>();
		return (query.data?.pages.flatMap((page) => page.items) ?? [])
			.filter((item) => {
				if (seen.has(item.template_id)) return false;
				seen.add(item.template_id);
				return true;
			})
			.map(toClaimedTemplateCard);
	}, [query.data]);
	const selected = templates.find((item) => item.id === selection?.id);

	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8'>
			<WorkspaceTemplatesHeader description='Templates you have claimed. Use them again in any workspace.' />

			{query.isPending || !user ? (
				<div
					aria-label='Loading your library'
					className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
				>
					{Array.from({ length: 3 }, (_, index) => (
						<Skeleton key={index} className='h-72 w-full rounded-2xl' />
					))}
				</div>
			) : query.isError && !query.data ? (
				<div role='alert' className='flex flex-col items-center gap-3 py-16 text-center'>
					<p className='text-sm text-muted-foreground'>
						Unable to load your library.
					</p>
					<Button variant='outline' size='sm' onClick={() => query.refetch()}>
						<RotateCw className='size-3.5' />
						Try again
					</Button>
				</div>
			) : templates.length === 0 ? (
				<div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center'>
					<span className='flex size-11 items-center justify-center rounded-xl bg-muted'>
						<Library className='size-5 text-muted-foreground' />
					</span>
					<div className='flex flex-col gap-1'>
						<p className='text-sm font-medium'>Your library is empty</p>
						<p className='max-w-sm text-sm text-muted-foreground'>
							Templates you get from the marketplace show up here.
						</p>
					</div>
					<Button asChild size='sm' variant='outline'>
						<Link href='/dashboard/templates'>Browse the marketplace</Link>
					</Button>
				</div>
			) : (
				<div className='flex flex-col gap-6'>
					<div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{templates.map((template) => (
							<ClaimedTemplateCard
								key={template.id}
								template={template}
								onDetails={() =>
									template.canNavigateToPublicDetail
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
				</div>
			)}

			{selected?.allowDetails && selection?.action === "details" && (
				<TemplatePreviewDialog
					template={selected}
					open
					onOpenChange={(open) => !open && setSelection(null)}
					onUse={
						selected.allowUseAttempt && selected.version
							? () => setSelection({ id: selected.id, action: "use" })
							: undefined
					}
				/>
			)}
			{selected?.allowUseAttempt && selected.version && selection?.action === "use" && (
				<UseTemplateDialog
					template={selected}
					version={selected.version}
					open
					onOpenChange={(open) => !open && setSelection(null)}
				/>
			)}
		</div>
	);
}
