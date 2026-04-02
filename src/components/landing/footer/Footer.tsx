import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
const footerColumns = [
	{
		title: "Product",
		links: [
			"Home",
			"Pricing",
			"Enterprise",
			"Customer Success",
			"Trust & Security",
			"App & Integration",
			"Template",
		],
	},
	{
		title: "Solution",
		links: [
			"Project Management",
			"Increase Productivity",
			"Agile Workflows",
			"Mind Map",
			"Strategy & Planning",
			"Goal Management",
			"Work Management",
		],
	},
	{
		title: "Resources",
		links: [
			"Help Center",
			"Blog",
			"Community",
			"Support",
			"Developer & API",
			"Partners",
			"Accessibility",
		],
	},
	{
		title: "Company",
		links: [
			"About Us",
			"Careers",
			"Press",
			"Sitemap",
			"Investor Relations",
			"Customers",
			"Affiliates",
		],
	},
];
const Footer = () => {
	return (
		<footer className='mx-auto mt-12 max-w-6xl overflow-hidden rounded-t-[28px] rounded-b-none border border-white/10 border-b-0 bg-[#0a0a0c]'>
			<div className='relative overflow-hidden border-b border-white/10 px-6 py-14 lg:px-10'>
				<div className='absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.01)_35%,transparent_35%,transparent_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.01)_70%,transparent_70%)] bg-size-[260px_260px] opacity-35' />

				<div className='relative mx-auto max-w-3xl text-center'>
					<h2 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
						Elevate Your Workflow Today!
					</h2>

					<p className='mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base'>
						Take the next step towards seamless task management with
						our cutting-edge software. Choose the perfect plan for
						your needs, and empower your team to achieve more.
					</p>

					<div className='mx-auto mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row'>
						<div className='flex flex-1 items-center gap-3 rounded-xl border border-indigo-500/50 bg-black px-4 py-3 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'>
							<span className='text-white/70'>✉</span>
							<input
								type='text'
								defaultValue='rubik@taskmanly'
								className='w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35'
							/>
						</div>

						<Button className='h-auto rounded-xl bg-indigo-500 px-6 py-3 text-white hover:bg-indigo-400'>
							Try for Free
						</Button>
					</div>
				</div>
			</div>

			<footer className='px-6 py-10 lg:px-10'>
				<div className='grid gap-10 lg:grid-cols-[1.15fr_1fr_1fr_1fr_1fr]'>
					<div>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white'>
								<LayoutGrid className='h-5 w-5' />
							</div>
							<span className='text-2xl font-semibold text-white'>
								Taskmanly
							</span>
						</div>

						<p className='mt-5 max-w-55 text-sm leading-7 text-white/55'>
							Welcome to a smarter way of managing tasks and
							products.
						</p>

						<div className='mt-5 flex flex-col gap-3'>
							<Image
								src='/assets/images/Download_on_the_App_Store_Badge.svg.webp'
								alt='Download on the App Store'
								width={125}
								height={38}
								className='h-auto w-31.25'
							/>
							<Image
								src='/assets/images/Google_Play_Store_badge_EN.svg.webp'
								alt='Get it on Google Play'
								width={125}
								height={38}
								className='h-auto w-31.25'
							/>
						</div>
					</div>

					{footerColumns.map((column) => (
						<div key={column.title}>
							<h3 className='text-sm font-semibold text-white'>
								{column.title}
							</h3>

							<div className='mt-4 space-y-2.5'>
								{column.links.map((link) => (
									<Link
										key={link}
										href='#'
										className='block text-sm text-white/55 transition hover:text-white'
									>
										{link}
									</Link>
								))}
							</div>
						</div>
					))}
				</div>

				<div className='mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between'>
					<div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45'>
						<span>© 2024 Taskmanly. All right reserved.</span>
						<Link href='#' className='transition hover:text-white'>
							Privacy Policy
						</Link>
						<Link href='#' className='transition hover:text-white'>
							Terms of Service
						</Link>
						<Link href='#' className='transition hover:text-white'>
							Manage Cookies
						</Link>
					</div>
				</div>
			</footer>
		</footer>
	);
};

export default Footer;
