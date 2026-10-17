import type { ReactNode } from "react";

import {
	SidebarInset,
	SidebarProvider,
} from "@/widgets/workspace-sidebar/ui/sidebar";

import { CreatorHeader } from "./creator-header";
import { CreatorSidebar } from "./creator-sidebar";

export function CreatorLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<CreatorSidebar />
			<SidebarInset className='min-w-0'>
				<CreatorHeader />
				<div className='mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-10 md:py-10'>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
