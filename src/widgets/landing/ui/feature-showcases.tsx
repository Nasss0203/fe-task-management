import {
	ArrowRight,
	Check,
	Database,
	FileText,
	Shield,
	Sparkles,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

export function FeatureShowcases() {
	return (
		<section className='py-12 sm:py-20 space-y-24 sm:space-y-36'>
			{/* SHOWCASE 1: Pages & Notes (Text Left | UI Right) */}
			<div id='showcase-pages' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Text Column */}
					<div className='space-y-6'>
						<div className='inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400'>
							<FileText className='h-3.5 w-3.5' />
							Pages & Notes
						</div>

						<h3 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight'>
							Structured documents that adapt to your thoughts
						</h3>

						<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
							Combine markdown, flexible blocks, nested pages, and inline database embeds in an intuitive, distraction-free editor.
						</p>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm'>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Create structured pages</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Nested content hierarchy</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Flexible blocks & code</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Organize knowledge base</span>
							</div>
						</div>

						<div className='pt-2'>
							<Link href='/features#pages-notes'>
								<Button variant='outline' className='rounded-full group'>
									Explore Pages & Notes
									<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
								</Button>
							</Link>
						</div>
					</div>

					{/* UI Preview Column */}
					<div className='relative rounded-2xl border border-border/80 bg-card p-6 shadow-xl overflow-hidden'>
						<div className='flex items-center justify-between pb-4 border-b border-border/60 text-xs text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<FileText className='h-4 w-4 text-blue-500' />
								<span className='font-semibold text-foreground'>Product Architecture RFC</span>
							</div>
							<Badge variant='outline' className='text-[10px]'>Live Editing</Badge>
						</div>

						<div className='mt-5 space-y-4 text-sm'>
							<div className='h-6 w-3/4 rounded-md bg-foreground/15 font-bold text-foreground text-lg flex items-center px-1'>
								System Architecture & State Flow
							</div>

							<p className='text-xs text-muted-foreground leading-relaxed'>
								Our unified workspace synchronizes state between collaborative note blocks and structured relational tables without layout lag.
							</p>

							{/* Callout box */}
							<div className='rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3 text-xs'>
								<Sparkles className='h-4 w-4 text-primary shrink-0 mt-0.5' />
								<div>
									<span className='font-semibold text-foreground'>Key Decision:</span> Single source of truth across database properties, team notes, and markdown checklists.
								</div>
							</div>

							{/* Checklist items */}
							<div className='space-y-2 pt-1'>
								<div className='flex items-center gap-2.5 text-xs text-foreground'>
									<div className='h-4 w-4 rounded bg-primary text-primary-foreground flex items-center justify-center'>
										<Check className='h-3 w-3' />
									</div>
									<span className='line-through text-muted-foreground'>
										Define recursive schema for nested blocks
									</span>
								</div>
								<div className='flex items-center gap-2.5 text-xs text-foreground'>
									<div className='h-4 w-4 rounded bg-primary text-primary-foreground flex items-center justify-center'>
										<Check className='h-3 w-3' />
									</div>
									<span className='line-through text-muted-foreground'>
										Implement AST parser for rich code snippets
									</span>
								</div>
								<div className='flex items-center gap-2.5 text-xs text-foreground'>
									<div className='h-4 w-4 rounded border border-border bg-card flex items-center justify-center' />
									<span>Enable drag-and-drop block reordering</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* SHOWCASE 2: Database & Views (UI Left | Text Right) */}
			<div id='showcase-database' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* UI Preview Column (Left) */}
					<div className='order-2 lg:order-1 relative rounded-2xl border border-border/80 bg-card p-6 shadow-xl overflow-hidden'>
						{/* Table Header controls */}
						<div className='flex items-center justify-between pb-3.5 border-b border-border/60 text-xs'>
							<div className='flex items-center gap-1 rounded-lg border border-border/60 p-0.5 bg-muted/40'>
								<span className='px-2 py-0.5 rounded bg-background font-semibold text-foreground shadow-xs'>
									All Records
								</span>
								<span className='px-2 py-0.5 rounded text-muted-foreground'>By Priority</span>
								<span className='px-2 py-0.5 rounded text-muted-foreground'>Calendar</span>
							</div>
							<span className='text-[11px] text-muted-foreground font-mono'>3 items</span>
						</div>

						{/* Table rows */}
						<div className='mt-4 overflow-x-auto'>
							<table className='w-full text-xs text-left border-collapse'>
								<thead>
									<tr className='text-muted-foreground font-semibold border-b border-border/50'>
										<th className='py-2 px-2'>Item Name</th>
										<th className='py-2 px-2'>Status</th>
										<th className='py-2 px-2'>Owner</th>
										<th className='py-2 px-2'>Priority</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border/40 text-foreground'>
									<tr>
										<td className='py-2.5 px-2 font-medium'>Q4 Marketing Landing Website</td>
										<td className='py-2.5 px-2'>
											<Badge variant='outline' className='text-[9px] bg-blue-500/10 text-blue-600 border-none'>
												In Progress
											</Badge>
										</td>
										<td className='py-2.5 px-2 text-muted-foreground'>Alex V.</td>
										<td className='py-2.5 px-2 text-amber-500 font-semibold'>High</td>
									</tr>
									<tr>
										<td className='py-2.5 px-2 font-medium'>PostgreSQL Database Index Tuning</td>
										<td className='py-2.5 px-2'>
											<Badge variant='outline' className='text-[9px] bg-emerald-500/10 text-emerald-600 border-none'>
												Completed
											</Badge>
										</td>
										<td className='py-2.5 px-2 text-muted-foreground'>Nam N.</td>
										<td className='py-2.5 px-2 text-emerald-600 font-semibold'>Normal</td>
									</tr>
									<tr>
										<td className='py-2.5 px-2 font-medium'>Template Clone Transaction Model</td>
										<td className='py-2.5 px-2'>
											<Badge variant='outline' className='text-[9px] bg-purple-500/10 text-purple-600 border-none'>
												Review
											</Badge>
										</td>
										<td className='py-2.5 px-2 text-muted-foreground'>Sara K.</td>
										<td className='py-2.5 px-2 text-red-500 font-semibold'>Urgent</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					{/* Text Column (Right) */}
					<div className='order-1 lg:order-2 space-y-6'>
						<div className='inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400'>
							<Database className='h-3.5 w-3.5' />
							Database & Views
						</div>

						<h3 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight'>
							Databases that structure data exactly how you work
						</h3>

						<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
							Define custom properties, filter by dynamic criteria, and switch effortlessly between Table, Board, List, and Calendar layouts.
						</p>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm'>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Custom property types</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Dynamic multi-row views</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Table, Board, List & Calendar</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Sorting & multi-level filters</span>
							</div>
						</div>

						<div className='pt-2'>
							<Link href='/features#database-views'>
								<Button variant='outline' className='rounded-full group'>
									Explore Database
									<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* SHOWCASE 3: Team Collaboration & Permissions (Text Left | UI Right) */}
			<div id='showcase-collaboration' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
					{/* Text Column */}
					<div className='space-y-6'>
						<div className='inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/5 px-3 py-1 text-xs font-semibold text-pink-600 dark:text-pink-400'>
							<Users className='h-3.5 w-3.5' />
							Team Collaboration
						</div>

						<h3 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight'>
							Empower your entire company with granular access control
						</h3>

						<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
							Organize squads into dedicated Teamspaces. Protect private documents, share public pages, and collaborate together in real time.
						</p>

						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm'>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Squad Teamspaces</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Granular RBAC roles</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Private & shared spaces</span>
							</div>
							<div className='flex items-start gap-2.5'>
								<div className='h-5 w-5 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0 mt-0.5'>
									<Check className='h-3 w-3' />
								</div>
								<span className='text-foreground font-medium'>Real-time presence & sync</span>
							</div>
						</div>

						<div className='pt-2'>
							<Link href='/features#team-collaboration'>
								<Button variant='outline' className='rounded-full group'>
									Explore Collaboration
									<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
								</Button>
							</Link>
						</div>
					</div>

					{/* UI Preview Column */}
					<div className='relative rounded-2xl border border-border/80 bg-card p-6 shadow-xl overflow-hidden'>
						<div className='flex items-center justify-between pb-4 border-b border-border/60 text-xs'>
							<div className='flex items-center gap-2 font-semibold text-foreground'>
								<Shield className='h-4 w-4 text-pink-500' />
								Workspace Members & Roles
							</div>
							<Badge variant='outline' className='text-[10px]'>Admin Console</Badge>
						</div>

						{/* Member list */}
						<div className='mt-4 space-y-3'>
							<div className='flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs'>
								<div className='flex items-center gap-2.5'>
									<div className='h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs'>
										AD
									</div>
									<div>
										<div className='font-semibold text-foreground'>Alex Doe</div>
										<div className='text-[10px] text-muted-foreground'>alex@taskmanly.app</div>
									</div>
								</div>
								<Badge className='bg-primary text-primary-foreground text-[10px]'>Workspace Owner</Badge>
							</div>

							<div className='flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs'>
								<div className='flex items-center gap-2.5'>
									<div className='h-8 w-8 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center text-xs'>
										SK
									</div>
									<div>
										<div className='font-semibold text-foreground'>Sarah Kim</div>
										<div className='text-[10px] text-muted-foreground'>sarah@taskmanly.app</div>
									</div>
								</div>
								<Badge variant='secondary' className='text-[10px]'>Admin</Badge>
							</div>

							<div className='flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs'>
								<div className='flex items-center gap-2.5'>
									<div className='h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 font-bold flex items-center justify-center text-xs'>
										NL
									</div>
									<div>
										<div className='font-semibold text-foreground'>Nam Le</div>
										<div className='text-[10px] text-muted-foreground'>nam@taskmanly.app</div>
									</div>
								</div>
								<Badge variant='outline' className='text-[10px]'>Member</Badge>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
