import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function CtaSection() {
	return (
		<section className='relative py-20 sm:py-28 overflow-hidden'>
			<div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='rounded-3xl bg-primary px-6 py-16 text-center'>
					<div className='mx-auto flex max-w-3xl flex-col items-center gap-4'>
						<div className='inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-3 py-1 text-xs font-semibold text-secondary-foreground'>
							<Sparkles className='h-3.5 w-3.5' />
							Start Building Faster Today
						</div>

						<h2 className='text-3xl sm:text-[44px] font-bold tracking-tight text-primary-foreground leading-[1.15]'>
							Turn your ideas into real progress
						</h2>

						<p className='max-w-[680px] text-base text-primary-foreground/70 leading-6'>
							Run your documents, structured databases, and workspace knowledge in one place. Set up your workspace in less than a minute.
						</p>

						<div className='flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row'>
							<Link href='/sign-up' className='w-full sm:w-auto'>
								<Button
									size='lg'
									className='h-10 w-full sm:w-auto rounded-lg bg-background px-[18px] text-sm font-medium text-foreground hover:bg-background/90'
								>
									Get started free
								</Button>
							</Link>

							<Link href='/sign-in' className='w-full sm:w-auto'>
								<Button
									size='lg'
									variant='outline'
									className='h-10 w-full sm:w-auto rounded-lg border-primary-foreground/25 bg-transparent px-[18px] text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'
								>
									Sign in to account
								</Button>
							</Link>
						</div>

						<div className='flex flex-wrap items-center justify-center gap-5 text-[13px] text-primary-foreground/70'>
							<div className='flex items-center gap-1.5'>
								<Check className='h-3.5 w-3.5' />
								<span>No credit card required</span>
							</div>
							<div className='flex items-center gap-1.5'>
								<Check className='h-3.5 w-3.5' />
								<span>Instant team collaboration</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
