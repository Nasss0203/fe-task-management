import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { AppSidebarAdmin } from "@/components/sidebar/admin/app-sidebar-admin";
import { SiteHeader } from "@/components/sidebar/admin/site-header-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<AdminRouteGuard>
			<SidebarProvider
				className='admin-light-theme'
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AppSidebarAdmin variant='sidebar' />
				<SidebarInset className='min-w-0'>
					<SiteHeader />
					<div className='flex flex-1 flex-col min-w-0'>
						<div className='@container/main flex flex-1 flex-col gap-2 min-w-0'>
							<div className='flex flex-col gap-4 p-4 min-w-0'>
								{children}
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</AdminRouteGuard>
	);
};

export default layout;
