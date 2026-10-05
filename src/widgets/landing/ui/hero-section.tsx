import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { BrowserMockup } from "./browser-mockup";
import { ProductPreview } from "./product-preview";

export function HeroSection() {
	return (
		<section className='relative pt-12 pb-20 sm:pt-20 lg:pt-24 overflow-hidden'>
			{/* Subtle decorative glow */}
			<div className='pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-b from-indigo-500/10 to-violet-500/5 dark:from-indigo-500/15 dark:to-violet-500/10 blur-3xl rounded-full' />

			<div className='relative mx-auto max-w-5xl px-4 sm:px-6 text-center flex flex-col items-center'>
				{/* Top Launch Pill */}
				<div className='inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-xs font-medium text-foreground/90 shadow-2xs backdrop-blur-md mb-8 hover:border-border transition-colors'>
					<span className='flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse' />
					<span className='font-semibold text-foreground'>Taskmanly 2.0</span>
					<span className='text-muted-foreground'>— Connected workspace with AI</span>
					<ArrowRight className='h-3 w-3 text-muted-foreground' />
				</div>

				{/* Main Hero Headline */}
				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 max-w-4xl leading-[1.1] sm:leading-[1.08]'>
					Organize your work, ideas and team in{" "}
					<span className='bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent'>
						one powerful workspace
					</span>
				</h1>

				{/* Supporting Paragraph */}
				<p className='mt-6 text-base sm:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed'>
					Taskmanly combines flexible documents, structured databases, web publishing, and AI in one collaborative workspace.
				</p>

				{/* CTAs */}
				<div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto'>
					<Link href='/sign-up' className='w-full sm:w-auto'>
						<Button
							size='lg'
							className='h-12 w-full sm:w-auto rounded-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white px-7 text-sm font-semibold shadow-md shadow-indigo-600/20 dark:shadow-indigo-950/40 transition-all active:scale-[0.98]'
						>
							Get started free
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
					</Link>

					<Link href='/features' className='w-full sm:w-auto'>
						<Button
							size='lg'
							variant='outline'
							className='h-12 w-full sm:w-auto rounded-full border-border bg-surface/80 px-7 text-sm font-medium text-foreground backdrop-blur-xs hover:bg-muted/70 active:scale-[0.98]'
						>
							View features
						</Button>
					</Link>
				</div>

				{/* Trust Bullets */}
				<div className='mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-teal-600 dark:text-teal-400' />
						<span>Free forever plan</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-teal-600 dark:text-teal-400' />
						<span>No credit card required</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-teal-600 dark:text-teal-400' />
						<span>Instant setup in 30 seconds</span>
					</div>
				</div>
			</div>

			{/* Large Browser Mockup with interactive dashboard preview */}
			<div className='relative mx-auto mt-14 sm:mt-18 max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Background decorative glow behind mockup */}
				<div className='pointer-events-none absolute inset-x-12 -top-6 -bottom-6 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl rounded-3xl -z-10' />

				<BrowserMockup url='taskmanly.app/workspace/product-team' title='Product Specs & Database Views'>
					<ProductPreview />
				</BrowserMockup>
			</div>
		</section>
	);
}
