import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRight,
	Check,
	FileText,
	Globe,
	Share2,
	UploadCloud,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { BrowserMockup } from "@/widgets/landing/ui/browser-mockup";
import { CtaSection } from "@/widgets/landing/ui/cta-section";

export const metadata: Metadata = {
	title: "Web Publishing — Turn Pages into Live Websites | Taskmanly",
	description:
		"Publish your Taskmanly workspace pages, engineering documentation, and product handbooks to the live web with custom subdomains in one click.",
};

export default function PublishPage() {
	return (
		<div className='py-12 sm:py-20 space-y-24 sm:space-y-32'>
			{/* Page Hero */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6'>
				<div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
					<Globe className='h-3.5 w-3.5' />
					Instant Web Publishing
				</div>

				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.1]'>
					Turn your pages into{" "}
					<span className='bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent'>
						beautiful websites
					</span>
				</h1>

				<p className='text-base sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed'>
					Publish your workspace pages and share them with anyone — no deployment, DNS configuration, or hosting setup required.
				</p>

				{/* CTA */}
				<div className='pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5'>
					<Link href='/sign-up'>
						<Button
							size='lg'
							className='h-12 w-full sm:w-auto rounded-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white px-8 text-sm font-semibold shadow-md shadow-indigo-600/20 dark:shadow-indigo-950/40'
						>
							Start publishing
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</Link>
					<Link href='#flow'>
						<Button
							size='lg'
							variant='outline'
							className='h-12 w-full sm:w-auto rounded-full border-border bg-surface/80 px-8 text-sm font-medium text-foreground hover:bg-muted/70'
						>
							See how it works
						</Button>
					</Link>
				</div>
			</section>

			{/* 3-Step Publish Flow with Icons & Arrows */}
			<section id='flow' className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='text-center max-w-xl mx-auto mb-14'>
					<h2 className='text-2xl sm:text-3xl font-bold text-foreground'>
						How Web Publishing Works
					</h2>
					<p className='mt-2 text-sm text-muted-foreground'>
						From internal scratchpad to live public website in three simple steps.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative items-center'>
					{/* Step 1 */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col items-center text-center space-y-3 relative'>
						<div className='h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/20'>
							<FileText className='h-6 w-6' />
						</div>
						<div className='text-[10px] font-bold tracking-wider uppercase text-muted-foreground'>
							Step 01
						</div>
						<h3 className='text-lg font-bold text-foreground'>Create a page</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Write documentation, product guides, or team policies using rich text blocks, code, and checklists.
						</p>
					</div>

					{/* Step 2 */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col items-center text-center space-y-3 relative'>
						<div className='h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-500/20'>
							<UploadCloud className='h-6 w-6' />
						</div>
						<div className='text-[10px] font-bold tracking-wider uppercase text-muted-foreground'>
							Step 02
						</div>
						<h3 className='text-lg font-bold text-foreground'>Click Publish</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Open page publication settings, set your preferred subdomain, and choose whether to include subpages.
						</p>
					</div>

					{/* Step 3 */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col items-center text-center space-y-3 relative'>
						<div className='h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20'>
							<Share2 className='h-6 w-6' />
						</div>
						<div className='text-[10px] font-bold tracking-wider uppercase text-muted-foreground'>
							Step 03
						</div>
						<h3 className='text-lg font-bold text-foreground'>Share URL</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Your site is instantly accessible online with fast global caching and a clean, responsive layout.
						</p>
					</div>
				</div>
			</section>

			{/* Browser Preview Mockup */}
			<section className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='text-center max-w-xl mx-auto mb-8'>
					<h3 className='text-xl sm:text-2xl font-bold text-foreground'>
						What Your Readers See
					</h3>
					<p className='text-xs text-muted-foreground mt-1'>
						Fast, elegant, distraction-free reading on desktop, tablet, and mobile.
					</p>
				</div>

				<BrowserMockup
					url='dev-handbook.taskmanly.app'
					title='Published Workspace Site'
				>
					<div className='p-6 sm:p-12 bg-background text-foreground space-y-8 min-h-[360px]'>
						{/* Site Header */}
						<div className='flex items-center justify-between pb-6 border-b border-border/60'>
							<div className='flex items-center gap-3'>
								<div className='h-9 w-9 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs'>
									TM
								</div>
								<div>
									<div className='text-sm font-bold text-foreground'>Acme Engineering Handbook</div>
									<div className='text-xs text-muted-foreground'>https://dev-handbook.taskmanly.app</div>
								</div>
							</div>

							<div className='flex items-center gap-2'>
								<Badge className='text-[10px] bg-emerald-500/10 text-emerald-600 border-none font-medium'>
									Published
								</Badge>
							</div>
						</div>

						{/* Document Body */}
						<div className='space-y-4 max-w-2xl'>
							<h1 className='text-2xl sm:text-4xl font-bold tracking-tight text-foreground'>
								Getting Started with Our Stack
							</h1>

							<p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
								Welcome to the engineering onboarding handbook. This live site contains setup guides, code standards, and API specifications.
							</p>

							{/* Callout */}
							<div className='rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary'>
								<span className='font-semibold'>Note for new engineers:</span> Make sure your local environment has Node.js 20+ and Docker installed before proceeding.
							</div>

							{/* Child pages list */}
							<div className='pt-2 space-y-2'>
								<div className='text-xs font-semibold text-foreground'>Included Child Pages:</div>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
									<div className='flex items-center gap-2 p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors'>
										<FileText className='h-4 w-4 text-primary' />
										<span className='font-medium text-foreground'>Git Branching & PR Conventions</span>
									</div>
									<div className='flex items-center gap-2 p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors'>
										<FileText className='h-4 w-4 text-primary' />
										<span className='font-medium text-foreground'>PostgreSQL Migrations Guide</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</BrowserMockup>
			</section>

			{/* Real Capabilities Section (Strictly matching backend) */}
			<section className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-card p-8 sm:p-10 shadow-xs space-y-8'>
					<div>
						<h2 className='text-2xl sm:text-3xl font-bold text-foreground'>
							Publishing Capabilities
						</h2>
						<p className='mt-2 text-sm text-muted-foreground'>
							Built directly on Taskmanly&apos;s high-performance edge rendering proxy.
						</p>
					</div>

					<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
						<div className='flex items-start gap-3'>
							<div className='h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
								<Check className='h-4 w-4' />
							</div>
							<div>
								<div className='text-sm font-semibold text-foreground'>Publish Root Page</div>
								<div className='text-xs text-muted-foreground leading-relaxed mt-1'>
									Turn any root workspace document into a standalone web page with custom title and styling.
								</div>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<div className='h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
								<Check className='h-4 w-4' />
							</div>
							<div>
								<div className='text-sm font-semibold text-foreground'>Include Descendants</div>
								<div className='text-xs text-muted-foreground leading-relaxed mt-1'>
									Optionally include all nested sub-pages and child links automatically as part of the public site.
								</div>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<div className='h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
								<Check className='h-4 w-4' />
							</div>
							<div>
								<div className='text-sm font-semibold text-foreground'>Custom Subdomain & URL</div>
								<div className='text-xs text-muted-foreground leading-relaxed mt-1'>
									Claim a unique public subdomain on Taskmanly (e.g. yourbrand.taskmanly.app) with automatic HTTPS.
								</div>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<div className='h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
								<Check className='h-4 w-4' />
							</div>
							<div>
								<div className='text-sm font-semibold text-foreground'>Share Outside Workspace</div>
								<div className='text-xs text-muted-foreground leading-relaxed mt-1'>
									Allow external clients, stakeholders, or public users to read your content without needing an account.
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<CtaSection />
		</div>
	);
}
