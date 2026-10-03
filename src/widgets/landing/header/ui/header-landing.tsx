"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	ArrowRight,
	Database,
	FileText,
	Globe,
	LayoutGrid,
	LayoutTemplate,
	Menu,
	Sparkles,
	Users,
} from "lucide-react";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import ThemeToggle from "@/shared/ui/dark-mode";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import HeaderMegaMenu, { MegaMenuItemType } from "./header-mega-menu";

const productMegaMenuItems: MegaMenuItemType[] = [
	{
		title: "Pages & Notes",
		description: "Rich block documents with nested pages and markdown.",
		icon: <FileText className='h-5 w-5 text-blue-500' />,
		href: "/features#pages-notes",
	},
	{
		title: "Database & Views",
		description: "Relational data with Table, Board, List, and Calendar views.",
		icon: <Database className='h-5 w-5 text-purple-500' />,
		href: "/features#database-views",
	},
	{
		title: "Team Collaboration",
		description: "Squad teamspaces with granular role-based permissions.",
		icon: <Users className='h-5 w-5 text-pink-500' />,
		href: "/features#team-collaboration",
	},
	{
		title: "Starter Templates",
		description: "Curated workspace templates for docs, wikis, and databases.",
		icon: <LayoutTemplate className='h-5 w-5 text-teal-500' />,
		href: "/templates",
	},
	{
		title: "Publish to Web",
		description: "Convert pages into public sites with custom subdomains.",
		icon: <Globe className='h-5 w-5 text-emerald-500' />,
		href: "/publish",
	},
	{
		title: "AI Assistant",
		description: "Contextual AI to draft docs, summarize, and structure knowledge.",
		icon: <Sparkles className='h-5 w-5 text-amber-500' />,
		href: "/ai",
	},
];

export const HeaderLanding = () => {
	const { user } = useUser();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const isLinkActive = (href: string) => {
		if (href === "/") return pathname === "/";
		return pathname.startsWith(href);
	};

	return (
		<header className='sticky top-4 z-50 mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-border/80 bg-background/80 px-5 py-2.5 backdrop-blur-xl shadow-xs transition-all'>
			{/* Logo */}
			<Link href='/' className='flex items-center gap-2.5 shrink-0'>
				<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs'>
					<LayoutGrid className='h-5 w-5' />
				</div>
				<span className='text-base font-bold tracking-tight text-foreground'>
					Taskmanly
				</span>
			</Link>

			{/* Desktop Navigation */}
			<nav className='hidden items-center gap-1 lg:flex'>
				<HeaderMegaMenu label='Product' items={productMegaMenuItems} />

				<Link
					href='/features'
					className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
						isLinkActive("/features")
							? "text-foreground font-semibold bg-muted/60"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Features
				</Link>

				<Link
					href='/templates'
					className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
						isLinkActive("/templates")
							? "text-foreground font-semibold bg-muted/60"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Templates
				</Link>

				<Link
					href='/ai'
					className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${
						isLinkActive("/ai")
							? "text-foreground font-semibold bg-muted/60"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<span>AI</span>
					<span className='rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 leading-none'>
						New
					</span>
				</Link>

				<Link
					href='/pricing'
					className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
						isLinkActive("/pricing")
							? "text-foreground font-semibold bg-muted/60"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Pricing
				</Link>
			</nav>

			{/* Desktop Actions */}
			<div className='hidden items-center gap-3 md:flex'>
				<ThemeToggle />

				{user ? (
					<Link href='/dashboard'>
						<Button className='rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98]'>
							Go to Workspace
							<ArrowRight className='ml-1.5 h-3.5 w-3.5' />
						</Button>
					</Link>
				) : (
					<div className='flex items-center gap-2'>
						<Link href='/sign-in'>
							<Button
								variant='ghost'
								className='rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60'
							>
								Log in
							</Button>
						</Link>

						<Link href='/sign-up'>
							<Button className='rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98]'>
								Get started
							</Button>
						</Link>
					</div>
				)}
			</div>

			{/* Mobile Hamburger & Actions */}
			<div className='flex items-center gap-2 md:hidden'>
				<ThemeToggle />

				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant='ghost' size='icon' className='h-9 w-9 rounded-full' aria-label='Open Menu'>
							<Menu className='h-5 w-5' />
						</Button>
					</SheetTrigger>

					<SheetContent side='right' className='flex flex-col gap-6 pt-12 px-6 w-[300px] sm:w-[350px] border-l border-border bg-background shadow-2xl overflow-y-auto'>
						<div className='flex items-center gap-2.5 pb-4 border-b border-border/60'>
							<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold'>
								<LayoutGrid className='h-4 w-4' />
							</div>
							<span className='text-base font-bold text-foreground'>Taskmanly</span>
						</div>

						{/* Mobile Nav links */}
						<div className='flex flex-col space-y-1 text-sm font-medium'>
							<Link
								href='/features'
								onClick={() => setIsOpen(false)}
								className={`px-3 py-2.5 rounded-xl transition-colors ${
									isLinkActive("/features")
										? "bg-secondary text-foreground font-semibold"
										: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
								}`}
							>
								Features
							</Link>

							<Link
								href='/templates'
								onClick={() => setIsOpen(false)}
								className={`px-3 py-2.5 rounded-xl transition-colors ${
									isLinkActive("/templates")
										? "bg-secondary text-foreground font-semibold"
										: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
								}`}
							>
								Templates
							</Link>

							<Link
								href='/ai'
								onClick={() => setIsOpen(false)}
								className={`px-3 py-2.5 rounded-xl transition-colors flex items-center justify-between ${
									isLinkActive("/ai")
										? "bg-secondary text-foreground font-semibold"
										: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
								}`}
							>
								<span>AI Assistant</span>
								<span className='text-[10px] bg-amber-500/15 text-amber-600 font-bold px-1.5 py-0.5 rounded-full'>
									New
								</span>
							</Link>

							<Link
								href='/publish'
								onClick={() => setIsOpen(false)}
								className={`px-3 py-2.5 rounded-xl transition-colors ${
									isLinkActive("/publish")
										? "bg-secondary text-foreground font-semibold"
										: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
								}`}
							>
								Web Publishing
							</Link>

							<Link
								href='/pricing'
								onClick={() => setIsOpen(false)}
								className={`px-3 py-2.5 rounded-xl transition-colors ${
									isLinkActive("/pricing")
										? "bg-secondary text-foreground font-semibold"
										: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
								}`}
							>
								Pricing
							</Link>
						</div>

						{/* Mobile Auth action buttons */}
						<div className='mt-auto flex flex-col gap-2.5 pt-6 border-t border-border/60'>
							{user ? (
								<Link href='/dashboard' onClick={() => setIsOpen(false)}>
									<Button className='w-full rounded-xl bg-primary h-11 font-semibold text-primary-foreground shadow-xs'>
										Go to Workspace
									</Button>
								</Link>
							) : (
								<>
									<Link href='/sign-in' onClick={() => setIsOpen(false)}>
										<Button
											variant='outline'
											className='w-full rounded-xl h-11 font-medium border-border/80'
										>
											Log in
										</Button>
									</Link>
									<Link href='/sign-up' onClick={() => setIsOpen(false)}>
										<Button className='w-full rounded-xl bg-primary h-11 font-semibold text-primary-foreground shadow-xs'>
											Get started free
										</Button>
									</Link>
								</>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
};

export default HeaderLanding;
