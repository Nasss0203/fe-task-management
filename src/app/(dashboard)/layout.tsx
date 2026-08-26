import { AppSidebar } from "@/widgets/workspace-sidebar";
import { HeaderWorkspaceContainer } from "@/widgets/workspace-sidebar/ui/header-workspace-container";
import {
	SidebarInset,
	SidebarProvider,
} from "@/widgets/workspace-sidebar/ui/sidebar";

import React from "react";

const layout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='min-w-0 overflow-hidden'>
				<HeaderWorkspaceContainer />

				<main className='flex min-w-0 max-w-full flex-1 flex-col overflow-hidden py-10'>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default layout;
