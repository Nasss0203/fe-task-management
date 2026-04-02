const brandItems = [
	{ name: "StellarTech", icon: "✦" },
	{ name: "CascadeStyle", icon: "⬡" },
	{ name: "Braincraze", icon: "✹" },
	{ name: "StackFlow", icon: "◈" },
	{ name: "Biomark", icon: "◉" },
];
const TrustedBy = () => {
	return (
		<>
			<div className='mx-auto mt-14 max-w-6xl'>
				<div className='overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur'>
					<div className='flex items-center gap-2 border-b border-white/10 px-5 py-4'>
						<div className='h-3 w-3 rounded-full bg-red-400/80' />
						<div className='h-3 w-3 rounded-full bg-yellow-400/80' />
						<div className='h-3 w-3 rounded-full bg-green-400/80' />
						<div className='ml-4 h-8 flex-1 rounded-full border border-white/10 bg-black/40' />
					</div>

					<div className='relative aspect-[16/9] w-full bg-[#0f0f12]'></div>
				</div>
			</div>
			<div className='mx-auto mt-14 max-w-6xl text-center'>
				<p className='text-xl font-semibold text-white sm:text-2xl'>
					Trusted by over 40,000 teams and companies worldwide
				</p>

				<div className='mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-12 lg:gap-x-14'>
					{brandItems.map((brand) => (
						<div
							key={brand.name}
							className='flex items-center gap-2 text-base font-semibold text-white/80 sm:text-lg'
						>
							<span className='text-white'>{brand.icon}</span>
							<span>{brand.name}</span>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default TrustedBy;
