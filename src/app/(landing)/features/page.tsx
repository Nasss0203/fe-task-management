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
		<div className='py-12 sm:py-20 space-y-24 sm:space-y-36'>
			{/* Page Hero */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6'>
				<div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary'>
					<Sparkles className='h-3.5 w-3.5' />
					Product Capabilities
				</div>

				<h1 className='text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]'>
					Powerful features for{" "}
					<span className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent'>
						modern teams
					</span>
				</h1>

				<p className='text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
					Discover how Taskmanly unites rich documentation, relational data views, teamspaces, web publishing, and contextual AI into one cohesive workspace.
				</p>

				{/* Quick jump anchor bar */}
				<div className='flex flex-wrap items-center justify-center gap-2 pt-4'>
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
							className='text-xs px-3.5 py-1.5 rounded-full border border-border/80 bg-background/80 hover:bg-muted font-medium text-muted-foreground hover:text-foreground transition-colors shadow-xs'
						>
							{item.label}
						</a>
					))}
				</div>
			</section>

			{/* 1. Pages & Notes (Text Left | UI Right) */}
			<section id='pages-notes' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					<div className='space-y-6'>
						<div className='flex items-center gap-2'>
							<div className='h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center ring-1 ring-blue-500/20'>
								<FileText className='h-5 w-5' />
							</div>
							<Badge variant='outline' className='text-xs font-semibold text-blue-600 border-blue-500/30'>
								Core Editor
							</Badge>
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
								"Real-time collaborative typing with conflict-free synchronization",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/sign-up'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold'>
									Start writing free
								</Button>
							</Link>
						</div>
					</div>

					{/* Mockup */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xl'>
						<div className='flex items-center justify-between pb-4 border-b border-border/60 text-xs text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<FileText className='h-4 w-4 text-primary' />
								<span className='font-semibold text-foreground'>Engineering Wiki / Architecture</span>
							</div>
							<span className='font-mono text-[11px]'>v2.4 updated</span>
						</div>
						<div className='mt-5 space-y-3 text-xs'>
							<div className='h-6 w-2/3 bg-foreground/15 rounded-md font-bold text-foreground text-base flex items-center px-1'>
								Payment Gateway Integration Spec
							</div>
							<p className='text-muted-foreground leading-relaxed'>
								Our architecture uses asynchronous webhooks to process payments with guaranteed idempotency keys.
							</p>
							<div className='rounded-lg bg-muted/60 p-3 font-mono text-[11px] text-foreground border border-border/50'>
								<code>POST /api/v1/payments/verify-signature</code>
							</div>
							<div className='space-y-1.5 pt-2'>
								<div className='flex items-center gap-2 text-foreground font-medium'>
									<CheckCircle2 className='h-4 w-4 text-emerald-500' />
									<span>Validate HMAC SHA256 header signature hash</span>
								</div>
								<div className='flex items-center gap-2 text-foreground font-medium'>
									<CheckCircle2 className='h-4 w-4 text-emerald-500' />
									<span>Store incoming payload in idempotency audit log</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 2. Database & Views (UI Left | Text Right) */}
			<section id='database-views' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Mockup */}
					<div className='order-2 lg:order-1 rounded-2xl border border-border/80 bg-card p-6 shadow-xl'>
						<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
							<div className='flex items-center gap-2 font-semibold text-foreground'>
								<Database className='h-4 w-4 text-purple-500' />
								Workspace Database Views
							</div>
							<Badge variant='outline' className='text-[10px]'>4 Views</Badge>
						</div>

						<div className='mt-4 overflow-x-auto text-xs'>
							<table className='w-full text-left border-collapse'>
								<thead>
									<tr className='text-muted-foreground border-b border-border/60'>
										<th className='py-2 px-1'>Feature Spec</th>
										<th className='py-2 px-1'>Status</th>
										<th className='py-2 px-1'>Owner</th>
										<th className='py-2 px-1'>Priority</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border/40 text-foreground'>
									<tr>
										<td className='py-2 px-1 font-medium'>RBAC Permissions Matrix</td>
										<td className='py-2 px-1'><Badge className='text-[9px] bg-emerald-500/10 text-emerald-600 border-none'>Done</Badge></td>
										<td className='py-2 px-1 text-muted-foreground'>Alex</td>
										<td className='py-2 px-1 text-amber-500 font-semibold'>High</td>
									</tr>
									<tr>
										<td className='py-2 px-1 font-medium'>Subdomain Web Routing</td>
										<td className='py-2 px-1'><Badge className='text-[9px] bg-blue-500/10 text-blue-600 border-none'>Active</Badge></td>
										<td className='py-2 px-1 text-muted-foreground'>Nam</td>
										<td className='py-2 px-1 text-emerald-600 font-semibold'>Normal</td>
									</tr>
									<tr>
										<td className='py-2 px-1 font-medium'>Formula Fields & Aggregations</td>
										<td className='py-2 px-1'><Badge className='text-[9px] bg-purple-500/10 text-purple-600 border-none'>Review</Badge></td>
										<td className='py-2 px-1 text-muted-foreground'>Sara</td>
										<td className='py-2 px-1 text-red-500 font-semibold'>Urgent</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* Text */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='flex items-center gap-2'>
							<div className='h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center ring-1 ring-purple-500/20'>
								<Database className='h-5 w-5' />
							</div>
							<Badge variant='outline' className='text-xs font-semibold text-purple-600 border-purple-500/30'>
								Structured Data
							</Badge>
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
									<div className='h-5 w-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/sign-up'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold'>
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
						<div className='flex items-center gap-2'>
							<div className='h-9 w-9 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center ring-1 ring-pink-500/20'>
								<Users className='h-5 w-5' />
							</div>
							<Badge variant='outline' className='text-xs font-semibold text-pink-600 border-pink-500/30'>
								Workspace & Access
							</Badge>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Team Collaboration & Permissions
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Give departments their own Teamspaces while keeping sensitive documents secure with granular role-based access control (RBAC).
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Squad Teamspaces for Engineering, Product, Marketing, and Ops",
								"Granular role permissions: Workspace Owner, Admin, Member, Viewer",
								"Private personal drafts alongside shared organizational spaces",
								"Instant workspace invite links and email invitations",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/sign-up'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold'>
									Invite your team
								</Button>
							</Link>
						</div>
					</div>

					{/* Mockup */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xl'>
						<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
							<span className='font-bold text-foreground'>Workspace Access Control</span>
							<Badge variant='outline' className='text-[10px]'>Admin Console</Badge>
						</div>
						<div className='mt-4 space-y-2.5 text-xs'>
							<div className='flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20'>
								<div>
									<div className='font-semibold text-foreground'>Owner</div>
									<div className='text-[10px] text-muted-foreground'>Full billing and member administration</div>
								</div>
								<Badge className='text-[10px] bg-primary text-primary-foreground'>Owner</Badge>
							</div>
							<div className='flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20'>
								<div>
									<div className='font-semibold text-foreground'>Admin</div>
									<div className='text-[10px] text-muted-foreground'>Can manage Teamspaces and invite members</div>
								</div>
								<Badge variant='secondary' className='text-[10px]'>Admin</Badge>
							</div>
							<div className='flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20'>
								<div>
									<div className='font-semibold text-foreground'>Member</div>
									<div className='text-[10px] text-muted-foreground'>Can create pages, edit docs, and update records</div>
								</div>
								<Badge variant='outline' className='text-[10px]'>Member</Badge>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 4. Starter Templates (UI Left | Text Right) */}
			<section id='templates' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Mockup */}
					<div className='order-2 lg:order-1 rounded-2xl border border-border/80 bg-card p-6 shadow-xl'>
						<div className='h-48 w-full rounded-xl overflow-hidden border border-border/60 bg-muted/30 mb-3'>
							<TemplatePreview variant='checklist' />
						</div>
						<div className='flex items-center justify-between pt-2'>
							<div>
								<div className='text-xs font-bold text-foreground'>Company Wiki & Documentation Template</div>
								<div className='text-[10px] text-muted-foreground'>Includes handbook, onboarding checklists, and team directory</div>
							</div>
							<Link href='/templates/tpl-company-wiki'>
								<Button size='sm' className='h-8 text-xs font-semibold'>
									Preview
								</Button>
							</Link>
						</div>
					</div>

					{/* Text */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='flex items-center gap-2'>
							<div className='h-9 w-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center ring-1 ring-teal-500/20'>
								<LayoutTemplate className='h-5 w-5' />
							</div>
							<Badge variant='outline' className='text-xs font-semibold text-teal-600 border-teal-500/30'>
								Starter Templates
							</Badge>
						</div>

						<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
							Pre-Built Workspace Templates
						</h2>

						<p className='text-base text-muted-foreground leading-relaxed'>
							Save hours of setup. Jumpstart your workspace with battle-tested frameworks for Engineering, Product Specs, Meeting Notes, and Knowledge Bases.
						</p>

						<div className='space-y-3 pt-2 text-sm'>
							{[
								"Curated templates across 6 categories for fast adoption",
								"Complete with sample data, tags, and pre-configured database views",
								"One-click clone directly into your active workspace",
								"Fully customizable after adding to your account",
							].map((cap) => (
								<div key={cap} className='flex items-start gap-2.5'>
									<div className='h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/templates'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold'>
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
						<div className='flex items-center gap-2'>
							<div className='h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20'>
								<Globe className='h-5 w-5' />
							</div>
							<Badge variant='outline' className='text-xs font-semibold text-emerald-600 border-emerald-500/30'>
								Web Publishing
							</Badge>
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
									<div className='h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/publish'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold'>
									Learn more about publishing
								</Button>
							</Link>
						</div>
					</div>

					{/* Mockup */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xl'>
						<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
							<span className='font-bold text-foreground'>Live Public Site Preview</span>
							<Badge className='text-[10px] bg-emerald-500/10 text-emerald-600 border-none'>Online</Badge>
						</div>
						<div className='mt-4 space-y-3 text-xs'>
							<div className='p-2.5 rounded-lg border border-border/60 bg-muted/20 font-mono text-[11px] text-primary flex items-center justify-between'>
								<span>https://acme-docs.taskmanly.app</span>
								<ExternalLink className='h-3 w-3 text-muted-foreground' />
							</div>
							<div className='p-3 rounded-lg border border-border bg-background space-y-2'>
								<div className='font-bold text-foreground text-sm'>Getting Started with Acme API</div>
								<div className='text-muted-foreground text-[11px]'>Includes 4 nested pages, code samples, and public read access.</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 6. AI Assistant (UI Left | Text Right) */}
			<section id='ai-assistant' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Mockup */}
					<div className='order-2 lg:order-1 rounded-2xl border border-border/80 bg-card p-6 shadow-xl'>
						<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
							<div className='flex items-center gap-2'>
								<Sparkles className='h-4 w-4 text-amber-500' />
								<span className='font-bold text-foreground'>Taskmanly AI</span>
							</div>
							<Badge variant='outline' className='text-[10px] text-amber-600 border-amber-500/30'>Copilot</Badge>
						</div>
						<div className='mt-4 space-y-3 text-xs'>
							<div className='p-2.5 rounded-xl rounded-tr-none bg-primary text-primary-foreground text-[11px] ml-auto max-w-[85%] font-medium'>
								Break down &apos;Implement team role-based permissions&apos; into implementation steps.
							</div>
							<div className='p-3 rounded-xl rounded-tl-none bg-muted/40 border border-border/60 text-[11px] space-y-1.5 max-w-[90%]'>
								<div className='font-semibold text-foreground'>Generated 3 Action Items:</div>
								<div className='flex items-center gap-2 text-muted-foreground'>
									<div className='h-1.5 w-1.5 rounded-full bg-red-500' />
									<span>[P0] Define RBAC enum in Postgres schema</span>
								</div>
								<div className='flex items-center gap-2 text-muted-foreground'>
									<div className='h-1.5 w-1.5 rounded-full bg-amber-500' />
									<span>[P1] Add permission check middleware on API</span>
								</div>
								<div className='flex items-center gap-2 text-muted-foreground'>
									<div className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
									<span>[P2] Build team member roles management UI</span>
								</div>
							</div>
						</div>
					</div>

					{/* Text */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='flex items-center gap-2'>
							<div className='h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20'>
								<Sparkles className='h-5 w-5' />
							</div>
							<Badge variant='outline' className='text-xs font-semibold text-amber-600 border-amber-500/30'>
								AI Copilot
							</Badge>
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
									<div className='h-5 w-5 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5'>
										<Check className='h-3 w-3' />
									</div>
									<span className='text-foreground font-medium'>{cap}</span>
								</div>
							))}
						</div>

						<div className='pt-2'>
							<Link href='/ai'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold'>
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
