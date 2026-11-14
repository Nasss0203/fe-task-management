import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { BrowserMockup } from "./browser-mockup";
import { ProductPreview } from "./product-preview";

export function HeroSection() {
	return (
		<section className='relative pt-12 pb-20 sm:pt-20 lg:pt-24 overflow-hidden'>
			{/* Subtle architectural grid backdrop (Attio / Linear style, no neon blur) */}
			<div
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(120,120,128,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,128,0.06)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_60%,transparent_100%)]'
			/>

			<div className='relative mx-auto max-w-5xl px-4 sm:px-6 text-center flex flex-col items-center'>
				{/* Top Launch Pill */}
				<div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[12.5px] mb-8 shadow-2xs'>
					<span className='h-1.5 w-1.5 rounded-full bg-[#5e6ad2]' />
					<span className='font-semibold text-foreground'>Taskmanly 2.0</span>
					<span className='text-border'>|</span>
					<span className='text-muted-foreground'>Connected workspace with AI</span>
				</div>

				{/* Main Hero Headline: editorial two-tone hierarchy, no AI gradient text */}
				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] sm:leading-[1.08]'>
					Organize your work, ideas and team{" "}
					<span className='text-muted-foreground font-semibold'>
						in one powerful workspace.
					</span>
				</h1>

				{/* Supporting Paragraph */}
				<p className='mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed'>
					Taskmanly combines flexible documents, structured databases, web publishing, and AI in one collaborative workspace.
				</p>

				{/* CTAs */}
				<div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto'>
					<Link href='/sign-up' className='w-full sm:w-auto'>
						<Button
							size='lg'
							className='h-10 w-full sm:w-auto rounded-lg px-[18px] text-sm font-medium'
						>
							Get started free
						</Button>
					</Link>

					<Link href='/features' className='w-full sm:w-auto'>
						<Button
							size='lg'
							variant='outline'
							className='h-10 w-full sm:w-auto rounded-lg border-input bg-card px-[18px] text-sm font-medium text-foreground hover:bg-accent shadow-2xs'
						>
							View features
						</Button>
					</Link>
				</div>

				{/* Trust Bullets */}
				<div className='mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-[#5e6ad2]' />
						<span>Free forever plan</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-[#5e6ad2]' />
						<span>No credit card required</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-[#5e6ad2]' />
						<span>Instant setup in 30 seconds</span>
					</div>
				</div>
			</div>

			{/* Double-bezel framed Browser Mockup */}
			<div className='relative mx-auto mt-14 sm:mt-18 max-w-6xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-2xl border border-border/80 bg-muted/45 p-1.5 sm:p-2.5 shadow-sm'>
					<BrowserMockup url='taskmanly.app/workspace/product-team' title='Product Specs & Database Views'>
						<ProductPreview />
					</BrowserMockup>
				</div>
			</div>
		</section>
	);
}
