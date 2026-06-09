const brandItems = [
	{ name: "Vercel", slug: "vercel" },
	{ name: "Stripe", slug: "stripe" },
	{ name: "Linear", slug: "linear" },
	{ name: "GitHub", slug: "github" },
	{ name: "Clerk", slug: "clerk" },
];

const TrustedBy = () => {
	return (
		<div className='mx-auto mt-24 max-w-6xl text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500'>
			<p className='text-sm font-medium tracking-widest uppercase text-white/40'>
				Trusted by industry leaders
			</p>

			<div className='mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500'>
				{brandItems.map((brand) => (
					<div
						key={brand.name}
						className='flex items-center gap-3 transition-transform hover:scale-105'
					>
						<img
							src={`https://cdn.simpleicons.org/${brand.slug}/ffffff`}
							alt={brand.name}
							className='h-6 w-auto'
						/>
						<span className='text-lg font-semibold tracking-tight text-white'>
							{brand.name}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default TrustedBy;
