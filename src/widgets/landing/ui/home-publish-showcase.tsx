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
					<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs mb-4'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
						Zero-Configuration Web Publishing
					</div>
					<h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground'>
						Turn your pages into websites
					</h2>
					<p className='mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed'>
						Publish your internal documentation, product guides, or engineering wikis to the live web in seconds.
					</p>
				</div>

				{/* 3-Step Flow Diagram (Architectural double-bezel cards with monospace index) */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative'>
					{/* Step 1 */}
					<div className='rounded-2xl border border-border/80 bg-muted/30 p-1.5'>
						<div className='relative h-full rounded-xl border border-border/70 bg-card p-6 shadow-2xs flex flex-col'>
							<div className='flex items-center justify-between mb-4'>
								<div className='h-10 w-10 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
									<FileText className='h-4 w-4' />
								</div>
								<span className='font-mono text-xs font-semibold text-[#5e6ad2]'>01</span>
							</div>
							<h3 className='text-base font-bold text-foreground'>Create a page</h3>
							<p className='mt-1.5 text-xs text-muted-foreground leading-relaxed'>
								Draft your docs or handbook with blocks, checklists, and code snippets.
							</p>
						</div>
					</div>

					{/* Step 2 */}
					<div className='rounded-2xl border border-border/80 bg-muted/30 p-1.5'>
						<div className='relative h-full rounded-xl border border-border/70 bg-card p-6 shadow-2xs flex flex-col'>
							<div className='flex items-center justify-between mb-4'>
								<div className='h-10 w-10 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
									<UploadCloud className='h-4 w-4' />
								</div>
								<span className='font-mono text-xs font-semibold text-[#5e6ad2]'>02</span>
							</div>
							<h3 className='text-base font-bold text-foreground'>Click Publish</h3>
							<p className='mt-1.5 text-xs text-muted-foreground leading-relaxed'>
								Toggle publish status and optionally include all child pages.
							</p>
						</div>
					</div>

					{/* Step 3 */}
					<div className='rounded-2xl border border-border/80 bg-muted/30 p-1.5'>
						<div className='relative h-full rounded-xl border border-border/70 bg-card p-6 shadow-2xs flex flex-col'>
							<div className='flex items-center justify-between mb-4'>
								<div className='h-10 w-10 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
									<Share2 className='h-4 w-4' />
								</div>
								<span className='font-mono text-xs font-semibold text-[#5e6ad2]'>03</span>
							</div>
							<h3 className='text-base font-bold text-foreground'>Share public link</h3>
							<p className='mt-1.5 text-xs text-muted-foreground leading-relaxed'>
								Share your live subdomain URL with teammates or the global public.
							</p>
						</div>
					</div>
				</div>

				{/* Live Browser Preview Mockup (Double-bezel frame) */}
				<div className='mx-auto max-w-4xl rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xs'>
					<BrowserMockup
						url='acme-engineering.taskmanly.app/guides/onboarding'
						title='Public Web View'
					>
						<div className='p-6 sm:p-10 bg-background text-foreground min-h-[300px] space-y-6'>
							{/* Public Page Header */}
							<div className='flex items-center justify-between pb-6 border-b border-border/60'>
								<div className='flex items-center gap-2.5'>
									<div className='h-8 w-8 rounded-lg bg-[#5e6ad2] text-white flex items-center justify-center font-bold text-xs'>
										A
									</div>
									<div>
										<div className='text-xs font-bold text-foreground'>Acme Engineering Guide</div>
										<div className='text-[10px] text-muted-foreground'>Published via Taskmanly Web</div>
									</div>
								</div>

								<div className='flex items-center gap-2'>
									<Badge variant='outline' className='text-[10px] text-foreground border-border bg-muted/50 gap-1.5'>
										<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
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
										<div className='flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-muted/25 hover:border-[#5e6ad2]/40 transition-colors cursor-pointer'>
											<FileText className='h-3.5 w-3.5 text-[#5e6ad2]' />
											<span className='font-medium text-foreground'>01. Local Development Setup</span>
										</div>
										<div className='flex items-center gap-2 p-2.5 rounded-lg border border-border/70 bg-muted/25 hover:border-[#5e6ad2]/40 transition-colors cursor-pointer'>
											<FileText className='h-3.5 w-3.5 text-[#5e6ad2]' />
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
							<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
							<span>Publish root page</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
							<span>Include descendants</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
							<span>Public subdomain / URL</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
							<span>Instant republish updates</span>
						</div>
					</div>

					<Link href='/publish'>
						<Button variant='outline' className='rounded-lg group'>
							Discover Web Publishing
							<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
