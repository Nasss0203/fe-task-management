import type { Metadata } from "next";
import Link from "next/link";
import {
	Check,
	CheckCircle2,
	Database,
	ExternalLink,
	FileText,
	Globe,
	LayoutTemplate,
	Sparkles,
	Users,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CtaSection } from "@/widgets/landing/ui/cta-section";
import TemplatePreview from "@/widgets/landing/templates/ui/template-preview";

export const metadata: Metadata = {
	title: "Features — Taskmanly Workspace Capabilities",
	description:
		"Explore Taskmanly's full suite of productivity tools: Pages & Notes, Database Views, Teamspaces, Sharing & Permissions, Templates, Web Publishing, and AI Copilot.",
};

export default function FeaturesPage() {
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
					<span>Product Capabilities</span>
				</div>

				<h1 className='text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.08]'>
					Powerful features for{" "}
					<span className='text-muted-foreground font-semibold'>
						modern teams.
					</span>
				</h1>

				<p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
					Discover how Taskmanly unites rich documentation, relational data views, teamspaces, web publishing, and contextual AI into one cohesive workspace.
				</p>

				{/* Quick jump anchor bar */}
				<div className='flex flex-wrap items-center justify-center gap-2 pt-3'>
					{[
						{ label: "Pages & Notes", href: "#pages-notes" },
						{ label: "Databases & Views", href: "#database-views" },
						{ label: "Teamspaces & Roles", href: "#team-collaboration" },
						{ label: "Starter Templates", href: "#templates" },
						{ label: "Web Publishing", href: "#publish-to-web" },
						{ label: "AI Assistant", href: "#ai-assistant" },
					].map((item) => (
						<a
							key={item.label}
							href={item.href}
							className='inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg border border-border/80 bg-card hover:border-foreground/25 hover:bg-muted/50 font-medium text-muted-foreground hover:text-foreground transition-colors shadow-2xs'
						>
							<span className='h-1 w-1 rounded-full bg-[#5e6ad2]/70' />
							{item.label}
						</a>
					))}
				</div>
			</section>

			{/* 1. Pages & Notes (Text Left | UI Right) */}
			<section id='pages-notes' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					<div className='space-y-6'>
						<div className='flex items-center gap-2.5'>
							<div className='h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
								<FileText className='h-4 w-4' />
							</div>
							<span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								Core Editor
							</span>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Pages & Notes
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Create rich documents that scale from quick personal meeting notes to multi-tiered company engineering wikis with block-level versatility.
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Block-based editing with markdown shortcuts and rich formatting",
								"Infinite nested page hierarchy for organized team knowledge",
								"Code blocks with multi-language syntax highlighting",
								"Comments and discussions on pages and blocks",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-md border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/sign-up'>
								<Button className='rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium'>
									Start writing free
								</Button>
							</Link>
						</div>
					</div>

					{/* Double-Bezel Mockup */}
					<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
						<div className='rounded-xl border border-border/80 bg-card p-6 shadow-2xs'>
							<div className='flex items-center justify-between pb-4 border-b border-border/60 text-xs text-muted-foreground'>
								<div className='flex items-center gap-2'>
									<FileText className='h-4 w-4 text-muted-foreground' />
									<span className='font-semibold text-foreground'>Engineering Wiki / Architecture</span>
								</div>
								<span className='rounded border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground'>
									v2.4 updated
								</span>
							</div>
							<div className='mt-5 space-y-3.5 text-xs'>
								<div className='font-bold text-foreground text-base tracking-tight'>
									Payment Gateway Integration Spec
								</div>
								<p className='text-muted-foreground leading-relaxed'>
									Our architecture uses asynchronous webhooks to process payments with guaranteed idempotency keys.
								</p>
								<div className='rounded-lg bg-muted/50 p-3 font-mono text-[11px] text-foreground border border-border/70'>
									<code>POST /api/v1/payments/verify-signature</code>
								</div>
								<div className='space-y-2 pt-1'>
									<div className='flex items-center gap-2 text-foreground font-medium'>
										<CheckCircle2 className='h-4 w-4 text-[#5e6ad2]' />
										<span>Validate HMAC SHA256 header signature hash</span>
									</div>
									<div className='flex items-center gap-2 text-foreground font-medium'>
										<CheckCircle2 className='h-4 w-4 text-[#5e6ad2]' />
										<span>Store incoming payload in idempotency audit log</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 2. Database & Views (UI Left | Text Right) */}
			<section id='database-views' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Double-Bezel Mockup */}
					<div className='order-2 lg:order-1 rounded-2xl border border-border/80 bg-muted/35 p-2'>
						<div className='rounded-xl border border-border/80 bg-card p-6 shadow-2xs'>
							<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
								<div className='flex items-center gap-2 font-semibold text-foreground'>
									<Database className='h-4 w-4 text-muted-foreground' />
									Workspace Database Views
								</div>
								<Badge variant='outline' className='text-[10px] font-mono'>4 Views</Badge>
							</div>

							<div className='mt-4 overflow-x-auto text-xs'>
								<table className='w-full text-left border-collapse'>
									<thead>
										<tr className='text-muted-foreground border-b border-border/60 text-[11px]'>
											<th className='py-2 px-1 font-medium'>Feature Spec</th>
											<th className='py-2 px-1 font-medium'>Status</th>
											<th className='py-2 px-1 font-medium'>Owner</th>
											<th className='py-2 px-1 font-medium'>Priority</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-border/40 text-foreground'>
										<tr>
											<td className='py-2.5 px-1 font-medium'>Workspace &amp; Page Permissions</td>
											<td className='py-2.5 px-1'>
												<span className='inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'>
													<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
													Done
												</span>
											</td>
											<td className='py-2.5 px-1 text-muted-foreground'>Alex</td>
											<td className='py-2.5 px-1 text-muted-foreground font-medium'>High</td>
										</tr>
										<tr>
											<td className='py-2.5 px-1 font-medium'>Subdomain Web Routing</td>
											<td className='py-2.5 px-1'>
												<span className='inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-[#eeeffc] text-[#434cb8] dark:bg-indigo-500/15 dark:text-indigo-300'>
													<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
													Active
												</span>
											</td>
											<td className='py-2.5 px-1 text-muted-foreground'>Nam</td>
											<td className='py-2.5 px-1 text-muted-foreground font-medium'>Normal</td>
										</tr>
										<tr>
											<td className='py-2.5 px-1 font-medium'>Formula Fields &amp; Aggregations</td>
											<td className='py-2.5 px-1'>
												<span className='inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300'>
													<span className='h-1.5 w-1.5 rounded-full bg-amber-500' />
													Review
												</span>
											</td>
											<td className='py-2.5 px-1 text-muted-foreground'>Sara</td>
											<td className='py-2.5 px-1 text-muted-foreground font-medium'>Urgent</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					{/* Text */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='flex items-center gap-2.5'>
							<div className='h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
								<Database className='h-4 w-4' />
							</div>
							<span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								Structured Data
							</span>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Database & Custom Views
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Structure business information with customizable properties, dynamic filters, and multi-view switches (Table, Board, List, and Calendar).
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Rich property types: Status, Select, Date, Multi-select, Number",
								"Seamless view toggles: Table, Board, List, and Calendar",
								"Multi-criteria sorting and nested filter groups",
								"Relational links between workspace pages and database items",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-md border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/sign-up'>
								<Button className='rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium'>
									Build a database
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* 3. Team Collaboration & Permissions (Text Left | UI Right) */}
			<section id='team-collaboration' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					<div className='space-y-6'>
						<div className='flex items-center gap-2.5'>
							<div className='h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
								<Users className='h-4 w-4' />
							</div>
							<span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								Workspace & Access
							</span>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Team Collaboration & Permissions
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Give departments their own Teamspaces while keeping sensitive documents secure with owner, member and guest roles, and page access from view to full access.
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Squad Teamspaces for Engineering, Product, Marketing, and Ops",
								"Workspace roles: owner, member and guest; page access from view to full access",
								"Private personal drafts alongside shared organizational spaces",
								"Instant workspace invite links and email invitations",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-md border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/sign-up'>
								<Button className='rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium'>
									Invite your team
								</Button>
							</Link>
						</div>
					</div>

					{/* Double-Bezel Mockup */}
					<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
						<div className='rounded-xl border border-border/80 bg-card p-6 shadow-2xs'>
							<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
								<span className='font-bold text-foreground'>Workspace Access Control</span>
								<Badge variant='outline' className='text-[10px]'>People</Badge>
							</div>
							<div className='mt-4 space-y-2.5 text-xs'>
								<div className='flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20'>
									<div>
										<div className='font-semibold text-foreground'>Owner</div>
										<div className='text-[11px] text-muted-foreground'>Full billing and member administration</div>
									</div>
									<span className='rounded border border-[#5e6ad2]/25 bg-[#eeeffc] px-2 py-0.5 text-[10px] font-semibold text-[#434cb8] dark:bg-indigo-500/15 dark:text-indigo-300'>
										Owner
									</span>
								</div>
								<div className='flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20'>
									<div>
										<div className='font-semibold text-foreground'>Member</div>
										<div className='text-[11px] text-muted-foreground'>Can create pages, edit docs, and update records</div>
									</div>
									<span className='rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground'>
										Member
									</span>
								</div>
								<div className='flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/20'>
									<div>
										<div className='font-semibold text-foreground'>Guest</div>
										<div className='text-[11px] text-muted-foreground'>Can open only the pages shared with them</div>
									</div>
									<span className='rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
										Guest
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 4. Starter Templates (UI Left | Text Right) */}
			<section id='templates' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Double-Bezel Mockup */}
					<div className='order-2 lg:order-1 rounded-2xl border border-border/80 bg-muted/35 p-2'>
						<div className='rounded-xl border border-border/80 bg-card p-5 shadow-2xs'>
							<div className='h-48 w-full rounded-lg overflow-hidden border border-border/60 bg-muted/30 mb-3.5'>
								<TemplatePreview variant='checklist' />
							</div>
							<div className='flex items-center justify-between gap-4 pt-1'>
								<div>
									<div className='text-xs font-bold text-foreground'>Company Wiki & Documentation Template</div>
									<div className='text-[11px] text-muted-foreground mt-0.5'>Includes handbook, onboarding checklists, and team directory</div>
								</div>
								<Link href='/templates/tpl-company-wiki'>
									<Button size='sm' variant='outline' className='h-8 text-xs font-medium shrink-0'>
										Preview
									</Button>
								</Link>
							</div>
						</div>
					</div>

					{/* Text */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='flex items-center gap-2.5'>
							<div className='h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
								<LayoutTemplate className='h-4 w-4' />
							</div>
							<span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								Starter Templates
							</span>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Pre-Built Workspace Templates
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Save hours of setup. Jumpstart your workspace with battle-tested frameworks for Engineering, Product Specs, Meeting Notes, and Knowledge Bases.
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Curated templates across categories for fast adoption",
								"Complete with sample data, tags, and pre-configured database views",
								"One-click clone directly into your active workspace",
								"Fully customizable after adding to your account",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-md border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/templates'>
								<Button className='rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium'>
									Browse template gallery
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* 5. Publish to Web (Text Left | UI Right) */}
			<section id='publish-to-web' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					<div className='space-y-6'>
						<div className='flex items-center gap-2.5'>
							<div className='h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
								<Globe className='h-4 w-4' />
							</div>
							<span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								Web Publishing
							</span>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Publish to Web
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Transform any document or entire documentation trees into blazing-fast public websites with custom Taskmanly subdomains in one click.
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Publish root page and optionally all nested subpages",
								"Custom public subdomains on the Taskmanly network",
								"Share public guides, portfolios, or RFCs with anyone",
								"Instant live updates whenever you republish changes",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-md border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/publish'>
								<Button className='rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium'>
									Learn more about publishing
								</Button>
							</Link>
						</div>
					</div>

					{/* Double-Bezel Mockup */}
					<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
						<div className='rounded-xl border border-border/80 bg-card p-6 shadow-2xs'>
							<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
								<span className='font-bold text-foreground'>Live Public Site Preview</span>
								<span className='inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-medium text-foreground'>
									<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
									Online
								</span>
							</div>
							<div className='mt-4 space-y-3 text-xs'>
								<div className='p-2.5 rounded-lg border border-border/70 bg-muted/30 font-mono text-[11px] text-foreground flex items-center justify-between'>
									<span>https://acme-docs.taskmanly.app</span>
									<ExternalLink className='h-3 w-3 text-muted-foreground' />
								</div>
								<div className='p-3.5 rounded-lg border border-border/80 bg-background space-y-1.5'>
									<div className='font-bold text-foreground text-sm'>Getting Started with Acme API</div>
									<div className='text-muted-foreground text-[11px]'>Includes 4 nested pages, code samples, and public read access.</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 6. AI Assistant (UI Left | Text Right) */}
			<section id='ai-assistant' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Double-Bezel Mockup */}
					<div className='order-2 lg:order-1 rounded-2xl border border-border/80 bg-muted/35 p-2'>
						<div className='rounded-xl border border-border/80 bg-card p-6 shadow-2xs'>
							<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
								<div className='flex items-center gap-2'>
									<div className='flex h-6 w-6 items-center justify-center rounded-md bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300'>
										<Sparkles className='h-3.5 w-3.5' />
									</div>
									<span className='font-bold text-foreground'>Taskmanly AI</span>
								</div>
								<Badge variant='outline' className='text-[10px] text-muted-foreground border-border'>Copilot</Badge>
							</div>
							<div className='mt-4 space-y-3 text-xs'>
								<div className='p-2.5 rounded-xl rounded-tr-none bg-muted border border-border/60 text-foreground text-[11px] ml-auto max-w-[85%] font-medium'>
									Break down &apos;Implement workspace &amp; page permissions&apos; into implementation steps.
								</div>
								<div className='p-3.5 rounded-xl rounded-tl-none bg-background border border-border/80 text-[11px] space-y-2 max-w-[92%]'>
									<div className='font-semibold text-foreground'>Generated 3 Action Items:</div>
									<div className='flex items-center gap-2 text-muted-foreground'>
										<div className='h-4 w-4 rounded bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center shrink-0'>
											<Check className='h-2.5 w-2.5' />
										</div>
										<span className='text-foreground'>[P0] Define workspace role enum in Postgres schema</span>
									</div>
									<div className='flex items-center gap-2 text-muted-foreground'>
										<div className='h-4 w-4 rounded bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center shrink-0'>
											<Check className='h-2.5 w-2.5' />
										</div>
										<span className='text-foreground'>[P1] Add permission check middleware on API</span>
									</div>
									<div className='flex items-center gap-2 text-muted-foreground'>
										<div className='h-4 w-4 rounded bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center shrink-0'>
											<Check className='h-2.5 w-2.5' />
										</div>
										<span className='text-foreground'>[P2] Build team member roles management UI</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Text */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='flex items-center gap-2.5'>
							<div className='h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center'>
								<Sparkles className='h-4 w-4' />
							</div>
							<span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
								AI Copilot
							</span>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Taskmanly AI Assistant
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							An intelligent assistant built right into your workspace. Draft PRDs, extract action items, brainstorm ideas, and summarize meetings with full context.
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Draft PRDs, technical specs, and executive summaries",
								"Extract action items and todo checklists from notes",
								"Organize unstructured thoughts into database schemas",
								"Query your workspace documentation and team status naturally",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-md border border-border bg-muted/50 text-[#5e6ad2] flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/ai'>
								<Button className='rounded-lg bg-foreground text-background hover:bg-foreground/90 font-medium'>
									Explore AI Capabilities
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<CtaSection />
		</div>
	);
}
