import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ToggleMode } from "@/components/toggle";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
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
				<header className='flex w-full h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
					<div className='flex items-center justify-between flex-1'>
						<div className='flex items-center gap-2 px-4'>
							<SidebarTrigger className='-ml-1' />
							<Separator
								orientation='vertical'
								className='mr-2 data-[orientation=vertical]:h-4'
							/>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink href='#'>
											Build Your Application
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>
											Data Fetching
										</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className='flex items-center gap-2 px-4'>
							<ToggleMode></ToggleMode>
						</div>
					</div>
				</header>
				<div className='flex flex-1 flex-col gap-4 bg-sidebar/30 p-4 pt-0 md:p-6'>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default layout;
