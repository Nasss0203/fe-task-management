import ProductivityMockup from "./product/ProductivityMockup";
const productivityCards = [
	{
		title: "Effortless Task Creation",
		description:
			"Seamlessly create new tasks with ease, whether you're working individually or collaborating with your team.",
		variant: "task-creation",
	},
	{
		title: "Organization with Streamlined List View",
		description:
			"Immerse yourself in a clean and intuitive list view that enhances visibility and simplifies your workflow.",
		variant: "list-view",
	},
	{
		title: "Potential of Your Efficiency with AutoFlow",
		description:
			"Seamlessly automate repetitive tasks, streamline processes, and elevate your productivity to new heights.",
		variant: "autoflow",
	},
	{
		title: "Summaries for Enhanced Task Management",
		description:
			"Elevate your productivity with succinct task summaries that provide a quick overview of key details.",
		variant: "summary",
	},
];

const FeatureHighlight = () => {
	return (
		<div className='mx-auto mt-24 max-w-6xl'>
			<div className='text-center'>
				<h2 className='text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl'>
					Focus on Tasks that Generate Revenue.
				</h2>

				<p className='mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base'>
					Taskmanly plays a pivotal role in facilitating the
					coordination of complex tasks among different teams,
					ensuring a seamless collaboration that ultimately
					contributes to the achievement of tangible and impactful
					business results.
				</p>
			</div>

			<div className='mt-10 grid gap-6 md:grid-cols-2'>
				{productivityCards.map((card) => (
					<div
						key={card.title}
						className='overflow-hidden rounded-[22px] border border-white/15 bg-[#111214]'
					>
						<div className='border-b border-white/10 px-6 py-6'>
							<h3 className='text-xl font-semibold text-white'>
								{card.title}
							</h3>
							<p className='mt-3 text-sm leading-7 text-white/60'>
								{card.description}
							</p>

							<button
								type='button'
								className='mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white'
							>
								Learn more
								<span>›</span>
							</button>
						</div>

						<div className='bg-[#18191c] p-5'>
							<ProductivityMockup variant={card.variant} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default FeatureHighlight;
