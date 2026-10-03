import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export const Footer = () => {
	return (
		<footer className='border-t border-border/80 bg-card/60 backdrop-blur-sm mt-20 sm:mt-28'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16'>
				<div className='grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12'>
					{/* Brand Column */}
					<div className='col-span-2 md:col-span-1 space-y-3.5'>
						<Link href='/' className='flex items-center gap-2.5'>
							<div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs'>
								<LayoutGrid className='h-4 w-4' />
							</div>
							<span className='text-lg font-bold tracking-tight text-foreground'>
								Taskmanly
							</span>
						</Link>
						<p className='text-xs text-muted-foreground leading-relaxed max-w-xs'>
							The connected workspace for flexible documents, structured databases, web publishing, and AI collaboration.
						</p>
					</div>

					{/* Column 1: Product */}
					<div className='space-y-3'>
						<div className='text-xs font-semibold uppercase tracking-wider text-foreground'>
							Product
						</div>
						<ul className='space-y-2 text-xs text-muted-foreground'>
							<li>
								<Link href='/features' className='hover:text-foreground transition-colors'>
									Features
								</Link>
							</li>
							<li>
								<Link href='/templates' className='hover:text-foreground transition-colors'>
									Templates
								</Link>
							</li>
							<li>
								<Link href='/ai' className='hover:text-foreground transition-colors'>
									AI Assistant
								</Link>
							</li>
							<li>
								<Link href='/publish' className='hover:text-foreground transition-colors'>
									Web Publishing
								</Link>
							</li>
						</ul>
					</div>

					{/* Column 2: Resources */}
					<div className='space-y-3'>
						<div className='text-xs font-semibold uppercase tracking-wider text-foreground'>
							Resources
						</div>
						<ul className='space-y-2 text-xs text-muted-foreground'>
							<li>
								<Link href='/pricing' className='hover:text-foreground transition-colors'>
									Pricing Plans
								</Link>
							</li>
							<li>
								<Link href='/templates' className='hover:text-foreground transition-colors'>
									Template Gallery
								</Link>
							</li>
							<li>
								<Link href='/features#database-views' className='hover:text-foreground transition-colors'>
									Database Engine
								</Link>
							</li>
							<li>
								<Link href='/features#team-collaboration' className='hover:text-foreground transition-colors'>
									Teamspaces & Roles
								</Link>
							</li>
						</ul>
					</div>

					{/* Column 3: Account */}
					<div className='space-y-3'>
						<div className='text-xs font-semibold uppercase tracking-wider text-foreground'>
							Account
						</div>
						<ul className='space-y-2 text-xs text-muted-foreground'>
							<li>
								<Link href='/sign-in' className='hover:text-foreground transition-colors'>
									Log in
								</Link>
							</li>
							<li>
								<Link href='/sign-up' className='hover:text-foreground transition-colors'>
									Get started free
								</Link>
							</li>
							<li>
								<Link href='/dashboard' className='hover:text-foreground transition-colors'>
									Workspace Dashboard
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className='mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground'>
					<div>
						© {new Date().getFullYear()} Taskmanly. All rights reserved.
					</div>
					<div className='flex items-center gap-6'>
						<span className='hover:text-foreground cursor-pointer'>Privacy</span>
						<span className='hover:text-foreground cursor-pointer'>Terms</span>
						<span className='hover:text-foreground cursor-pointer'>Security</span>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
