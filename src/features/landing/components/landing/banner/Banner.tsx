import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Banner = () => {
	return (
		<div className='mx-auto grid max-w-7xl items-center gap-12 pt-20 lg:grid-cols-2 lg:pt-32'>
			<div className='flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-in-out'>
				<div className='mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium text-primary backdrop-blur-sm'>
					<Rocket className='h-3.5 w-3.5' />
					Tasks & Notes, finally united
				</div>

				<h1 className='max-w-2xl text-5xl font-semibold leading-[1.1] tracking-tighter sm:text-6xl lg:text-7xl'>
					Where your work actually happens.
				</h1>

				<p className='mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground'>
					A unified workspace where your team plans projects, writes
					documents, and tracks progress without switching context.
				</p>

				<div className='mt-10 flex flex-col gap-4 sm:flex-row'>
					<Button
						size='lg'
						className='h-12 min-w-[160px] rounded-full bg-primary font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]'
					>
						Get Started
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='h-12 min-w-[160px] rounded-full border-border bg-secondary font-semibold text-foreground transition-all hover:bg-secondary/80 active:scale-[0.98]'
					>
						Try for Free
					</Button>
				</div>
			</div>

			<div className='relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-300'>
				<div className='aspect-square rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-sm flex flex-col overflow-hidden'>
					<div className='flex items-center gap-2 border-b border-border px-5 py-4 bg-muted/30'>
						<div className='h-2.5 w-2.5 rounded-full bg-border' />
						<div className='h-2.5 w-2.5 rounded-full bg-border' />
						<div className='h-2.5 w-2.5 rounded-full bg-border' />
					</div>
					<div className='flex-1 grid grid-cols-5 p-6 gap-6'>
						{/* Task List Side */}
						<div className='col-span-2 space-y-4 pt-2'>
							<div className='h-4 w-1/2 bg-muted-foreground/30 rounded-md mb-8' />
							{[1, 2, 3, 4, 5].map((i) => (
								<div key={i} className='flex items-center gap-3'>
									<div className={`h-4 w-4 rounded border ${i === 1 ? 'border-primary bg-primary/20' : 'border-border'}`} />
									<div className={`h-2.5 rounded-full ${i === 1 ? 'w-full bg-primary/40' : 'w-5/6 bg-border'}`} />
								</div>
							))}
						</div>
						{/* Note Side */}
						<div className='col-span-3 border-l border-border pl-6 space-y-5 pt-2'>
							<div className='h-6 w-3/4 bg-foreground/20 rounded-md mb-6' />
							<div className='space-y-3'>
								<div className='h-2 w-full bg-border rounded-full' />
								<div className='h-2 w-5/6 bg-border rounded-full' />
								<div className='h-2 w-4/6 bg-border rounded-full' />
							</div>
							<div className='mt-8 h-32 w-full rounded-xl border border-border bg-muted/30 p-4'>
								<div className='flex items-center gap-2 mb-4'>
									<div className='h-5 w-5 rounded bg-primary/30 flex items-center justify-center'>
										<div className='h-2 w-2 rounded-sm bg-primary' />
									</div>
									<div className='h-2.5 w-20 bg-muted-foreground/40 rounded-full' />
								</div>
								<div className='h-2 w-full bg-border rounded-full mb-3' />
								<div className='h-2 w-2/3 bg-border rounded-full' />
							</div>
						</div>
					</div>
				</div>
				{/* Decorative elements */}
				<div className='absolute -right-12 -top-12 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
				<div className='absolute -bottom-12 -left-12 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl' />
			</div>
		</div>
	);
};

export default Banner;
