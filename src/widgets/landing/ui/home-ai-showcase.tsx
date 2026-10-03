"use client";

import { useState } from "react";
import {
	AlignLeft,
	ArrowRight,
	Check,
	CheckCircle2,
	FileText,
	HelpCircle,
	Lightbulb,
	Send,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const AI_CAPABILITIES_LIST = [
	{
		title: "Draft specifications & docs",
		description: "Convert high-level requirements into structured PRDs, RFCs, and meeting agendas.",
		icon: FileText,
	},
	{
		title: "Extract action items & todos",
		description: "Identify actionable checklist items and follow-ups from meeting notes instantly.",
		icon: CheckCircle2,
	},
	{
		title: "Brainstorm & organize ideas",
		description: "Structure unstructured thoughts into organized outlines and relational tables.",
		icon: Lightbulb,
	},
	{
		title: "Summarize information",
		description: "Extract key decisions and executive takeaways from long documents and wikis.",
		icon: AlignLeft,
	},
	{
		title: "Answer workspace questions",
		description: "Query your workspace documents, notes, and team knowledge base naturally.",
		icon: HelpCircle,
	},
];

export function HomeAiShowcase() {
	const [applied, setApplied] = useState(false);

	return (
		<section className='py-20 sm:py-28 relative overflow-hidden'>
			{/* Subtle decorative glow */}
			<div className='pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/10 via-amber-500/10 to-transparent blur-3xl opacity-70 rounded-full' />

			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Section Header */}
				<div className='mx-auto max-w-2xl text-center mb-14 sm:mb-16'>
					<div className='inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4'>
						<Sparkles className='h-3.5 w-3.5' />
						Workspace Intelligence
					</div>
					<h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground'>
						Turn ideas into action with AI
					</h2>
					<p className='mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed'>
						Taskmanly AI understands your workspace context and helps teams create, draft, and organize work with zero overhead.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-center'>
					{/* Left: Interactive Chat UI Mockup (7 cols) */}
					<div className='lg:col-span-7 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xl relative overflow-hidden'>
						{/* Top chat header */}
						<div className='flex items-center justify-between pb-4 border-b border-border/60 text-xs'>
							<div className='flex items-center gap-2'>
								<div className='h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center'>
									<Sparkles className='h-4 w-4' />
								</div>
								<div>
									<div className='font-semibold text-foreground'>Taskmanly Assistant</div>
									<div className='text-[10px] text-muted-foreground'>Document & Knowledge Copilot</div>
								</div>
							</div>
							<Badge variant='outline' className='text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/20'>
								Live Context
							</Badge>
						</div>

						{/* Dialogue thread */}
						<div className='my-5 space-y-4 text-xs'>
							{/* User query */}
							<div className='flex justify-end'>
								<div className='rounded-2xl rounded-tr-none bg-primary px-4 py-2.5 text-xs text-primary-foreground max-w-[85%] font-medium shadow-xs'>
									Draft an architecture review page for our new database sync engine.
								</div>
							</div>

							{/* AI Response Card */}
							<div className='flex items-start gap-3'>
								<div className='h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-amber-500/20'>
									<Sparkles className='h-3.5 w-3.5' />
								</div>
								<div className='flex-1 rounded-2xl rounded-tl-none border border-border/80 bg-muted/30 p-4 space-y-3 shadow-xs'>
									<div>
										<div className='text-xs font-bold text-foreground'>
											Architecture RFC: Database Sync Engine
										</div>
										<div className='text-[11px] text-muted-foreground mt-0.5'>
											Structured proposal with core design decisions and implementation checklist.
										</div>
									</div>

									{/* Proposed Checklist */}
									<div className='space-y-1.5 pt-1'>
										<div className='flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/60'>
											<span className='font-medium text-foreground'>
												Define WebSocket connection lifecycle & heartbeat protocols
											</span>
											<Badge variant='outline' className='text-[9px] text-red-500 border-red-500/30'>
												P0 High
											</Badge>
										</div>
										<div className='flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/60'>
											<span className='font-medium text-foreground'>
												Implement client-side conflict resolution with CRDT timestamps
											</span>
											<Badge variant='outline' className='text-[9px] text-red-500 border-red-500/30'>
												P0 High
											</Badge>
										</div>
										<div className='flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/60'>
											<span className='font-medium text-foreground'>
												Add exponential backoff retry for network reconnects
											</span>
											<Badge variant='outline' className='text-[9px] text-amber-500 border-amber-500/30'>
												P1 Med
											</Badge>
										</div>
										<div className='flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/60'>
											<span className='font-medium text-foreground'>
												Automated unit test suite for multi-client concurrent edits
											</span>
											<Badge variant='outline' className='text-[9px] text-emerald-500 border-emerald-500/30'>
												P2 Low
											</Badge>
										</div>
									</div>

									{/* Action Footer */}
									<div className='pt-2 flex items-center gap-2'>
										<Button
											size='sm'
											onClick={() => setApplied(true)}
											className={`h-8 rounded-lg text-xs font-semibold transition-all ${
												applied
													? "bg-emerald-600 text-white hover:bg-emerald-600"
													: "bg-primary text-primary-foreground hover:bg-primary/90"
											}`}
										>
											{applied ? (
												<>
													<Check className='mr-1.5 h-3.5 w-3.5' />
													Applied to Workspace!
												</>
											) : (
												"Apply to Workspace"
											)}
										</Button>
										<span className='text-[10px] text-muted-foreground'>
											Automatically inserts 4 structured blocks into your page
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Mock Composer */}
						<div className='flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 p-1.5 px-3 shadow-xs'>
							<input
								type='text'
								readOnly
								value='Summarize the last 3 team standup decisions...'
								className='flex-1 bg-transparent text-xs text-muted-foreground outline-none cursor-default'
							/>
							<Button size='icon' className='h-7 w-7 rounded-lg bg-primary text-primary-foreground shrink-0'>
								<Send className='h-3 w-3' />
							</Button>
						</div>
					</div>

					{/* Right: Capabilities list & CTA (5 cols) */}
					<div className='lg:col-span-5 space-y-6'>
						<div className='space-y-4'>
							<h3 className='text-2xl font-bold tracking-tight text-foreground'>
								Context-aware intelligence across your workspace
							</h3>
							<p className='text-sm text-muted-foreground leading-relaxed'>
								Unlike generic chatbots, Taskmanly AI connects directly to your databases and documents to eliminate repetitive manual setup and drafting.
							</p>
						</div>

						<div className='space-y-3.5 pt-2'>
							{AI_CAPABILITIES_LIST.map((cap) => {
								const Icon = cap.icon;
								return (
									<div key={cap.title} className='flex items-start gap-3'>
										<div className='h-7 w-7 rounded-lg bg-muted/70 text-foreground flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-border/50'>
											<Icon className='h-3.5 w-3.5 text-primary' />
										</div>
										<div>
											<div className='text-xs font-semibold text-foreground'>{cap.title}</div>
											<div className='text-[11px] text-muted-foreground leading-normal mt-0.5'>
												{cap.description}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						<div className='pt-3'>
							<Link href='/ai'>
								<Button className='rounded-full bg-primary text-primary-foreground font-semibold group'>
									Explore Taskmanly AI
									<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
