"use client";

import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLogout, useUser } from "@/features/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function CreatorAccountMenu() {
	const router = useRouter();
	const { user } = useUser();
	const logout = useLogout();

	if (!user) return null;

	const displayName = user.username || user.email;
	const initial = displayName.charAt(0).toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className='rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring'
				aria-label='Account menu'
			>
				<Avatar size='sm'>
					{user.avatarUrl && (
						<AvatarImage src={user.avatarUrl} alt={displayName} />
					)}
					<AvatarFallback className='text-xs'>{initial}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' sideOffset={8} className='w-60'>
				<DropdownMenuLabel className='font-normal'>
					<div className='truncate text-sm font-medium'>
						{displayName}
					</div>
					<div className='truncate text-xs text-muted-foreground'>
						{user.email}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => router.push("/dashboard")}>
					<ArrowLeft className='size-4' />
					Back to workspace
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					disabled={logout.isPending}
					onSelect={() => logout.mutate()}
				>
					<LogOut className='size-4' />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
