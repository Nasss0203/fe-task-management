import { Rocket } from "lucide-react";
import { Button } from "../../ui/button";

const Banner = () => {
	return (
		<div className='mx-auto grid max-w-7xl items-center gap-12 pt-20 lg:grid-cols-2 lg:pt-32'>
			<div className='flex flex-col items-start text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-in-out'>
				<div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-indigo-400 backdrop-blur-sm'>
					<Rocket className='h-3.5 w-3.5' />
					Smarter project execution
				</div>

				<h1 className='max-w-2xl text-5xl font-semibold leading-[1.1] tracking-tighter sm:text-6xl lg:text-7xl'>
					The optimal solution for collaborative tasks.
				</h1>

				<p className='mt-8 max-w-lg text-lg leading-relaxed text-white/50'>
					Streamline your workflow, enhance collaboration, and ensure
					seamless project success with our comprehensive suite.
				</p>

				<div className='mt-10 flex flex-col gap-4 sm:flex-row'>
					<Button
						size='lg'
						className='h-12 min-w-[160px] rounded-full bg-indigo-500 font-semibold text-white transition-all hover:bg-indigo-400 active:scale-[0.98]'
					>
						Get Started
					</Button>
					<Button
						size='lg'
						variant='outline'
						className='h-12 min-w-[160px] rounded-full border-white/10 bg-white/5 font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]'
					>
						Try for Free
					</Button>
				</div>
			</div>

			<div className='relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-300'>
				<div className='aspect-square rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-sm'>
					<div className='flex items-center gap-2 border-b border-white/10 px-5 py-4'>
						<div className='h-2.5 w-2.5 rounded-full bg-white/20' />
						<div className='h-2.5 w-2.5 rounded-full bg-white/20' />
						<div className='h-2.5 w-2.5 rounded-full bg-white/20' />
					</div>
					<div className='flex h-full items-center justify-center text-white/10'>
						<div className='text-8xl font-bold italic tracking-tighter'>
							Manly.
						</div>
					</div>
				</div>
				{/* Decorative elements */}
				<div className='absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl' />
				<div className='absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl' />
			</div>
		</div>
	);
};

export default Banner;
