"use client";

import { useState } from "react";
import Link from "next/link";
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
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { CtaSection } from "@/widgets/landing/ui/cta-section";
import { AI_CAPABILITIES } from "@/widgets/landing/data/marketing-data";

export function AiPageContent() {
	const { user } = useUser();
	const [activePromptIndex, setActivePromptIndex] = useState(0);
	const [applied, setApplied] = useState(false);

	const activeCapability = AI_CAPABILITIES[activePromptIndex];

	return (
		<div className='py-12 sm:py-20 space-y-24 sm:space-y-32'>
			{/* Page Hero */}
			<section className='mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6'>
				<div className='inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400'>
					<Sparkles className='h-3.5 w-3.5' />
					Taskmanly AI Assistant
				</div>

				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.1]'>
					Get more done{" "}
					<span className='bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent'>
						with AI
					</span>
				</h1>

				<p className='text-base sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed'>
					Taskmanly AI understands workspace context and helps users create, plan and organize work without tedious administrative overhead.
				</p>

				{/* Hero CTAs */}
				<div className='pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5'>
					<Link href={user ? "/dashboard/ai" : "/sign-up"}>
						<Button
							size='lg'
							className='h-12 w-full sm:w-auto rounded-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white px-8 text-sm font-semibold shadow-md shadow-indigo-600/20 dark:shadow-indigo-950/40'
						>
							Try AI
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</Link>

					<Link href='#capabilities'>
						<Button
							size='lg'
							variant='outline'
							className='h-12 w-full sm:w-auto rounded-full border-border/80 px-8 text-sm font-medium'
						>
							Explore capabilities
						</Button>
					</Link>
				</div>
			</section>

			{/* Main Visual: AI Assistant Interface Mockup */}
			<section className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-card p-5 sm:p-8 shadow-2xl relative overflow-hidden'>
					<div className='pointer-events-none absolute -top-24 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl' />

					{/* Top Mockup Header Bar */}
					<div className='flex items-center justify-between pb-5 border-b border-border/60 text-xs'>
						<div className='flex items-center gap-2.5'>
							<div className='h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center ring-1 ring-amber-500/20'>
								<Sparkles className='h-4 w-4' />
							</div>
							<div>
								<div className='font-bold text-foreground text-sm'>
									Taskmanly AI Assistant
								</div>
								<div className='text-[10px] text-muted-foreground'>
									Connected to active workspace context
								</div>
							</div>
						</div>

						<Badge variant='outline' className='text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20'>
							Model Ready
						</Badge>
					</div>

					{/* Interactive Prompt switcher pills */}
					<div className='py-4 border-b border-border/50 flex flex-wrap items-center gap-2'>
						<span className='text-[11px] font-semibold text-muted-foreground mr-1'>
							Sample Prompts:
						</span>
						{AI_CAPABILITIES.map((cap, idx) => (
							<button
								key={cap.id}
								type='button'
								onClick={() => {
									setActivePromptIndex(idx);
									setApplied(false);
								}}
								className={`text-xs px-3 py-1 rounded-full transition-all ${
									activePromptIndex === idx
										? "bg-primary text-primary-foreground font-semibold shadow-xs"
										: "border border-border/80 bg-muted/30 text-muted-foreground hover:text-foreground"
								}`}
							>
								{cap.title}
							</button>
						))}
					</div>

					{/* Dialogue area */}
					<div className='py-6 space-y-5'>
						{/* User Message */}
						<div className='flex justify-end'>
							<div className='rounded-2xl rounded-tr-none bg-primary px-4 py-3 text-xs sm:text-sm text-primary-foreground font-medium max-w-lg shadow-xs'>
								{activeCapability.examplePrompt}
							</div>
						</div>

						{/* Assistant Response Box */}
						<div className='flex items-start gap-3'>
							<div className='h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20'>
								<Sparkles className='h-4 w-4' />
							</div>
							<div className='flex-1 rounded-2xl rounded-tl-none border border-border/80 bg-muted/20 p-5 space-y-4 shadow-xs'>
								<div>
									<div className='text-sm font-bold text-foreground'>
										{activeCapability.exampleResultTitle}
									</div>
									<div className='text-xs text-muted-foreground mt-0.5'>
										Structured proposal ready to commit directly into your workspace.
									</div>
								</div>

								{/* Checkbox tasks list */}
								<div className='space-y-2 pt-1'>
									{activeCapability.exampleResultItems.map((item, idx) => (
										<div
											key={idx}
											className='flex items-center gap-2.5 p-2.5 rounded-xl border border-border/60 bg-background/80 text-xs text-foreground font-medium'
										>
											<div className='h-4 w-4 rounded border border-primary/40 bg-primary/5 flex items-center justify-center text-[10px] text-primary shrink-0'>
												<Check className='h-3 w-3' />
											</div>
											<span className='leading-snug'>{item}</span>
										</div>
									))}
								</div>

								{/* Action Button */}
								<div className='pt-2 flex items-center gap-3'>
									<Button
										size='sm'
										onClick={() => setApplied(true)}
										className={`h-9 rounded-xl text-xs font-semibold px-4 transition-all ${
											applied
												? "bg-emerald-600 text-white hover:bg-emerald-600"
												: "bg-primary text-primary-foreground hover:bg-primary/90"
										}`}
									>
										{applied ? (
											<>
												<Check className='mr-1.5 h-3.5 w-3.5' />
												Applied to workspace!
											</>
										) : (
											"Apply to workspace"
										)}
									</Button>
									<span className='text-[11px] text-muted-foreground'>
										Instantly updates your tasks and notes
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Composer input bottom bar */}
					<div className='mt-2 flex items-center gap-2 rounded-xl border border-border/80 bg-background p-2 px-3.5 shadow-xs'>
						<input
							type='text'
							readOnly
							value={activeCapability.examplePrompt}
							className='flex-1 bg-transparent text-xs text-foreground outline-none cursor-default'
						/>
						<Button size='icon' className='h-8 w-8 rounded-lg bg-primary text-primary-foreground shrink-0'>
							<Send className='h-3.5 w-3.5' />
						</Button>
					</div>
				</div>
			</section>

			{/* 5 AI Capabilities Cards Grid */}
			<section id='capabilities' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='max-w-2xl mb-12'>
					<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
						Core AI Capabilities
					</h2>
					<p className='mt-3 text-base text-muted-foreground leading-relaxed'>
						Engineered to remove friction across every step of your team&apos;s knowledge workflow.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{/* Card 1: Generate content */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3 hover:border-primary/40 transition-colors'>
						<div className='h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center'>
							<FileText className='h-5 w-5' />
						</div>
						<h3 className='text-lg font-bold text-foreground'>Generate Content</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Draft specifications, engineering RFCs, team meeting agendas, and documentation updates in seconds with structured formatting.
						</p>
					</div>

					{/* Card 2: Structure Knowledge */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3 hover:border-primary/40 transition-colors'>
						<div className='h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center'>
							<Lightbulb className='h-5 w-5' />
						</div>
						<h3 className='text-lg font-bold text-foreground'>Structure Knowledge</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Automatically organize messy notes into structured documents, assign properties, and arrange clear content hierarchies.
						</p>
					</div>

					{/* Card 3: Generate Action Items */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3 hover:border-primary/40 transition-colors'>
						<div className='h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center'>
							<CheckCircle2 className='h-5 w-5' />
						</div>
						<h3 className='text-lg font-bold text-foreground'>Extract Action Items</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Break complex discussions into atomic, actionable checklist items with suggested priority levels and next steps.
						</p>
					</div>

					{/* Card 4: Summarize information */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3 hover:border-primary/40 transition-colors'>
						<div className='h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center'>
							<AlignLeft className='h-5 w-5' />
						</div>
						<h3 className='text-lg font-bold text-foreground'>Summarize Information</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Condense lengthy documents, discussion threads, and research logs into digestible executive summaries.
						</p>
					</div>

					{/* Card 5: Answer questions */}
					<div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-3 hover:border-primary/40 transition-colors'>
						<div className='h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center'>
							<HelpCircle className='h-5 w-5' />
						</div>
						<h3 className='text-lg font-bold text-foreground'>Answer Questions</h3>
						<p className='text-xs text-muted-foreground leading-relaxed'>
							Ask contextual questions regarding workspace documents, member roles, meeting notes, and technical specifications.
						</p>
					</div>

					{/* Card 6: Direct Workspace Integration */}
					<div className='rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-xs space-y-3 flex flex-col justify-between'>
						<div className='space-y-3'>
							<div className='h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center'>
								<Sparkles className='h-5 w-5' />
							</div>
							<h3 className='text-lg font-bold text-foreground'>One-Click Apply</h3>
							<p className='text-xs text-muted-foreground leading-relaxed'>
								Unlike standard chatbots, generated results can be added straight to your documents, tables, or checklist blocks.
							</p>
						</div>
						<Link href={user ? "/dashboard/ai" : "/sign-up"}>
							<Button size='sm' className='rounded-lg text-xs font-semibold w-full mt-2'>
								Try in Workspace
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<CtaSection />
		</div>
	);
}
