import { Button } from "@/components/ui/button";
import { LayoutGrid, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerColumns = [
	{
		title: "Product",
		links: [
			"Home",
			"Pricing",
			"Enterprise",
			"Trust & Security",
			"Integrations",
			"Templates",
		],
	},
	{
		title: "Solutions",
		links: [
			"Project Management",
			"Agile Workflows",
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
			"Developer API",
			"Accessibility",
		],
	},
	{
		title: "Company",
		links: ["About Us", "Careers", "Press", "Customers", "Contact"],
	},
];

const Footer = () => {
	return (
		<footer className='mx-auto mt-32 max-w-6xl rounded-t-[48px] border border-white/10 border-b-0 bg-[#0d0d0f]'>
			<div className='border-b border-white/5 px-8 py-20 lg:px-16'>
				<div className='mx-auto max-w-3xl text-center'>
					<h2 className='text-4xl font-semibold tracking-tight text-white sm:text-5xl'>
						Ready to streamline?
					</h2>

					<p className='mx-auto mt-6 max-w-xl text-lg text-white/40'>
						Join over 40,000 teams building the future with
						Taskmanly. Start your free trial today.
					</p>

					<div className='mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row'>
						<div className='flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 transition-focus-within focus-within:border-indigo-500/50'>
							<Mail className='h-4 w-4 text-white/30' />
							<input
								type='email'
								placeholder='Enter your email'
								className='w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20'
							/>
						</div>

						<Button className='h-12 rounded-full bg-white px-8 font-semibold text-black hover:bg-white/90 active:scale-[0.98]'>
							Get Started
						</Button>
					</div>
				</div>
			</div>

			<div className='px-8 py-16 lg:px-16'>
				<div className='grid gap-12 lg:grid-cols-5'>
					<div className='lg:col-span-2'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-white/10'>
								<LayoutGrid className='h-5 w-5' />
							</div>
							<span className='text-2xl font-semibold tracking-tight text-white'>
								Taskmanly
							</span>
						</div>

						<p className='mt-6 max-w-xs text-sm leading-relaxed text-white/40'>
							The optimal solution for collaborative tasks across
							diverse functions. Built for modern teams.
						</p>

						<div className='mt-8 flex gap-4'>
							<Link
								href='#'
								className='transition-opacity hover:opacity-80'
							>
								<Image
									src='/assets/images/Download_on_the_App_Store_Badge.svg.webp'
									alt='Download on the App Store'
									width={120}
									height={36}
									className='h-9 w-auto'
								/>
							</Link>
							<Link
								href='#'
								className='transition-opacity hover:opacity-80'
							>
								<Image
									src='/assets/images/Google_Play_Store_badge_EN.svg.webp'
									alt='Get it on Google Play'
									width={120}
									height={36}
									className='h-9 w-auto'
								/>
							</Link>
						</div>
					</div>

					{footerColumns.map((column) => (
						<div key={column.title}>
							<h3 className='text-sm font-semibold text-white'>
								{column.title}
							</h3>

							<div className='mt-6 space-y-4'>
								{column.links.map((link) => (
									<Link
										key={link}
										href='#'
										className='block text-sm text-white/40 transition-colors hover:text-white'
									>
										{link}
									</Link>
								))}
							</div>
						</div>
					))}
				</div>

				<div className='mt-20 flex flex-col gap-6 border-t border-white/5 pt-8 lg:flex-row lg:items-center lg:justify-between'>
					<p className='text-xs text-white/30 font-mono'>
						© 2024 Taskmanly Inc. All rights reserved.
					</p>
					<div className='flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-white/30'>
						<Link href='#' className='hover:text-white transition-colors'>
							Privacy Policy
						</Link>
						<Link href='#' className='hover:text-white transition-colors'>
							Terms of Service
						</Link>
						<Link href='#' className='hover:text-white transition-colors'>
							Security
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
