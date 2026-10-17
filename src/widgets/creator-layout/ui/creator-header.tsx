"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Fragment } from "react";

import { useTemplateDetail } from "@/entities/template";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";
import ThemeToggle from "@/shared/ui/dark-mode";
import { Separator } from "@/shared/ui/separator";
import { SidebarTrigger } from "@/widgets/workspace-sidebar/ui/sidebar";

import { getActiveCreatorNavItem } from "../model/creator-nav";
import { CreatorAccountMenu } from "./creator-account-menu";

interface Crumb {
	label: string;
	href?: string;
}

export function CreatorHeader() {
	const pathname = usePathname();
	const { templateId } = useParams<{ templateId?: string }>();
	const navItem = getActiveCreatorNavItem(pathname);
	// Shares the cache with the detail page, so this adds no extra request.
	const { data: template } = useTemplateDetail(templateId ?? "", {
		enabled: Boolean(templateId),
	});

	const crumbs: Crumb[] = [{ label: "Creator Studio", href: "/creator" }];
	if (navItem) {
		crumbs.push({ label: navItem.title, href: navItem.href });
	}
	if (templateId) {
		crumbs.push({
			label: template?.name ?? "Template",
			href: `/creator/templates/${templateId}`,
		});
	}
	if (pathname.endsWith("/listing")) {
		crumbs.push({ label: "Listing" });
	}

	return (
		<header className='sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-4'>
			<SidebarTrigger />
			<Separator
				orientation='vertical'
				className='mr-1 data-[orientation=vertical]:h-4'
			/>

			<Breadcrumb className='min-w-0 flex-1'>
				<BreadcrumbList className='flex-nowrap'>
					{crumbs.map((crumb, index) => {
						const isLast = index === crumbs.length - 1;
						// On mobile only the current page is shown.
						const mobile = isLast ? "min-w-0" : "hidden sm:inline-flex";

						return (
							<Fragment key={crumb.label + index}>
								{index > 0 && (
									<BreadcrumbSeparator className='hidden sm:block' />
								)}
								<BreadcrumbItem className={mobile}>
									{isLast || !crumb.href ? (
										<BreadcrumbPage className='truncate font-medium'>
											{crumb.label}
										</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link href={crumb.href}>{crumb.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</Fragment>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>

			<div className='flex shrink-0 items-center gap-2'>
				<ThemeToggle className='size-8 rounded-lg' />
				<CreatorAccountMenu />
			</div>
		</header>
	);
}
