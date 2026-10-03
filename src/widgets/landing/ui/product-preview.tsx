"use client";

import { useState } from "react";
import {
	Check,
	CheckCircle2,
	ChevronRight,
	Database,
	FileText,
	Globe,
	LayoutGrid,
	Send,
	Shield,
	Sparkles,
	Table,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function ProductPreview() {
	const [activeView, setActiveView] = useState<"doc" | "table" | "board" | "ai">("doc");

	return (
		<div className='flex h-[560px] sm:h-[620px] w-full text-foreground bg-background select-none overflow-hidden'>
			{/* Mini Dashboard Sidebar */}
			<div className='w-48 sm:w-60 border-r border-border/60 bg-muted/20 p-3 hidden md:flex flex-col gap-4 shrink-0'>
				{/* Workspace Switcher */}
				<div className='flex items-center justify-between p-2 rounded-xl bg-card border border-border/60 shadow-xs'>
					<div className='flex items-center gap-2 min-w-0'>
						<div className='h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-border/40'>
							T
						</div>
						<div className='truncate'>
							<div className='text-xs font-semibold leading-tight truncate text-foreground'>
								Taskmanly Workspace
							</div>
							<div className='text-[10px] text-muted-foreground'>Pro Plan</div>
						</div>
					</div>
					<Badge variant='outline' className='text-[9px] px-1 py-0 h-4 border-primary/30 text-primary'>
						Active
					</Badge>
				</div>

				{/* Quick Nav Items */}
				<div className='space-y-0.5 text-xs text-muted-foreground font-medium'>
					<button
						type='button'
						onClick={() => setActiveView("doc")}
						className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left ${
							activeView === "doc"
								? "bg-secondary text-foreground font-semibold"
								: "hover:bg-muted/60 hover:text-foreground"
						}`}
					>
						<FileText className='h-3.5 w-3.5 text-blue-500' />
						<span>Document Page</span>
					</button>

					<button
						type='button'
						onClick={() => setActiveView("table")}
						className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left ${
							activeView === "table"
								? "bg-secondary text-foreground font-semibold"
								: "hover:bg-muted/60 hover:text-foreground"
						}`}
					>
						<Table className='h-3.5 w-3.5 text-purple-500' />
						<span>Database Table</span>
					</button>

					<button
						type='button'
						onClick={() => setActiveView("board")}
						className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left ${
							activeView === "board"
								? "bg-secondary text-foreground font-semibold"
								: "hover:bg-muted/60 hover:text-foreground"
						}`}
					>
						<LayoutGrid className='h-3.5 w-3.5 text-indigo-500' />
						<span>Database Board</span>
					</button>

					<button
						type='button'
						onClick={() => setActiveView("ai")}
						className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors text-left ${
							activeView === "ai"
								? "bg-secondary text-foreground font-semibold"
								: "hover:bg-muted/60 hover:text-foreground"
						}`}
					>
						<Sparkles className='h-3.5 w-3.5 text-amber-500' />
						<span>AI Assistant</span>
					</button>
				</div>

				{/* Teamspaces Section */}
				<div className='mt-2'>
					<div className='px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5'>
						Teamspaces
					</div>
					<div className='space-y-0.5 text-xs text-muted-foreground'>
						<div className='flex items-center justify-between px-2.5 py-1 rounded-lg hover:bg-muted/40 text-foreground font-medium'>
							<span className='flex items-center gap-2 truncate'>
								<span className='h-2 w-2 rounded-full bg-blue-500' />
								Engineering
							</span>
							<span className='text-[10px] text-muted-foreground'>12 docs</span>
						</div>
						<div className='flex items-center justify-between px-2.5 py-1 rounded-lg hover:bg-muted/40'>
							<span className='flex items-center gap-2 truncate'>
								<span className='h-2 w-2 rounded-full bg-purple-500' />
								Product Specs
							</span>
							<span className='text-[10px] text-muted-foreground'>8 docs</span>
						</div>
						<div className='flex items-center justify-between px-2.5 py-1 rounded-lg hover:bg-muted/40'>
							<span className='flex items-center gap-2 truncate'>
								<span className='h-2 w-2 rounded-full bg-emerald-500' />
								Company Handbook
							</span>
							<span className='text-[10px] text-muted-foreground'>6 docs</span>
						</div>
					</div>
				</div>

				{/* Workspace Sync Status */}
				<div className='mt-auto p-2.5 rounded-xl border border-border/50 bg-background/60'>
					<div className='flex items-center justify-between text-[11px] font-medium text-foreground mb-1'>
						<span className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400'>
							<CheckCircle2 className='h-3 w-3' />
							Workspace Synced
						</span>
						<span className='font-mono text-[10px] text-muted-foreground'>Live</span>
					</div>
					<div className='text-[10px] text-muted-foreground'>
						All documents and views up to date
					</div>
				</div>
			</div>

			{/* Main Workspace Viewport */}
			<div className='flex-1 flex flex-col min-w-0 bg-background overflow-hidden'>
				{/* Top Workspace Header Bar */}
				<div className='h-12 border-b border-border/60 px-4 flex items-center justify-between shrink-0 bg-background/70 backdrop-blur-xs'>
					{/* Breadcrumbs */}
					<div className='flex items-center gap-1.5 text-xs text-muted-foreground truncate'>
						<span className='hover:text-foreground cursor-pointer'>Engineering</span>
						<ChevronRight className='h-3 w-3 opacity-60' />
						<span className='font-semibold text-foreground truncate'>
							{activeView === "doc" && "Architecture & System RFC"}
							{activeView === "table" && "Knowledge Hub Database"}
							{activeView === "board" && "Database Board View"}
							{activeView === "ai" && "Workspace AI Assistant"}
						</span>
					</div>

					{/* View Switcher Tabs */}
					<div className='flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/40'>
						<button
							type='button'
							onClick={() => setActiveView("doc")}
							className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
								activeView === "doc"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Document
						</button>
						<button
							type='button'
							onClick={() => setActiveView("table")}
							className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
								activeView === "table"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Table View
						</button>
						<button
							type='button'
							onClick={() => setActiveView("board")}
							className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
								activeView === "board"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							Board View
						</button>
						<button
							type='button'
							onClick={() => setActiveView("ai")}
							className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1 ${
								activeView === "ai"
									? "bg-background text-foreground shadow-xs font-semibold"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							<Sparkles className='h-3 w-3 text-amber-500' />
							AI
						</button>
					</div>
				</div>

				{/* VIEW 1: DOCUMENT PAGE */}
				{activeView === "doc" && (
					<div className='flex-1 p-6 sm:p-8 overflow-auto max-w-2xl mx-auto w-full'>
						<div className='space-y-5'>
							<div className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground'>
								Architecture & System RFC
							</div>

							<p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
								This workspace document details our edge publishing proxy, block rendering architecture, and database relational indexing.
							</p>

							{/* Callout box */}
							<div className='rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary flex gap-3 items-start'>
								<Sparkles className='h-4 w-4 shrink-0 mt-0.5' />
								<div>
									<span className='font-semibold'>Live Sync Active:</span> Updates to blocks, tables, and nested pages are mirrored across all members in real time.
								</div>
							</div>

							{/* Code block */}
							<div className='rounded-xl border border-border/70 bg-muted/40 p-3.5 font-mono text-[11px] text-foreground space-y-1'>
								<div className='text-muted-foreground text-[10px] mb-1'>{"// Edge proxy hostname resolution"}</div>
								<div><code>GET https://acme-docs.taskmanly.app/architecture</code></div>
								<div className='text-emerald-600 dark:text-emerald-400'>&rarr; 200 OK (Edge Cache HIT, 18ms)</div>
							</div>

							{/* Checklist items */}
							<div className='space-y-2 pt-2'>
								<div className='text-xs font-semibold text-foreground uppercase tracking-wider'>
									Documentation Milestones
								</div>
								<div className='space-y-1.5 text-xs'>
									<div className='flex items-center gap-2.5 text-foreground'>
										<div className='h-4 w-4 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px]'>
											<Check className='h-3 w-3' />
										</div>
										<span className='line-through text-muted-foreground'>
											Finalize RBAC role inheritance schema in database
										</span>
									</div>
									<div className='flex items-center gap-2.5 text-foreground'>
										<div className='h-4 w-4 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px]'>
											<Check className='h-3 w-3' />
										</div>
										<span className='line-through text-muted-foreground'>
											Configure public subdomain routing with SSL certs
										</span>
									</div>
									<div className='flex items-center gap-2.5 text-foreground'>
										<div className='h-4 w-4 rounded border border-border bg-card flex items-center justify-center text-[10px]' />
										<span>Deploy AI contextual assistant for workspace Q&A</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* VIEW 2: DATABASE TABLE */}
				{activeView === "table" && (
					<div className='flex-1 p-4 sm:p-6 overflow-auto'>
						<div className='rounded-xl border border-border/80 bg-card overflow-hidden text-xs shadow-xs'>
							<table className='w-full border-collapse text-left'>
								<thead>
									<tr className='border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold'>
										<th className='py-2.5 px-3'>Document Name</th>
										<th className='py-2.5 px-3'>Category</th>
										<th className='py-2.5 px-3'>Status</th>
										<th className='py-2.5 px-3'>Author</th>
										<th className='py-2.5 px-3'>Updated</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border/50 text-foreground'>
									<tr className='hover:bg-muted/20 transition-colors'>
										<td className='py-3 px-3 font-medium flex items-center gap-2'>
											<FileText className='h-3.5 w-3.5 text-blue-500' />
											Engineering Onboarding Guide
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Handbook</td>
										<td className='py-3 px-3'>
											<Badge variant='secondary' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-none'>
												Published
											</Badge>
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Alex V.</td>
										<td className='py-3 px-3 text-muted-foreground font-mono text-[11px]'>2 hours ago</td>
									</tr>
									<tr className='hover:bg-muted/20 transition-colors'>
										<td className='py-3 px-3 font-medium flex items-center gap-2'>
											<Database className='h-3.5 w-3.5 text-purple-500' />
											API Authentication Specs
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Specs</td>
										<td className='py-3 px-3'>
											<Badge variant='secondary' className='text-[10px] bg-blue-500/10 text-blue-600 border-none'>
												In Review
											</Badge>
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Nam N.</td>
										<td className='py-3 px-3 text-muted-foreground font-mono text-[11px]'>Yesterday</td>
									</tr>
									<tr className='hover:bg-muted/20 transition-colors'>
										<td className='py-3 px-3 font-medium flex items-center gap-2'>
											<Globe className='h-3.5 w-3.5 text-emerald-500' />
											Public Subdomain Documentation
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Publishing</td>
										<td className='py-3 px-3'>
											<Badge variant='secondary' className='text-[10px] bg-emerald-500/10 text-emerald-600 border-none'>
												Published
											</Badge>
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Sara K.</td>
										<td className='py-3 px-3 text-muted-foreground font-mono text-[11px]'>3 days ago</td>
									</tr>
									<tr className='hover:bg-muted/20 transition-colors'>
										<td className='py-3 px-3 font-medium flex items-center gap-2'>
											<Shield className='h-3.5 w-3.5 text-pink-500' />
											Team Access & Permission Policy
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Security</td>
										<td className='py-3 px-3'>
											<Badge variant='secondary' className='text-[10px] bg-amber-500/10 text-amber-600 border-none'>
												Draft
											</Badge>
										</td>
										<td className='py-3 px-3 text-muted-foreground'>Alex V.</td>
										<td className='py-3 px-3 text-muted-foreground font-mono text-[11px]'>Oct 01</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* VIEW 3: DATABASE BOARD VIEW (Grouped by Status) */}
				{activeView === "board" && (
					<div className='flex-1 p-4 overflow-x-auto flex gap-4 bg-muted/10'>
						{/* Group: Draft */}
						<div className='w-64 shrink-0 flex flex-col gap-2.5'>
							<div className='flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground'>
								<span className='flex items-center gap-1.5'>
									<span className='h-2 w-2 rounded-full bg-amber-500' />
									Drafting
								</span>
								<span className='text-[11px] font-mono'>1</span>
							</div>

							<div className='p-3.5 rounded-xl border border-border/80 bg-card shadow-xs space-y-2'>
								<Badge variant='outline' className='text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20'>
									Security
								</Badge>
								<div className='text-xs font-semibold text-foreground leading-snug'>
									Team Access & Role Policy
								</div>
								<div className='flex items-center justify-between pt-1 text-[11px] text-muted-foreground'>
									<span>Updated today</span>
									<div className='h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center'>
										AV
									</div>
								</div>
							</div>
						</div>

						{/* Group: In Review */}
						<div className='w-64 shrink-0 flex flex-col gap-2.5'>
							<div className='flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground'>
								<span className='flex items-center gap-1.5'>
									<span className='h-2 w-2 rounded-full bg-blue-500' />
									In Review
								</span>
								<span className='text-[11px] font-mono'>1</span>
							</div>

							<div className='p-3.5 rounded-xl border border-border/80 bg-card shadow-xs space-y-2'>
								<Badge variant='outline' className='text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/20'>
									Specifications
								</Badge>
								<div className='text-xs font-semibold text-foreground leading-snug'>
									API Authentication Spec v2
								</div>
								<div className='flex items-center justify-between pt-1 text-[11px] text-muted-foreground'>
									<span>2 reviewers</span>
									<div className='h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 text-[10px] font-bold flex items-center justify-center'>
										NN
									</div>
								</div>
							</div>
						</div>

						{/* Group: Published */}
						<div className='w-64 shrink-0 flex flex-col gap-2.5'>
							<div className='flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground'>
								<span className='flex items-center gap-1.5'>
									<span className='h-2 w-2 rounded-full bg-emerald-500' />
									Published
								</span>
								<span className='text-[11px] font-mono'>2</span>
							</div>

							<div className='p-3.5 rounded-xl border border-border/80 bg-card shadow-xs space-y-2'>
								<Badge variant='outline' className='text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20'>
									Handbook
								</Badge>
								<div className='text-xs font-semibold text-foreground leading-snug'>
									Engineering Onboarding Guide
								</div>
								<div className='flex items-center justify-between pt-1 text-[11px] text-muted-foreground'>
									<span>Public site live</span>
									<CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
								</div>
							</div>

							<div className='p-3.5 rounded-xl border border-border/80 bg-card shadow-xs space-y-2'>
								<Badge variant='outline' className='text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20'>
									Publishing
								</Badge>
								<div className='text-xs font-semibold text-foreground leading-snug'>
									Public Subdomain Documentation
								</div>
								<div className='flex items-center justify-between pt-1 text-[11px] text-muted-foreground'>
									<span>Shared externally</span>
									<CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
								</div>
							</div>
						</div>
					</div>
				)}

				{/* VIEW 4: AI ASSISTANT */}
				{activeView === "ai" && (
					<div className='flex-1 p-5 overflow-auto flex flex-col justify-between max-w-xl mx-auto w-full'>
						<div className='space-y-4'>
							{/* User query bubble */}
							<div className='flex items-start gap-2.5 justify-end'>
								<div className='rounded-2xl rounded-tr-none bg-primary px-3.5 py-2.5 text-xs text-primary-foreground max-w-[85%] font-medium'>
									Draft an architecture spec for public page publishing with subdomains.
								</div>
							</div>

							{/* AI Response bubble */}
							<div className='flex items-start gap-2.5'>
								<div className='h-6 w-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 ring-1 ring-amber-500/30'>
									<Sparkles className='h-3.5 w-3.5' />
								</div>
								<div className='rounded-2xl rounded-tl-none border border-border/80 bg-muted/30 p-4 text-xs text-foreground space-y-2.5 max-w-[90%] shadow-xs'>
									<div className='font-bold text-foreground'>
										Architecture Spec: Public Site Publishing Engine
									</div>
									<p className='text-muted-foreground text-[11px] leading-relaxed'>
										Here is the structured document outline ready to insert into your engineering wiki:
									</p>
									<ul className='space-y-1.5 text-[11px] text-foreground'>
										<li className='flex items-center gap-2'>
											<span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
											<strong>Overview:</strong> Edge proxy mapping hostnames to page records
										</li>
										<li className='flex items-center gap-2'>
											<span className='h-1.5 w-1.5 rounded-full bg-purple-500' />
											<strong>Security:</strong> Read-only filter guaranteeing isolation from drafts
										</li>
										<li className='flex items-center gap-2'>
											<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
											<strong>Data Model:</strong> Page publication state and recursive child flag
										</li>
									</ul>
									<div className='pt-2 flex items-center gap-2'>
										<Button size='sm' className='h-7 text-[11px] rounded-lg bg-primary text-primary-foreground'>
											Insert into Document
										</Button>
										<Button size='sm' variant='outline' className='h-7 text-[11px] rounded-lg'>
											Copy spec
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Prompt composer */}
						<div className='mt-4 flex items-center gap-2 rounded-xl border border-border/80 bg-card p-1.5 px-3 shadow-xs'>
							<input
								type='text'
								placeholder='Ask Taskmanly AI to draft, summarize or structure...'
								className='flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none'
								readOnly
							/>
							<Button size='icon' className='h-7 w-7 rounded-lg bg-primary text-primary-foreground shrink-0'>
								<Send className='h-3.5 w-3.5' />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
