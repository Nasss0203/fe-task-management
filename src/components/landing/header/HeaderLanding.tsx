import { ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "../../ui/button";
const navItems = [
	{ label: "Features", href: "#" },
	{ label: "Solutions", href: "#" },
	{ label: "Resources", href: "#" },
	{ label: "Enterprise", href: "#" },
	{ label: "Templates", href: "/templates" },
];

const HeaderLanding = () => {
	return (
		<header className='mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md'>
			<Link href='/' className='flex items-center gap-2'>
				<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10'>
					<LayoutGrid className='h-4 w-4 text-white' />
				</div>
				<span className='text-sm font-semibold tracking-wide'>
					Taskmanly
				</span>
			</Link>

			<nav className='hidden items-center gap-7 lg:flex'>
				{navItems.map((item) => (
					<Link
						key={item.label}
						href={item.href}
						className='flex items-center gap-1 text-sm text-white/70 transition hover:text-white'
					>
						<span>{item.label}</span>
						{item.label !== "Templates" && (
							<ChevronDown className='h-4 w-4' />
						)}
					</Link>
				))}
			</nav>

			<div className='flex items-center gap-3'>
				<Link
					href='#'
					className='hidden text-sm text-white/70 transition hover:text-white md:inline-block'
				>
					Contact Sales
				</Link>

				<Button
					variant='outline'
					className='border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white'
				>
					Log In
				</Button>

				<Button className='bg-indigo-500 text-white hover:bg-indigo-400'>
					Get Started
				</Button>
			</div>
		</header>
	);
};

export default HeaderLanding;
