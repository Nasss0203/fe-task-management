"use client";
import { useUser } from "@/features/auth/hooks/useUser";
import {
	BarChart3,
	Box,
	CheckSquare,
	ChevronDown,
	Columns,
	LayoutGrid,
	Menu,
	MessageSquare,
	Network,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import ToggleMode from "@/components/toggle/dark-mode";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import HeaderMegaMenu, { MegaMenuItemType } from "./HeaderMegaMenu";

const featuresMenu: MegaMenuItemType[] = [
	{
		title: "Kanban Boards",
		description: "Visualize work and optimize flow with drag-and-drop boards.",
		icon: <Columns className="h-5 w-5" />,
		href: "/#features",
	},
	{
		title: "Mindmaps",
		description: "Brainstorm and connect ideas visually before execution.",
		icon: <Network className="h-5 w-5" />,
		href: "/#features",
	},
	{
		title: "Real-time Chat",
		description: "Communicate directly on tasks without leaving the app.",
		icon: <MessageSquare className="h-5 w-5" />,
		href: "/#features",
	},
	{
		title: "Checklists",
		description: "Break complex tasks into manageable sub-tasks.",
		icon: <CheckSquare className="h-5 w-5" />,
		href: "/#features",
	},
];

const solutionsMenu: MegaMenuItemType[] = [
	{
		title: "For Software Teams",
		description: "Sprint planning, bug tracking, and agile workflows.",
		icon: <Box className="h-5 w-5" />,
		href: "/#solutions",
	},
	{
		title: "For Marketing",
		description: "Campaign management and content calendars.",
		icon: <Zap className="h-5 w-5" />,
		href: "/#solutions",
	},
	{
		title: "For Product",
		description: "Roadmaps, feature tracking, and release planning.",
		icon: <BarChart3 className="h-5 w-5" />,
		href: "/#solutions",
	},
];

const navItems = [
	{ label: "Features", megaMenu: featuresMenu },
	{ label: "Solutions", megaMenu: solutionsMenu },
	{ label: "Resources", href: "/#resources" },
	{ label: "Enterprise", href: "/#enterprise" },
	{ label: "Templates", href: "/templates" },
];

const HeaderLanding = () => {
	const { user } = useUser();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const isLinkActive = (href?: string) => {
		if (!href) return false;
		if (href === "/") return pathname === "/";
		return pathname.startsWith(href) && href !== "/#";
	};

	return (
		<header className='sticky top-4 z-50 mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-border bg-background/70 px-6 py-3 backdrop-blur-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000'>
			<Link href='/' className='flex items-center gap-2 shrink-0'>
				<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1 ring-border'>
					<LayoutGrid className='h-5 w-5 text-foreground' />
				</div>
				<span className='text-base font-semibold tracking-tight'>
					Taskmanly
				</span>
			</Link>

			{/* Desktop Navigation */}
			<nav className='hidden items-center gap-8 lg:flex'>
				{navItems.map((item) => {
					if (item.megaMenu) {
						return (
							<HeaderMegaMenu
								key={item.label}
								label={item.label}
								items={item.megaMenu}
							/>
						);
					}

					const active = isLinkActive(item.href);
					return (
						<Link
							key={item.label}
							href={item.href!}
							className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground py-4 ${
								active ? "text-foreground" : "text-muted-foreground"
							}`}
						>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			{/* Desktop Actions */}
			<div className='hidden items-center gap-4 md:flex'>
				<Link
					href='/contact'
					className={`text-sm font-medium transition-colors hover:text-foreground ${
						isLinkActive("/contact") ? "text-foreground" : "text-muted-foreground"
					}`}
				>
					Contact Sales
				</Link>

				<ToggleMode />

				{user ? (
					<Link href={"/dashboard"}>
						<Button className='rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'>
							Dashboard
						</Button>
					</Link>
				) : (
					<div className='flex items-center gap-2'>
						<Link href={"/sign-in"}>
							<Button
								variant='ghost'
								className='rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground'
							>
								Log In
							</Button>
						</Link>

						<Link href={"/sign-up"}>
							<Button className='rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/90 active:scale-[0.98]'>
								Register
							</Button>
						</Link>
					</div>
				)}
			</div>

			{/* Mobile Actions & Menu */}
			<div className='flex items-center gap-3 md:hidden'>
				<ToggleMode />
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant='ghost' size='icon' className='h-9 w-9 shrink-0'>
							<Menu className='h-5 w-5' />
							<span className='sr-only'>Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side='right' className='flex flex-col gap-6 pt-12 w-80'>
						<nav className='flex flex-col gap-4'>
							{navItems.map((item) => {
								const active = isLinkActive(item.href);
								return (
									<Link
										key={item.label}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`text-lg font-medium transition-colors hover:text-foreground ${
											active ? "text-foreground" : "text-muted-foreground"
										}`}
									>
										{item.label}
									</Link>
								);
							})}
							<Link
								href='/contact'
								onClick={() => setIsOpen(false)}
								className={`text-lg font-medium transition-colors hover:text-foreground mt-2 ${
									isLinkActive("/contact") ? "text-foreground" : "text-muted-foreground"
								}`}
							>
								Contact Sales
							</Link>
						</nav>

						<div className='mt-auto flex flex-col gap-3 pb-6'>
							{user ? (
								<Link href={"/dashboard"} onClick={() => setIsOpen(false)}>
									<Button className='w-full rounded-xl bg-primary py-6 font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'>
										Dashboard
									</Button>
								</Link>
							) : (
								<>
									<Link href={"/sign-in"} onClick={() => setIsOpen(false)}>
										<Button
											variant='outline'
											className='w-full rounded-xl py-6 font-medium text-foreground'
										>
											Log In
										</Button>
									</Link>
									<Link href={"/sign-up"} onClick={() => setIsOpen(false)}>
										<Button className='w-full rounded-xl bg-foreground py-6 font-semibold text-background hover:bg-foreground/90 active:scale-[0.98]'>
											Register
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
