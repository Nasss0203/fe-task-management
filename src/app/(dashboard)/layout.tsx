import { AppSidebar } from "@/shared/ui/app-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/shared/ui/breadcrumb";
import { NavActions } from "@/shared/ui/nav-actions";
import { Separator } from "@/shared/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/shared/ui/sidebar";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className='flex h-14 shrink-0 items-center gap-2'>
					<div className='flex flex-1 items-center gap-2 px-3'>
						<SidebarTrigger />
						<Separator
							orientation='vertical'
							className='mr-2 data-[orientation=vertical]:h-4'
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbPage className='line-clamp-1'>
										Project Management & Task Tracking
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
					<div className='ml-auto px-3'>
						<NavActions />
					</div>
				</header>
				<div className='flex flex-1 flex-col gap-4 px-4 py-10'>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default layout;
