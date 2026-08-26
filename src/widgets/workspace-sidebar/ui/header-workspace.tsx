"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/shared/ui/breadcrumb";

import { Separator } from "@/shared/ui/separator";
import { DashboardHeader } from "@/widgets/dashboard-header";
import { SidebarTrigger } from "@/widgets/workspace-sidebar/ui/sidebar";

interface HeaderWorkspaceProps {
	workspaceName?: string;
	pageTitle?: string;
}

export function HeaderWorkspace({
	workspaceName,
	pageTitle,
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
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<div className='ml-auto px-3'>
				<DashboardHeader />
			</div>
		</header>
	);
}
