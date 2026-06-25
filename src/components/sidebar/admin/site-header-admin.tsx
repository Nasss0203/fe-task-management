import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
	return (
		<header className='bg-background/80 supports-[backdrop-filter]:bg-background/70 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/70 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
			<div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
				<SidebarTrigger className='-ml-1' />
				<Separator
					orientation='vertical'
					className='mx-2 data-[orientation=vertical]:h-4'
				/>
				<div>
					<p className='text-sm font-semibold text-foreground'>
						Admin Console
					</p>
					<p className='text-xs text-muted-foreground'>
						Hệ thống vận hành và giám sát
					</p>
				</div>
				<div className='ml-auto flex items-center gap-2'>
					<Button
						variant='outline'
						asChild
						size='sm'
						className='hidden rounded-xl sm:flex'
					>
						<a
							href='https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard'
							rel='noopener noreferrer'
							target='_blank'
						>
							Design System
						</a>
					</Button>
				</div>
			</div>
		</header>
	);
}
