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
		title: "Bảng Kanban",
		description: "Trực quan hóa công việc và tối ưu quy trình với các bảng kéo thả.",
		icon: <Columns className="h-5 w-5" />,
		href: "/#features",
	},
	{
		title: "Bản đồ tư duy",
		description: "Lên ý tưởng và kết nối ý tưởng một cách trực quan trước khi thực hiện.",
		icon: <Network className="h-5 w-5" />,
		href: "/#features",
	},
	{
		title: "Nhắn tin thời gian thực",
		description: "Trao đổi trực tiếp trên tác vụ mà không cần rời khỏi ứng dụng.",
		icon: <MessageSquare className="h-5 w-5" />,
		href: "/#features",
	},
	{
		title: "Danh sách kiểm tra",
		description: "Chia nhỏ các tác vụ phức tạp thành các tác vụ phụ dễ quản lý.",
		icon: <CheckSquare className="h-5 w-5" />,
		href: "/#features",
	},
];

const solutionsMenu: MegaMenuItemType[] = [
	{
		title: "Cho nhóm Phần mềm",
		description: "Lập kế hoạch Sprint, theo dõi lỗi, và quy trình Agile.",
		icon: <Box className="h-5 w-5" />,
		href: "/#solutions",
	},
	{
		title: "Cho Marketing",
		description: "Quản lý chiến dịch và lịch nội dung.",
		icon: <Zap className="h-5 w-5" />,
		href: "/#solutions",
	},
	{
		title: "Cho Sản phẩm",
		description: "Lộ trình, theo dõi tính năng, và lên kế hoạch ra mắt.",
		icon: <BarChart3 className="h-5 w-5" />,
		href: "/#solutions",
	},
];

const navItems = [
	{ label: "Tính năng", megaMenu: featuresMenu },
	{ label: "Giải pháp", megaMenu: solutionsMenu },
	{ label: "Tài nguyên", href: "/#resources" },
	{ label: "Doanh nghiệp", href: "/#enterprise" },
	{ label: "Mẫu", href: "/templates" },
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
					Liên hệ
				</Link>

				<ToggleMode />

				{user ? (
					<Link href={"/dashboard"}>
						<Button className='rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'>
							Bảng điều khiển
						</Button>
					</Link>
				) : (
					<div className='flex items-center gap-2'>
						<Link href={"/sign-in"}>
							<Button
								variant='ghost'
								className='rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground'
							>
								Đăng nhập
							</Button>
						</Link>

						<Link href={"/sign-up"}>
							<Button className='rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/90 active:scale-[0.98]'>
								Đăng ký
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
										href={item.href || "#"}
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
								Liên hệ
							</Link>
						</nav>

						<div className='mt-auto flex flex-col gap-3 pb-6'>
							{user ? (
								<Link href={"/dashboard"} onClick={() => setIsOpen(false)}>
									<Button className='w-full rounded-xl bg-primary py-6 font-semibold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'>
										Bảng điều khiển
									</Button>
								</Link>
							) : (
								<>
									<Link href={"/sign-in"} onClick={() => setIsOpen(false)}>
										<Button
											variant='outline'
											className='w-full rounded-xl py-6 font-medium text-foreground'
										>
											Đăng nhập
										</Button>
									</Link>
									<Link href={"/sign-up"} onClick={() => setIsOpen(false)}>
										<Button className='w-full rounded-xl bg-foreground py-6 font-semibold text-background hover:bg-foreground/90 active:scale-[0.98]'>
											Đăng ký
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
