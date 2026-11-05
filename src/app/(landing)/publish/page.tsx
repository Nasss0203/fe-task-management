import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRight,
	Check,
	FileText,
	Share2,
	UploadCloud,
} from "lucide-react";
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
		<div className='relative overflow-hidden py-12 sm:py-20 space-y-24 sm:space-y-32'>
			{/* Subtle architectural grid backdrop in hero */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:32px_32px] text-foreground opacity-[0.035] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]'
			/>

			{/* Page Hero */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6'>
				<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs'>
					<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
					<span>Instant Web Publishing</span>
				</div>

				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]'>
					Turn your pages into{" "}
					<span className='text-muted-foreground font-semibold'>
						beautiful websites.
					</span>
				</h1>

				<p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
					Publish your workspace pages and share them with anyone — no deployment, DNS configuration, or hosting setup required.
				</p>

				{/* CTA */}
				<div className='pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5'>
					<Link href='/sign-up'>
						<Button
							size='lg'
							className='h-10 w-full sm:w-auto rounded-lg bg-[#5e6ad2] hover:bg-[#4e5ac0] text-white px-[18px] text-sm font-medium border-none'
						>
							Start publishing
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</Link>
					<Link href='#flow'>
						<Button
							size='lg'
							variant='outline'
							className='h-10 w-full sm:w-auto rounded-lg border-border/80 bg-card px-[18px] text-sm font-medium text-foreground hover:bg-muted/60'
						>
							See how it works
						</Button>
					</Link>
				</div>
			</section>

			{/* 3-Step Publish Flow with Double-Bezel Cards */}
			<section id='flow' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='text-center max-w-xl mx-auto mb-12 space-y-2.5'>
					<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
						<span>3-Step Workflow</span>
					</div>
					<h2 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
						How Web Publishing Works
					</h2>
					<p className='text-sm text-muted-foreground'>
						From internal scratchpad to live public website in three simple steps.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'>
					{[
						{
							step: "01",
							icon: FileText,
							title: "Create a page",
							desc: "Write documentation, product guides, or team policies using rich text blocks, code, and checklists.",
						},
						{
							step: "02",
							icon: UploadCloud,
							title: "Click Publish",
							desc: "Open page publication settings, set your preferred subdomain, and choose whether to include subpages.",
						},
						{
							step: "03",
							icon: Share2,
							title: "Share URL",
							desc: "Your site is instantly accessible online with fast global caching and a clean, responsive layout.",
						},
					].map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.step}
								className='group rounded-2xl border border-border/80 bg-muted/30 p-1.5 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/50'
							>
								<div className='flex h-full flex-col justify-between rounded-xl border border-border/70 bg-card p-6 shadow-2xs space-y-4'>
									<div className='flex items-center justify-between'>
										<div className='flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground transition-colors duration-200 group-hover:border-[#5e6ad2] group-hover:bg-[#5e6ad2] group-hover:text-white'>
											<Icon className='h-5 w-5' />
										</div>
										<span className='rounded border border-[#5e6ad2]/25 bg-[#eeeffc] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#5e6ad2] dark:bg-indigo-500/15 dark:text-indigo-300'>
											STEP {item.step}
										</span>
									</div>
									<div className='space-y-1.5'>
										<h3 className='text-lg font-bold tracking-tight text-foreground'>
											{item.title}
										</h3>
										<p className='text-xs text-muted-foreground leading-relaxed'>
											{item.desc}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Browser Preview Mockup */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='text-center max-w-xl mx-auto mb-8'>
					<h3 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
						What Your Readers See
					</h3>
					<p className='text-xs text-muted-foreground mt-1'>
						Fast, elegant, distraction-free reading on desktop, tablet, and mobile.
					</p>
				</div>

				<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
					<BrowserMockup
						url='dev-handbook.taskmanly.app'
						title='Published Workspace Site'
					>
						<div className='p-6 sm:p-12 bg-background text-foreground space-y-8 min-h-[360px]'>
							{/* Site Header */}
							<div className='flex items-center justify-between pb-6 border-b border-border/60'>
								<div className='flex items-center gap-3'>
									<div className='h-9 w-9 rounded-lg bg-[#5e6ad2] text-white font-bold flex items-center justify-center text-xs'>
										TM
									</div>
									<div>
										<div className='text-sm font-bold text-foreground'>Acme Engineering Handbook</div>
										<div className='text-xs font-mono text-muted-foreground'>https://dev-handbook.taskmanly.app</div>
									</div>
								</div>

								<div className='flex items-center gap-2'>
									<span className='inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-medium text-foreground'>
										<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
										Published
									</span>
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
								<div className='rounded-lg border border-[#5e6ad2]/25 bg-[#eeeffc]/60 dark:bg-indigo-500/10 p-4 text-xs text-[#434cb8] dark:text-indigo-300'>
									<span className='font-semibold'>Note for new engineers:</span> Make sure your local environment has Node.js 20+ and Docker installed before proceeding.
								</div>

								{/* Child pages list */}
								<div className='pt-2 space-y-2'>
									<div className='text-xs font-semibold text-foreground'>Included Child Pages:</div>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs'>
										<div className='flex items-center gap-2.5 p-3 rounded-lg border border-border/80 bg-card hover:border-foreground/25 transition-colors'>
											<FileText className='h-4 w-4 text-[#5e6ad2]' />
											<span className='font-medium text-foreground'>Git Branching & PR Conventions</span>
										</div>
										<div className='flex items-center gap-2.5 p-3 rounded-lg border border-border/80 bg-card hover:border-foreground/25 transition-colors'>
											<FileText className='h-4 w-4 text-[#5e6ad2]' />
											<span className='font-medium text-foreground'>PostgreSQL Migrations Guide</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</BrowserMockup>
				</div>
			</section>

			{/* Real Capabilities Section (Double-Bezel Frame) */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
					<div className='rounded-xl border border-border/80 bg-card p-8 sm:p-10 shadow-2xs space-y-8'>
						<div className='space-y-2'>
							<div className='inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								<span>Edge Infrastructure</span>
							</div>
							<h2 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
								Publishing Capabilities
							</h2>
							<p className='text-sm text-muted-foreground'>
								Built directly on Taskmanly&apos;s high-performance edge rendering proxy.
							</p>
						</div>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1'>
							{[
								{
									title: "Publish Root Page",
									desc: "Turn any root workspace document into a standalone web page with custom title and styling.",
								},
								{
									title: "Include Descendants",
									desc: "Optionally include all nested sub-pages and child links automatically as part of the public site.",
								},
								{
									title: "Custom Subdomain & URL",
									desc: "Claim a unique public subdomain on Taskmanly (e.g. yourbrand.taskmanly.app) with automatic HTTPS.",
								},
								{
									title: "Share Outside Workspace",
									desc: "Allow external clients, stakeholders, or public users to read your content without needing an account.",
								},
							].map((cap) => (
								<div key={cap.title} className='flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-4'>
									<div className='h-6 w-6 rounded-md border border-border bg-card text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3.5 w-3.5' />
									</div>
									<div>
										<div className='text-sm font-semibold text-foreground'>{cap.title}</div>
										<div className='text-xs text-muted-foreground leading-relaxed mt-1'>
											{cap.desc}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<CtaSection />
		</div>
	);
}
