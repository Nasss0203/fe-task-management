import { Layers, Zap, Search, Shield } from "lucide-react";

const productivityCards = [
	{
		title: "Effortless Task Creation",
		description:
			"Seamlessly create new tasks with ease, whether you're working individually or collaborating with your team.",
		icon: Layers,
		className: "md:col-span-2",
		visual: (
			<div className='flex h-full items-center justify-center'>
				<div className='relative h-32 w-48 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
					<div className='mb-3 h-2 w-2/3 rounded-full bg-indigo-500/50' />
					<div className='h-2 w-1/2 rounded-full bg-white/10' />
					<div className='absolute -right-4 -top-4 h-12 w-12 rounded-full bg-indigo-500/20 blur-xl' />
				</div>
			</div>
		),
	},
	{
		title: "List View",
		description: "Clean and intuitive view that simplifies your workflow.",
		icon: Search,
		className: "md:col-span-1",
		visual: (
			<div className='flex h-full flex-col gap-2 p-4'>
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className='h-2 w-full rounded-full bg-white/5'
					/>
				))}
			</div>
		),
	},
	{
		title: "Shielded Security",
		description: "Enterprise-grade protection for your project data.",
		icon: Shield,
		className: "md:col-span-1",
		visual: (
			<div className='flex h-full items-center justify-center'>
				<Shield className='h-12 w-12 text-indigo-500/20' />
			</div>
		),
	},
	{
		title: "AutoFlow Automation",
		description:
			"Seamlessly automate repetitive tasks, streamline processes, and elevate your productivity to new heights.",
		icon: Zap,
		className: "md:col-span-2",
		visual: (
			<div className='relative flex h-full items-center justify-center overflow-hidden'>
				<div className='flex gap-4'>
					<div className='h-16 w-16 rounded-xl border border-white/10 bg-white/5' />
					<div className='flex items-center text-indigo-500'>→</div>
					<div className='h-16 w-16 rounded-xl border border-indigo-500/30 bg-indigo-500/10' />
				</div>
				<div className='absolute inset-0 bg-gradient-to-t from-[#18191c] to-transparent' />
			</div>
		),
	},
];

const FeatureHighlight = () => {
	return (
		<div className='mx-auto mt-32 max-w-6xl'>
			<div className='text-center animate-in fade-in slide-in-from-bottom-4 duration-1000'>
				<h2 className='text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl'>
					Focus on what generates revenue.
				</h2>

				<p className='mx-auto mt-6 max-w-2xl text-lg text-white/50'>
					Taskmanly facilitates the coordination of complex tasks,
					ensuring seamless collaboration for tangible business
					results.
				</p>
			</div>

			<div className='mt-16 grid gap-6 md:grid-cols-3'>
				{productivityCards.map((card, i) => (
					<div
						key={card.title}
						className={`group overflow-hidden rounded-3xl border border-white/10 bg-[#111214] transition-all hover:border-indigo-500/30 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-${i * 100} ${card.className}`}
					>
						<div className='p-8'>
							<card.icon className='mb-4 h-6 w-6 text-indigo-500' />
							<h3 className='text-xl font-semibold text-white'>
								{card.title}
							</h3>
							<p className='mt-3 text-sm leading-relaxed text-white/50'>
								{card.description}
							</p>
						</div>

						<div className='h-48 bg-[#18191c]/50 transition-colors group-hover:bg-[#18191c]'>
							{card.visual}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default FeatureHighlight;
