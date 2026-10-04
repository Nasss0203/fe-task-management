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

import { Separator } from "@/shared/ui/separator";

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
		<header className='flex h-10 shrink-0 items-center gap-2'>
			<div className='flex flex-1 items-center gap-2 px-3'>
				<SidebarTrigger />

				<Separator
					orientation='vertical'
					className='mr-2 data-[orientation=vertical]:h-4'
				/>

				<Breadcrumb>
					<BreadcrumbList>
						{customBreadcrumbs && customBreadcrumbs.length > 0 ? (
							customBreadcrumbs.map((crumb, index) => {
								const isLast = index === customBreadcrumbs.length - 1;
								return (
									<React.Fragment key={crumb.label + index}>
										<BreadcrumbItem>
											{isLast || !crumb.href ? (
												<BreadcrumbPage className='line-clamp-1 text-xs font-medium'>
													{crumb.label}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink asChild>
													<Link
														href={crumb.href}
														className='text-xs text-muted-foreground hover:text-foreground'
													>
														{crumb.label}
													</Link>
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
										{!isLast && <BreadcrumbSeparator />}
									</React.Fragment>
								);
							})
						) : (
							<>
								{workspaceName && (
									<>
										<BreadcrumbItem>
											<span className='text-xs text-muted-foreground'>
												{workspaceName}
											</span>
										</BreadcrumbItem>

										{pageTitle && <BreadcrumbSeparator />}
									</>
								)}

								{pageTitle && (
									<BreadcrumbItem>
										<BreadcrumbPage className='line-clamp-1 text-xs font-medium'>
											{pageTitle}
										</BreadcrumbPage>
									</BreadcrumbItem>
								)}
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className='ml-auto px-3'>
				{rightAction ?? <DashboardHeader pageId={pageId} />}
			</div>
		</header>
	);
}
