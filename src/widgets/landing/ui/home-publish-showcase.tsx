import {
	ArrowRight,
	Check,
	FileText,
	Globe,
	Share2,
	UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { BrowserMockup } from "./browser-mockup";

export function HomePublishShowcase() {
	return (
		<section className='py-20 sm:py-28 relative bg-muted/15 border-t border-border/60'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='mx-auto max-w-2xl text-center mb-16'>
					<div className='inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4'>
						<Globe className='h-3.5 w-3.5' />
						Zero-Configuration Web Publishing
					</div>
					<h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground'>
						Turn your pages into websites
					</h2>
					<p className='mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed'>
						Publish your internal documentation, product guides, or engineering wikis to the live web in seconds.
					</p>
				</div>

				{/* 3-Step Flow Diagram */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative'>
					{/* Step 1 */}
					<div className='relative rounded-2xl border border-border/80 bg-card p-6 shadow-xs text-center flex flex-col items-center'>
						<div className='h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm mb-4 ring-1 ring-blue-500/20'>
							<FileText className='h-5 w-5' />
						</div>
						<div className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
							Step 1
						</div>
						<h3 className='text-base font-bold text-foreground'>Create a page</h3>
						<p className='mt-2 text-xs text-muted-foreground leading-relaxed'>
							Draft your docs or handbook with blocks, checklists, and code snippets.
						</p>
					</div>

					{/* Step 2 */}
					<div className='relative rounded-2xl border border-border/80 bg-card p-6 shadow-xs text-center flex flex-col items-center'>
						<div className='h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4 ring-1 ring-indigo-500/20'>
							<UploadCloud className='h-5 w-5' />
						</div>
						<div className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
							Step 2
						</div>
						<h3 className='text-base font-bold text-foreground'>Click Publish</h3>
						<p className='mt-2 text-xs text-muted-foreground leading-relaxed'>
							Toggle publish status and optionally include all child pages.
						</p>
					</div>

					{/* Step 3 */}
					<div className='relative rounded-2xl border border-border/80 bg-card p-6 shadow-xs text-center flex flex-col items-center'>
						<div className='h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4 ring-1 ring-emerald-500/20'>
							<Share2 className='h-5 w-5' />
						</div>
						<div className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1'>
							Step 3
						</div>
						<h3 className='text-base font-bold text-foreground'>Share public link</h3>
						<p className='mt-2 text-xs text-muted-foreground leading-relaxed'>
							Share your live subdomain URL with teammates or the global public.
						</p>
					</div>
				</div>

				{/* Live Browser Preview Mockup */}
				<div className='mx-auto max-w-4xl'>
					<BrowserMockup
						url='acme-engineering.taskmanly.app/guides/onboarding'
						title='Public Web View'
					>
						<div className='p-6 sm:p-10 bg-background text-foreground min-h-[300px] space-y-6'>
							{/* Public Page Header */}
							<div className='flex items-center justify-between pb-6 border-b border-border/60'>
								<div className='flex items-center gap-2'>
									<div className='h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-500/20'>
										A
									</div>
									<div>
										<div className='text-xs font-bold text-foreground'>Acme Engineering Guide</div>
										<div className='text-[10px] text-muted-foreground'>Published via Taskmanly Web</div>
									</div>
								</div>

								<div className='flex items-center gap-2'>
									<Badge variant='outline' className='text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5'>
										Public Site
									</Badge>
									<span className='text-xs text-muted-foreground hidden sm:inline'>Read-only</span>
								</div>
							</div>

							{/* Document Body */}
							<div className='space-y-4 max-w-2xl'>
								<h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
									Welcome to Engineering at Acme Corp
								</h1>
								<p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
									This documentation is published straight from our Taskmanly workspace. All subpages, diagrams, and code snippets are automatically formatted for the web.
								</p>

								{/* Nested child pages bar */}
								<div className='pt-2'>
									<div className='text-xs font-semibold text-foreground mb-2'>Included Sub-pages:</div>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
										<div className='flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:border-primary/40 cursor-pointer'>
											<FileText className='h-3.5 w-3.5 text-primary' />
											<span className='font-medium text-foreground'>01. Local Development Setup</span>
										</div>
										<div className='flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:border-primary/40 cursor-pointer'>
											<FileText className='h-3.5 w-3.5 text-primary' />
											<span className='font-medium text-foreground'>02. API Authentication Keys</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</BrowserMockup>
				</div>

				{/* Capabilities & CTA */}
				<div className='mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/60 pt-8'>
					<div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground'>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-emerald-500' />
							<span>Publish root page</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-emerald-500' />
							<span>Include descendants</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-emerald-500' />
							<span>Public subdomain / URL</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-emerald-500' />
							<span>Instant republish updates</span>
						</div>
					</div>

					<Link href='/publish'>
						<Button variant='outline' className='rounded-full group'>
							Discover Web Publishing
							<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
