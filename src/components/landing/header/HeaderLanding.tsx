"use client";
import { useUser } from "@/features/auth/hooks/useUser";
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
	const { user } = useUser();
	return (
		<header className='mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border bg-background/50 px-6 py-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000'>
			<Link href='/' className='flex items-center gap-2'>
				<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1 ring-border'>
					<LayoutGrid className='h-5 w-5 text-foreground' />
				</div>
				<span className='text-base font-semibold tracking-tight'>
					Taskmanly
				</span>
			</Link>

			<nav className='hidden items-center gap-8 lg:flex'>
				{navItems.map((item) => (
					<Link
						key={item.label}
						href={item.href}
						className='flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
					>
						<span>{item.label}</span>
						{item.label !== "Templates" && (
							<ChevronDown className='h-3.5 w-3.5 opacity-50' />
						)}
					</Link>
				))}
			</nav>

			<div className='flex items-center gap-4'>
				<Link
					href='/contact'
					className='hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline-block'
				>
					Contact Sales
				</Link>

				{user ? (
					<Link href={"dashboard"}>
						<Button className='rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'>
							Dashboard
						</Button>
					</Link>
				) : (
					<div className='flex items-center gap-2'>
						<Link href={"sign-in"}>
							<Button
								variant='ghost'
								className='rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground'
							>
								Log In
							</Button>
						</Link>

						<Link href={"sign-up"}>
							<Button className='rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/90 active:scale-[0.98]'>
								Register
							</Button>
						</Link>
					</div>
				)}
			</div>
		</header>
	);
};

export default HeaderLanding;
