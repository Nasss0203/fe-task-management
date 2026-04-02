import { Rocket } from "lucide-react";
import { Button } from "../../ui/button";

const Banner = () => {
	return (
		<div className='mx-auto flex max-w-5xl flex-col items-center pt-20 text-center'>
			<div className='mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-sm'>
				<Rocket className='h-3.5 w-3.5 text-indigo-400' />
				Smarter project execution for modern teams
			</div>

			<h1 className='max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
				The Optimal Solution for Collaborative Tasks Across Diverse
				Functions.
			</h1>

			<p className='mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base'>
				Welcome to a smarter way of managing tasks and products. Our
				comprehensive suite is designed to streamline your workflow,
				enhance collaboration, and ensure seamless project success.
			</p>

			<div className='mt-8 flex flex-col items-center gap-3 sm:flex-row'>
				<Button
					size='lg'
					className='min-w-[150px] bg-indigo-500 text-white hover:bg-indigo-400'
				>
					Get Started
				</Button>
				<Button
					size='lg'
					variant='outline'
					className='min-w-[150px] border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white'
				>
					Try for Free
				</Button>
			</div>
		</div>
	);
};

export default Banner;
