"use client";

import React from "react";

import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

import { DashboardHeader } from "@/widgets/dashboard-header";

import { SidebarTrigger } from "@/widgets/workspace-sidebar/ui/sidebar";

export interface BreadcrumbCrumb {
	label: string;
	href?: string;
}

interface HeaderWorkspaceProps {
	workspaceName?: string;
	pageTitle?: string;
	pageId?: string;
	rightAction?: React.ReactNode;
	customBreadcrumbs?: BreadcrumbCrumb[];
}

export function HeaderWorkspace({
	workspaceName,
	pageTitle,
	pageId,
	rightAction,
	customBreadcrumbs,
}: HeaderWorkspaceProps) {
	return (
		<header className='flex h-11 shrink-0 items-center gap-2'>
			<div className='flex min-w-0 flex-1 items-center gap-3.5 px-2.5'>
				<SidebarTrigger className='text-muted-foreground' />

				<Breadcrumb>
					<BreadcrumbList className='gap-1.5 text-[13.5px] sm:gap-1.5'>
						{customBreadcrumbs && customBreadcrumbs.length > 0 ? (
							customBreadcrumbs.map((crumb, index) => {
								const isLast = index === customBreadcrumbs.length - 1;
								return (
									<React.Fragment key={crumb.label + index}>
										<BreadcrumbItem>
											{isLast || !crumb.href ? (
												<BreadcrumbPage className='line-clamp-1 font-medium'>
													{crumb.label}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink asChild>
													<Link
														href={crumb.href}
														className='text-muted-foreground hover:text-foreground'
													>
														{crumb.label}
													</Link>
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
										{!isLast && (
											<BreadcrumbSeparator className='text-faint'>/</BreadcrumbSeparator>
										)}
									</React.Fragment>
								);
							})
						) : (
							<>
								{workspaceName && (
									<>
										<BreadcrumbItem>
											<span className='text-muted-foreground'>
												{workspaceName}
											</span>
										</BreadcrumbItem>

										{pageTitle && (
											<BreadcrumbSeparator className='text-faint'>/</BreadcrumbSeparator>
										)}
									</>
								)}

								{pageTitle && (
									<BreadcrumbItem>
										<BreadcrumbPage className='line-clamp-1 font-medium'>
											{pageTitle}
										</BreadcrumbPage>
									</BreadcrumbItem>
								)}
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className='ml-auto px-3.5'>
				{rightAction ?? <DashboardHeader pageId={pageId} />}
			</div>
		</header>
	);
}
