"use client";

import { PanelLeft } from "lucide-react";
import { useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import type { PublicSitePage } from "@/entities/public-site/model/public-site.types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import { Button } from "@/shared/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/ui/sheet";
import { Skeleton } from "@/shared/ui/skeleton";
import { PublicPageBlockList } from "./PublicPageBlockList";
import { PublicSiteSidebar } from "./PublicSiteSidebar";

export const DEFAULT_SIDEBAR_WIDTH = 224;
export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 360;
export const COLLAPSE_THRESHOLD = 120;

interface PublicPageProps {
	publicSite: PublicSitePage;
}

export function PublicPage({ publicSite }: PublicPageProps) {
	const { page, blocks, breadcrumbs, subdomain, path, capabilities } = publicSite;
	const canInteract = true;
	const canMutate = capabilities.can_update;
	const isMobile = useIsMobile();
	const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
	const [lastSidebarWidth, setLastSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isSidebarResizing, setIsSidebarResizing] = useState(false);
	const sidebarRef = useRef<HTMLElement>(null);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

	const toggleSidebar = () => {
		if (isSidebarCollapsed) {
			setSidebarWidth(lastSidebarWidth);
			setIsSidebarCollapsed(false);
			return;
		}

		setLastSidebarWidth(sidebarWidth);
		setIsSidebarCollapsed(true);
	};

	const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		setIsSidebarResizing(true);
	};

	const handleResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!isSidebarResizing || !sidebarRef.current) return;

		const left = sidebarRef.current.getBoundingClientRect().left;
		const nextWidth = event.clientX - left;
		setSidebarWidth(
			nextWidth < COLLAPSE_THRESHOLD
				? Math.max(0, nextWidth)
				: Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, nextWidth)),
		);
	};

	const handleResizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		setIsSidebarResizing(false);
		const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
		const releasedWidth = event.clientX - left;
		if (releasedWidth < COLLAPSE_THRESHOLD) {
			setIsSidebarCollapsed(true);
			setSidebarWidth(0);
			return;
		}

		const finalWidth = Math.min(
			MAX_SIDEBAR_WIDTH,
			Math.max(MIN_SIDEBAR_WIDTH, releasedWidth),
		);
		setLastSidebarWidth(finalWidth);
		setIsSidebarCollapsed(false);
		setSidebarWidth(finalWidth);
	};

	const handleToggleNavigation = () => {
		if (isMobile) {
			setMobileDrawerOpen((prev) => !prev);
		} else {
			toggleSidebar();
		}
	};

	return (
		<div
			className='flex min-h-screen w-full bg-background text-foreground'
			data-can-interact={canInteract}
			data-can-mutate={canMutate}
		>
			{/* Desktop Sidebar */}
			{!isMobile ? (
				<aside
					ref={sidebarRef}
					className='relative sticky top-0 h-screen shrink-0 overflow-x-hidden overflow-y-auto border-r border-border bg-sidebar/50 backdrop-blur-xs'
					style={{
						width: isSidebarCollapsed ? 0 : sidebarWidth,
						transition: isSidebarResizing ? "none" : "width 300ms ease-in-out",
					}}
					data-testid='public-desktop-sidebar'
				>
					<div
						className='flex h-full shrink-0 flex-col overflow-hidden transition-[transform,opacity] duration-300 ease-in-out'
						style={{
							width: isSidebarCollapsed ? lastSidebarWidth : sidebarWidth,
							transform: isSidebarCollapsed ? "translateX(-12px)" : "translateX(0)",
							opacity: isSidebarCollapsed ? 0 : 1,
						}}
					>
					<div className='flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4'>
						<span className='text-sm font-semibold tracking-tight'>Pages</span>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='size-7 text-muted-foreground hover:text-foreground'
							aria-label='Close sidebar'
							onClick={toggleSidebar}
						>
							<PanelLeft className='size-4' />
						</Button>
					</div>
					<PublicSiteSidebar
						subdomain={subdomain}
						currentPath={path}
						onNavigate={() => {}}
					/>
					</div>
					<div
						role='separator'
						aria-orientation='vertical'
						aria-label='Resize page navigation'
						data-testid='public-sidebar-resize-handle'
						className='absolute top-0 right-0 z-30 h-full w-1.5 cursor-col-resize touch-none'
						onPointerDown={handleResizeStart}
						onPointerMove={handleResizeMove}
						onPointerUp={handleResizeEnd}
						onPointerCancel={handleResizeEnd}
					/>
				</aside>
			) : null}

			{/* Mobile Drawer */}
			{isMobile ? (
				<Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
					<SheetContent
						side='left'
						className='flex w-72 flex-col p-0'
						data-testid='public-mobile-sheet'
					>
						<SheetHeader className='border-b border-border p-4'>
							<SheetTitle className='text-sm font-semibold'>Pages</SheetTitle>
							<SheetDescription className='sr-only'>
								Site navigation menu
							</SheetDescription>
						</SheetHeader>
						<div className='flex-1 overflow-y-auto'>
							<PublicSiteSidebar
								subdomain={subdomain}
								currentPath={path}
								onNavigate={() => setMobileDrawerOpen(false)}
							/>
						</div>
					</SheetContent>
				</Sheet>
			) : null}

			{/* Main Content Area */}
			<div className='flex min-w-0 flex-1 flex-col'>
				{/* Top bar with Navigation Trigger & Breadcrumbs */}
				<header className='sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/40 bg-background/80 px-5 backdrop-blur-xs'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						aria-label='Toggle navigation'
						className='size-8 shrink-0 text-muted-foreground hover:text-foreground'
						onClick={isMobile ? handleToggleNavigation : toggleSidebar}
					>
						<PanelLeft className='size-4' />
					</Button>

					{breadcrumbs?.length ? (
						<Breadcrumb>
							<BreadcrumbList>
								{breadcrumbs.map((crumb, index) => (
									<Fragment key={`${crumb.page_id}-${index}`}>
										{index > 0 ? <BreadcrumbSeparator /> : null}
										<BreadcrumbItem>
											{index === breadcrumbs.length - 1 ? (
												<BreadcrumbPage className='font-medium'>
													{crumb.title}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink href={crumb.path}>
													{crumb.title}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					) : null}
				</header>

				{/* Page Content */}
				<main className='flex-1 p-5'>
					<div className='w-full min-w-0'>
						{page.cover_url ? (
							<div className='h-56 w-full overflow-hidden sm:h-72'>
								{/* Public cover URLs can use arbitrary backend-approved hosts. */}
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={page.cover_url}
									alt=''
									className='h-full w-full object-cover'
								/>
							</div>
						) : null}

						<div className='mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 lg:px-12'>
							<header className='space-y-4'>
								{page.icon ? (
									<div
										className='text-5xl leading-none'
										aria-hidden='true'
									>
										{page.icon}
									</div>
								) : null}

								<h1 className='break-words text-4xl font-bold tracking-tight sm:text-5xl'>
									{page.title || "Untitled"}
								</h1>
							</header>

							<div className='mt-12'>
								<PublicPageBlockList blocks={blocks} />
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export function PublicPageSkeleton() {
	return (
		<div
			className='mx-auto w-full max-w-4xl space-y-10 px-6 py-12 sm:px-10 lg:px-12'
			role='status'
			aria-label='Loading public page'
		>
			<div className='space-y-4'>
				<Skeleton className='size-12 rounded-lg' />
				<Skeleton className='h-11 w-3/5 max-w-lg' />
			</div>
			<div className='space-y-3'>
				<Skeleton className='h-5 w-full' />
				<Skeleton className='h-5 w-11/12' />
				<Skeleton className='h-5 w-4/5' />
			</div>
		</div>
	);
}
