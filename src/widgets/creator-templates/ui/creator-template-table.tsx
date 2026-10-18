"use client";

import { formatDistanceToNow } from "date-fns";
import { RotateCw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { PageTemplate } from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import {
	getTemplateDisplayStatus,
	TemplateIcon,
	TemplateStatusLabel,
	TemplateVisibilityLabel,
} from "./template-meta";
import { TemplateRowActions } from "./template-row-actions";

const ROW_GRID =
	"grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 md:grid-cols-[minmax(0,1fr)_112px_64px_104px_120px]";

interface CreatorTemplateTableProps {
	templates: PageTemplate[];
	isPending: boolean;
	isError: boolean;
	onRetry: () => void;
	empty: ReactNode;
	skeletonRows?: number;
}

export function CreatorTemplateTable({
	templates,
	isPending,
	isError,
	onRetry,
	empty,
	skeletonRows = 3,
}: CreatorTemplateTableProps) {
	const showHeader = isPending || (!isError && templates.length > 0);

	return (
		<div className='overflow-hidden rounded-xl border bg-card'>
			{showHeader && (
				<div className='hidden items-center border-b bg-muted/40 pr-2 text-xs font-medium text-muted-foreground md:flex'>
					<div className={cn(ROW_GRID, "flex-1 px-4 py-2")}>
						<span>Name</span>
						<span>Visibility</span>
						<span>Version</span>
						<span>Status</span>
						<span className='text-right'>Last updated</span>
					</div>
					<span className='w-16 text-center'>Actions</span>
				</div>
			)}

			{isPending ? (
				<ul aria-label='Loading templates' className='divide-y'>
					{Array.from({ length: skeletonRows }, (_, index) => (
						<li key={index} className='flex items-center gap-3 px-4 py-3'>
							<Skeleton className='size-8 rounded-md' />
							<Skeleton className='h-4 w-1/3' />
						</li>
					))}
				</ul>
			) : isError ? (
				<div className='flex flex-col items-center gap-3 px-6 py-10 text-center'>
					<p className='text-sm text-muted-foreground'>
						We couldn&apos;t load your templates.
					</p>
					<Button variant='outline' size='sm' onClick={onRetry}>
						<RotateCw className='size-3.5' />
						Try again
					</Button>
				</div>
			) : templates.length === 0 ? (
				empty
			) : (
				<ul className='divide-y'>
					{templates.map((template) => (
						<CreatorTemplateRow key={template.id} template={template} />
					))}
				</ul>
			)}
		</div>
	);
}

function CreatorTemplateRow({ template }: { template: PageTemplate }) {
	const version = template.version
		? `v${template.version.version_number}`
		: "—";
	const updated = formatDistanceToNow(new Date(template.updated_at), {
		addSuffix: true,
	});

	return (
		<li className='flex items-center pr-2 transition-colors hover:bg-muted/50'>
			<Link
				href={`/creator/templates/${template.id}`}
				className={cn(
					ROW_GRID,
					"min-w-0 flex-1 px-4 py-3 focus-visible:bg-muted/50 focus-visible:outline-none",
				)}
			>
				<div className='flex min-w-0 items-center gap-3'>
					<TemplateIcon template={template} />
					<div className='min-w-0'>
						<p className='truncate text-sm font-medium'>{template.name}</p>
						<p className='truncate text-xs text-muted-foreground md:hidden'>
							{version} · Updated {updated}
						</p>
						{template.description && (
							<p className='hidden truncate text-xs text-muted-foreground md:block'>
								{template.description}
							</p>
						)}
					</div>
				</div>

				<TemplateVisibilityLabel
					visibility={template.visibility}
					className='hidden md:inline-flex'
				/>
				<span className='hidden text-sm tabular-nums text-muted-foreground md:block'>
					{version}
				</span>
				<TemplateStatusLabel
					status={getTemplateDisplayStatus(
						template.status,
						template.version?.status === "PUBLISHED",
					)}
					className='text-xs md:text-sm'
				/>
				<span className='hidden text-right text-sm text-muted-foreground md:block'>
					{updated}
				</span>
			</Link>
			<div className='flex w-16 shrink-0 justify-center'>
				<TemplateRowActions template={template} />
			</div>
		</li>
	);
}
