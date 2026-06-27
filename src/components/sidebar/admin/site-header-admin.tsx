import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
	return (
		<header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border bg-card transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
			<div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
				<SidebarTrigger className='-ml-1 text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]' />
				<Separator
					orientation='vertical'
					className='mx-2 data-[orientation=vertical]:h-4'
				/>
				<div>
					<p className='text-sm font-semibold text-[#0F172A]'>
						Admin Console
					</p>
					<p className='text-xs text-[#64748B]'>
						Hệ thống vận hành và giám sát
					</p>
				</div>
			</div>
		</header>
	);
}
