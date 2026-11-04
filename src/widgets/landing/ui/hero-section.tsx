import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { BrowserMockup } from "./browser-mockup";
import { ProductPreview } from "./product-preview";

export function HeroSection() {
	return (
		<section className='relative pt-12 pb-20 sm:pt-20 lg:pt-24 overflow-hidden'>

			<div className='relative mx-auto max-w-5xl px-4 sm:px-6 text-center flex flex-col items-center'>
				{/* Top Launch Pill */}
				<div className='inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1 text-[12.5px] mb-8'>
					<span className='font-semibold text-foreground'>Taskmanly 2.0</span>
					<span className='text-muted-foreground'>— Connected workspace with AI</span>
				</div>

				{/* Main Hero Headline */}
				<h1 className='text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] sm:leading-[1.08]'>
					Organize your work, ideas and team in{" "}
						one powerful workspace
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
							className='h-10 w-full sm:w-auto rounded-lg border-input bg-transparent px-[18px] text-sm font-medium text-foreground hover:bg-accent'
						>
							View features
						</Button>
					</Link>
				</div>

				{/* Trust Bullets */}
				<div className='mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-muted-foreground' />
						<span>Free forever plan</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-muted-foreground' />
						<span>No credit card required</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<CheckCircle2 className='h-3.5 w-3.5 text-muted-foreground' />
						<span>Instant setup in 30 seconds</span>
					</div>
				</div>
			</div>

			{/* Large Browser Mockup with interactive dashboard preview */}
			<div className='relative mx-auto mt-14 sm:mt-18 max-w-6xl px-4 sm:px-6 lg:px-8'>

				<BrowserMockup url='taskmanly.app/workspace/product-team' title='Product Specs & Database Views'>
					<ProductPreview />
				</BrowserMockup>
			</div>
		</section>
	);
}
