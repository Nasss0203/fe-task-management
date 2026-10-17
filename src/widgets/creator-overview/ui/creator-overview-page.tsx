"use client";

import { ArrowRight, LayoutTemplate, Plus } from "lucide-react";
import Link from "next/link";

import { useInfiniteTemplates } from "@/entities/template";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { CreatorTemplateTable } from "@/widgets/creator-templates";

const RECENT_LIMIT = 5;

const GUIDE_STEPS = [
	{
		title: "Create from a page",
		description:
			"Open a page in your workspace, click ••• and choose Save as template.",
		action: { label: "Open workspace", href: "/dashboard" },
	},
	{
		title: "Publish a version",
		description:
			"Lock a snapshot so everyone using your template gets a stable copy.",
	},
	{
		title: "List on the marketplace",
		description:
			"Add pricing, categories and a preview, then release it to the public.",
	},
];

export function CreatorOverviewPage() {
	const { user } = useUser();
	// Generated usernames end in "_<timestamp>"; hide that noise in the greeting.
	const name = user?.username?.replace(/_\d{6,}$/, "");

	return (
		<div className='flex flex-col gap-10'>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex min-w-0 flex-col gap-1'>
					<p className='truncate text-sm text-muted-foreground'>
						{name ? `Welcome back, ${name}` : "Welcome back"}
					</p>
					<h1 className='text-2xl font-semibold tracking-tight'>Overview</h1>
					<p className='text-sm text-muted-foreground'>
						Create templates from your pages and share them on the
						marketplace.
					</p>
				</div>
				<Button asChild size='sm' className='w-fit shrink-0'>
					<Link href='/dashboard'>
						<Plus className='size-4' />
						Create from a page
					</Link>
				</Button>
			</header>

			<section
				aria-labelledby='creator-guide-title'
				className='rounded-xl border bg-card'
			>
				<div className='border-b px-5 py-4'>
					<h2 id='creator-guide-title' className='text-sm font-semibold'>
						Get started
					</h2>
					<p className='text-xs text-muted-foreground'>
						From page to marketplace in three steps.
					</p>
				</div>
				<ol className='grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0'>
					{GUIDE_STEPS.map((step, index) => (
						<li key={step.title} className='flex gap-3 p-5'>
							<span className='flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums text-muted-foreground'>
								{index + 1}
							</span>
							<div className='flex min-w-0 flex-col gap-1'>
								<h3 className='text-sm font-medium'>{step.title}</h3>
								<p className='text-sm leading-relaxed text-muted-foreground'>
									{step.description}
								</p>
								{step.action && (
									<Link
										href={step.action.href}
										className='mt-1 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline'
									>
										{step.action.label}
										<ArrowRight className='size-3.5' />
									</Link>
								)}
							</div>
						</li>
					))}
				</ol>
			</section>

			<RecentTemplates />
		</div>
	);
}

function RecentTemplates() {
	const query = useInfiniteTemplates({ scope: "mine", limit: RECENT_LIMIT });
	const templates = query.data?.pages[0]?.items ?? [];

	return (
		<section
			aria-labelledby='creator-recent-title'
			className='flex flex-col gap-3'
		>
			<div className='flex items-center justify-between'>
				<h2 id='creator-recent-title' className='text-base font-semibold'>
					Recent templates
				</h2>
				{templates.length > 0 && (
					<Link
						href='/creator/templates'
						className='inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
					>
						View all
						<ArrowRight className='size-3.5' />
					</Link>
				)}
			</div>

			<CreatorTemplateTable
				templates={templates}
				isPending={query.isPending}
				isError={query.isError}
				onRetry={() => query.refetch()}
				empty={
					<div className='flex flex-col items-center gap-3 px-6 py-12 text-center'>
						<span className='flex size-10 items-center justify-center rounded-lg bg-muted'>
							<LayoutTemplate className='size-5 text-muted-foreground' />
						</span>
						<div className='flex flex-col gap-1'>
							<p className='text-sm font-medium'>No templates yet</p>
							<p className='max-w-sm text-sm text-muted-foreground'>
								Save one of your pages as a template and it will show up
								here.
							</p>
						</div>
					</div>
				}
			/>
		</section>
	);
}
