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
					<span>Taskmanly AI Assistant</span>
				</div>

				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]'>
					Get more done{" "}
					<span className='text-muted-foreground font-semibold'>
						with AI.
					</span>
				</h1>

				<p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
					Taskmanly AI understands workspace context and helps users create, plan and organize work without tedious administrative overhead.
				</p>

				{/* Hero CTAs */}
				<div className='pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5'>
					<Link href={user ? "/dashboard/ai" : "/sign-up"}>
						<Button
							size='lg'
							className='h-10 w-full sm:w-auto rounded-lg bg-[#5e6ad2] hover:bg-[#4e5ac0] text-white px-[18px] text-sm font-medium border-none'
						>
							Try AI
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</Link>

					<Link href='#capabilities'>
						<Button
							size='lg'
							variant='outline'
							className='h-10 w-full sm:w-auto rounded-lg border-border/80 bg-card hover:bg-muted/60 px-[18px] text-sm font-medium'
						>
							Explore capabilities
						</Button>
					</Link>
				</div>
			</section>

			{/* Main Visual: AI Assistant Interface Mockup (Double-Bezel Frame) */}
			<section className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-muted/35 p-2'>
					<div className='rounded-xl border border-border/80 bg-card p-5 sm:p-8 shadow-2xs relative overflow-hidden'>

						{/* Top Mockup Header Bar */}
						<div className='flex items-center justify-between pb-5 border-b border-border/60 text-xs'>
							<div className='flex items-center gap-2.5'>
								<div className='h-8 w-8 rounded-lg bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center'>
									<Sparkles className='h-4 w-4' />
								</div>
								<div>
									<div className='font-bold text-foreground text-sm'>
										Taskmanly AI Assistant
									</div>
									<div className='text-[11px] text-muted-foreground'>
										Connected to active workspace context
									</div>
								</div>
							</div>

							<span className='inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-medium text-foreground'>
								<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
								Model Ready
							</span>
						</div>

						{/* Interactive Prompt switcher pills */}
						<div className='py-4 border-b border-border/50 flex flex-wrap items-center gap-2'>
							<span className='text-[11px] font-semibold text-muted-foreground mr-1'>
								Sample Prompts:
							</span>
							{AI_CAPABILITIES.map((cap, idx) => {
								const isActive = activePromptIndex === idx;
								return (
									<button
										key={cap.id}
										type='button'
										onClick={() => {
											setActivePromptIndex(idx);
											setApplied(false);
										}}
										className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
											isActive
												? "border-foreground/30 bg-muted/70 text-foreground font-semibold shadow-2xs"
												: "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
										}`}
									>
										<span
											className={`h-1.5 w-1.5 rounded-full ${
												isActive ? "bg-[#5e6ad2]" : "bg-border"
											}`}
										/>
										{cap.title}
									</button>
								);
							})}
						</div>

						{/* Dialogue area */}
						<div className='py-6 space-y-5'>
							{/* User Message */}
							<div className='flex justify-end'>
								<div className='rounded-2xl rounded-tr-none border border-border/70 bg-muted px-4 py-3 text-xs sm:text-sm text-foreground font-medium max-w-lg'>
									{activeCapability.examplePrompt}
								</div>
							</div>

							{/* Assistant Response Box */}
							<div className='flex items-start gap-3'>
								<div className='h-8 w-8 rounded-lg bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center shrink-0'>
									<Sparkles className='h-4 w-4' />
								</div>
								<div className='flex-1 rounded-2xl rounded-tl-none border border-border/80 bg-muted/20 p-5 space-y-4'>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<div className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5'>
												New Page Draft
											</div>
											<div className='text-sm font-bold text-foreground'>
												{activeCapability.exampleResultTitle}
											</div>
											<div className='text-xs text-muted-foreground mt-0.5'>
												Structured proposal ready to commit directly into your workspace.
											</div>
										</div>
										<Badge variant='outline' className='text-[10px] border-border bg-card shrink-0'>
											Draft Ready
										</Badge>
									</div>

									{/* Checkbox tasks list */}
									<div className='space-y-2 pt-1'>
										{activeCapability.exampleResultItems.map((item, idx) => (
											<div
												key={idx}
												className='flex items-center gap-2.5 p-2.5 rounded-lg border border-border/70 bg-card text-xs text-foreground font-medium'
											>
												<div className='h-4 w-4 rounded bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center text-[10px] shrink-0'>
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
											className={`h-9 rounded-lg text-xs font-semibold px-4 transition-all border-none ${
												applied
													? "bg-emerald-600 text-white hover:bg-emerald-600"
													: "bg-[#5e6ad2] text-white hover:bg-[#4e5ac0]"
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
						<div className='mt-2 flex items-center gap-2 rounded-xl border border-border/80 bg-background p-2 px-3.5 shadow-2xs'>
							<input
								type='text'
								readOnly
								value={activeCapability.examplePrompt}
								className='flex-1 bg-transparent text-xs text-foreground outline-none cursor-default'
							/>
							<Button size='icon' className='h-8 w-8 rounded-lg bg-[#5e6ad2] hover:bg-[#4e5ac0] text-white shrink-0 border-none'>
								<Send className='h-3.5 w-3.5' />
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* 6 AI Capabilities Cards Grid (Double-Bezel Framing) */}
			<section id='capabilities' className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 scroll-mt-24'>
				<div className='max-w-2xl mb-12 space-y-3'>
					<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-2xs'>
						<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
						<span>Core Capabilities</span>
					</div>
					<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
						Core AI Capabilities
					</h2>
					<p className='text-base text-muted-foreground leading-relaxed'>
						Engineered to remove friction across every step of your team&apos;s knowledge workflow.
					</p>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
					{[
						{
							icon: FileText,
							title: "Generate Content",
							desc: "Draft specifications, engineering RFCs, team meeting agendas, and documentation updates in seconds with structured formatting.",
						},
						{
							icon: Lightbulb,
							title: "Structure Knowledge",
							desc: "Automatically organize messy notes into structured documents, assign properties, and arrange clear content hierarchies.",
						},
						{
							icon: CheckCircle2,
							title: "Extract Action Items",
							desc: "Break complex discussions into atomic, actionable checklist items with suggested priority levels and next steps.",
						},
						{
							icon: AlignLeft,
							title: "Summarize Information",
							desc: "Condense lengthy documents, discussion threads, and research logs into digestible executive summaries.",
						},
						{
							icon: HelpCircle,
							title: "Answer Questions",
							desc: "Ask contextual questions regarding workspace documents, member roles, meeting notes, and technical specifications.",
						},
					].map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.title}
								className='group rounded-2xl border border-border/80 bg-muted/30 p-1.5 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/50'
							>
								<div className='flex h-full flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-2xs space-y-3'>
									<div className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground transition-colors duration-200 group-hover:border-[#5e6ad2] group-hover:bg-[#5e6ad2] group-hover:text-white'>
										<Icon className='h-4 w-4' />
									</div>
									<div className='space-y-1.5'>
										<h3 className='text-base font-semibold tracking-tight text-foreground'>
											{item.title}
										</h3>
										<p className='text-[13px] text-muted-foreground leading-relaxed'>
											{item.desc}
										</p>
									</div>
								</div>
							</div>
						);
					})}

					{/* Card 6: Direct Workspace Integration */}
					<div className='rounded-2xl border border-[#5e6ad2]/35 bg-[#eeeffc]/30 dark:bg-indigo-500/10 p-1.5'>
						<div className='flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4'>
							<div className='space-y-3'>
								<div className='h-9 w-9 rounded-lg bg-[#eeeffc] text-[#5e6ad2] dark:bg-indigo-500/20 dark:text-indigo-300 flex items-center justify-center'>
									<Sparkles className='h-4 w-4' />
								</div>
								<div className='space-y-1.5'>
									<h3 className='text-base font-semibold tracking-tight text-foreground'>
										One-Click Apply
									</h3>
									<p className='text-[13px] text-muted-foreground leading-relaxed'>
										Unlike standard chatbots, generated results can be added straight to your documents, tables, or checklist blocks.
									</p>
								</div>
							</div>
							<Link href={user ? "/dashboard/ai" : "/sign-up"}>
								<Button size='sm' className='rounded-lg bg-[#5e6ad2] hover:bg-[#4e5ac0] text-white text-xs font-medium w-full border-none'>
									Try in Workspace
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
