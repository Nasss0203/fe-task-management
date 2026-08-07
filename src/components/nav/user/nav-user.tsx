"use client";

import {
	BadgeCheck,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	Sparkles,
	ShieldAlert,
} from "lucide-react";

import { isSystemAdmin } from "@/lib/auth/system-role";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useUser } from "@/features/auth/hooks/useUser";
import { usePlan } from "@/features/billing/hooks/usePlan";
import { PlanName } from "@/services/billing/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useRouter } from "next/navigation";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { user } = useUser();
	const router = useRouter();
	const logout = useLogout();
	const { currentWorkspaceId } = useProjectSelectionStore();

	const { planInfo } = usePlan();
	const dataPlan = planInfo.data;
	const upgradeHref = "/dashboard/billing/upgrade";

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
						>
							<Avatar className='h-8 w-8 rounded-lg'>
								<AvatarImage
									src={user?.avatarUrl}
									alt={user?.username}
								/>
								<AvatarFallback className='rounded-lg'>
									CN
								</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>
									{user?.username}
								</span>
								<span className='truncate text-xs'>
									{user?.email}
								</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						side={isMobile ? "bottom" : "right"}
						align='end'
						sideOffset={4}
					>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
								<Avatar className='h-8 w-8 rounded-lg'>
									<AvatarImage
										src={user?.avatarUrl}
										alt={user?.username}
									/>
									<AvatarFallback className='rounded-lg'>
										CN
									</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>
										{user?.username}
									</span>
									<span className='truncate text-xs'>
										{user?.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{dataPlan?.data.plan.name === PlanName.FREE ? (
							<>
								<DropdownMenuGroup>
									<DropdownMenuItem
										onSelect={() => router.push(upgradeHref)}
									>
										<Sparkles />
										Nâng cấp Pro
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
							</>
						) : null}
						{isSystemAdmin(user) && (
							<>
								<DropdownMenuGroup>
									<DropdownMenuItem
										onSelect={() => router.push("/admin")}
									>
										<ShieldAlert />
										Admin Dashboard
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
							</>
						)}

						<DropdownMenuItem
							disabled={logout.isPending}
							onSelect={() => logout.mutate()}
						>
							<LogOut />
							Đăng xuất
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
