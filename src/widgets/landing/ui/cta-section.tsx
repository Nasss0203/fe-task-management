import { ArrowRight, Check, Database, FileText, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

const WORKSPACE_MODULES = [
	{
		icon: FileText,
		title: "Pages & Nested Docs",
		subtitle: "Markdown, code blocks & callouts",
		status: "Ready",
	},
	{
		icon: Database,
		title: "Relational Databases",
		subtitle: "Table, Board, List & Calendar views",
		status: "4 views",
	},
	{
		icon: Sparkles,
		title: "Workspace AI Copilot",
		subtitle: "Draft pages, plans & summaries",
		status: "Context-aware",
	},
	{
		icon: Globe,
		title: "Web Publishing",
		subtitle: "Instant custom subdomain sites",
		status: "Live SSL",
	},
];

export function CtaSection() {
	return (
		<section className='relative pt-14 pb-8 sm:pt-20 sm:pb-12 overflow-hidden'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-3xl border border-border/80 bg-muted/40 p-2 sm:p-2.5 shadow-xs'>
					<div className='relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10 lg:p-12 shadow-2xs'>
						{/* Subtle architectural grid pattern */}
						<div
							aria-hidden='true'
							className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,128,0.05)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_75%_at_30%_50%,#000_40%,transparent_100%)]'
						/>

						<div className='relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center'>
							{/* Left Column: CTA Copy, Actions & Metrics (7 cols) */}
							<div className='lg:col-span-7 flex flex-col items-start text-left'>
								<div className='inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-5'>
									<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
									Start Building Faster Today
								</div>

								<h2 className='text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-foreground leading-[1.12]'>
									Turn your ideas into{" "}
									<span className='text-muted-foreground font-semibold'>
										real progress.
									</span>
								</h2>

								<p className='mt-4 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed'>
									Run your documents, structured databases, and workspace knowledge in one connected place. Set up your team workspace in less than a minute.
								</p>

								<div className='mt-7 flex w-full flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:w-auto'>
									<Link href='/sign-up' className='w-full sm:w-auto'>
										<Button
											size='lg'
											className='h-10 w-full sm:w-auto rounded-lg px-5 text-sm font-medium group'
										>
											Get started free
											<ArrowRight className='ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
										</Button>
									</Link>

									<Link href='/sign-in' className='w-full sm:w-auto'>
										<Button
											size='lg'
											variant='outline'
											className='h-10 w-full sm:w-auto rounded-lg border-border bg-background/80 px-5 text-sm font-medium text-foreground hover:bg-accent'
										>
											Sign in to account
										</Button>
									</Link>
								</div>

								<div className='mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground'>
									<div className='flex items-center gap-1.5'>
										<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
										<span>Free forever plan</span>
									</div>
									<div className='flex items-center gap-1.5'>
										<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
										<span>No credit card required</span>
									</div>
									<div className='flex items-center gap-1.5'>
										<Check className='h-3.5 w-3.5 text-[#5e6ad2]' />
										<span>Instant team collaboration</span>
									</div>
								</div>

								{/* Bottom architectural stats strip */}
								<div className='mt-8 pt-6 border-t border-border/60 grid grid-cols-3 gap-4 sm:gap-8 w-full'>
									<div>
										<div className='font-mono text-lg sm:text-xl font-bold text-foreground'>&lt; 30s</div>
										<div className='text-[11px] text-muted-foreground mt-0.5'>Workspace setup</div>
									</div>
									<div>
										<div className='font-mono text-lg sm:text-xl font-bold text-foreground'>4 Views</div>
										<div className='text-[11px] text-muted-foreground mt-0.5'>Table, Board, List &amp; Cal</div>
									</div>
									<div>
										<div className='font-mono text-lg sm:text-xl font-bold text-foreground'>1-Click</div>
										<div className='text-[11px] text-muted-foreground mt-0.5'>Subdomain web publish</div>
									</div>
								</div>
							</div>

							{/* Right Column: Workspace Modules Stack (5 cols) */}
							<div className='lg:col-span-5 rounded-xl border border-border/80 bg-muted/30 p-3.5 sm:p-4 space-y-2.5'>
								<div className='flex items-center justify-between px-1 pb-1.5 border-b border-border/60 text-xs'>
									<span className='font-semibold text-foreground'>Included in every workspace</span>
									<span className='inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground'>
										<span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
										All modules active
									</span>
								</div>

								<div className='space-y-2'>
									{WORKSPACE_MODULES.map((item) => {
										const Icon = item.icon;
										return (
											<div
												key={item.title}
												className='flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-2xs'
											>
												<div className='flex items-center gap-3 min-w-0'>
													<div className='h-8 w-8 rounded-lg border border-border bg-muted/50 text-foreground flex items-center justify-center shrink-0'>
														<Icon className='h-4 w-4 text-[#5e6ad2]' />
													</div>
													<div className='min-w-0'>
														<div className='text-xs font-semibold text-foreground truncate'>
															{item.title}
														</div>
														<div className='text-[11px] text-muted-foreground truncate'>
															{item.subtitle}
														</div>
													</div>
												</div>
												<Badge
													variant='outline'
													className='shrink-0 text-[10px] border-border bg-muted/40 text-muted-foreground font-mono'
												>
													{item.status}
												</Badge>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
