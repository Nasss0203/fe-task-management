import { AppSidebarUser } from "@/components/sidebar/user/app-sidebar-user";
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
		<SidebarProvider className='h-svh overflow-hidden'>
			<AppSidebarUser />
			<SidebarInset className='h-svh min-h-0 min-w-0 w-svw max-w-svw overflow-hidden md:w-full md:max-w-full bg-background'>
				<header className='flex w-full h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10'>
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
											Task management
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className='hidden md:block' />
									<BreadcrumbItem>
										<BreadcrumbPage>
											Bảng điều khiển
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
				<div className='flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-4 overflow-x-visible overflow-y-auto px-4 pt-3 md:px-6 xl:px-10'>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default layout;
