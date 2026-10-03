import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function CtaSection() {
	return (
		<section className='relative py-20 sm:py-28 overflow-hidden'>
			<div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='relative rounded-3xl border border-border/80 bg-gradient-to-b from-primary/10 via-background to-secondary/30 p-8 sm:p-14 lg:p-18 text-center shadow-xl overflow-hidden'>
					{/* Ambient glow mesh */}
					<div className='pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-60' />

					<div className='relative z-10 max-w-2xl mx-auto space-y-6'>
						<div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-sm'>
							<Sparkles className='h-3.5 w-3.5' />
							Start Building Faster Today
						</div>

						<h2 className='text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]'>
							Turn your ideas into{" "}
							<span className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent'>
								real progress
							</span>
						</h2>

						<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
							Join thousands of teams running their documents, structured databases, and workspace knowledge with Taskmanly. Set up your workspace in less than a minute.
						</p>

						<div className='pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5'>
							<Link href='/sign-up' className='w-full sm:w-auto'>
								<Button
									size='lg'
									className='h-12 w-full sm:w-auto rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]'
								>
									Get started free
									<ArrowRight className='ml-2 h-4 w-4' />
								</Button>
							</Link>

							<Link href='/sign-in' className='w-full sm:w-auto'>
								<Button
									size='lg'
									variant='outline'
									className='h-12 w-full sm:w-auto rounded-full border-border/80 bg-background/80 px-8 text-sm font-medium text-foreground backdrop-blur-sm hover:bg-muted/70 active:scale-[0.98]'
								>
									Sign in to account
								</Button>
							</Link>
						</div>

						<div className='pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground'>
							<div className='flex items-center gap-1.5'>
								<CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
								<span>No credit card required</span>
							</div>
							<div className='flex items-center gap-1.5'>
								<CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
								<span>Instant team collaboration</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
