"use client";

import {
	ArrowUpCircle,
	Check,
	ChevronDown,
	LogOut,
	Mail,
	Plus,
	Settings as SettingsIcon,
	UserPlus,
} from "lucide-react";
import * as React from "react";

import {
	SettingsDialog,
	useSettingsDialog,
} from "@/features/workspace-settings";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { Workspace } from "@/entities/workspace/model/workspace.types";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface TeamSwitcherProps {
	workspaces: Workspace[];
	currentWorkspaceId?: string;

	user: {
		email: string;
	};

	onWorkspaceSelect?: (workspaceId: string) => void;
	onCreateWorkspace?: () => void;
	onLogout?: () => void;
}

export function TeamSwitcher({
	workspaces,
	currentWorkspaceId,
	user,
	onWorkspaceSelect,
	onCreateWorkspace,
	onLogout,
}: TeamSwitcherProps) {
	const setSettingsOpen = useSettingsDialog((state) => state.setOpen);

	const pendingSettingsOpen = React.useRef(false);

	const activeWorkspace =
		workspaces.find((workspace) => workspace.id === currentWorkspaceId) ??
		workspaces[0];

	if (!activeWorkspace) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton className='flex w-full items-center justify-between px-1.5'>
							<div className='flex min-w-0 items-center gap-2'>
								<WorkspaceIcon name={activeWorkspace.name} />

								<span className='truncate font-medium'>
									{activeWorkspace.name}
								</span>
							</div>

							<ChevronDown className='size-4 opacity-50' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className='w-80 overflow-hidden rounded-lg p-0'
						align='start'
						side='bottom'
						sideOffset={6}
						onCloseAutoFocus={(event) => {
							if (pendingSettingsOpen.current) {
								event.preventDefault();
								pendingSettingsOpen.current = false;

								setSettingsOpen(true);
							}
						}}
					>
						{/* Current workspace */}
						<div className='p-2'>
							<div className='flex items-center gap-3 px-2 py-1.5'>
								<WorkspaceIcon
									name={activeWorkspace.name}
									size='lg'
								/>

								<div className='min-w-0'>
									<div className='truncate text-sm font-medium'>
										{activeWorkspace.name}
									</div>

									<div className='text-xs text-muted-foreground'>
										Workspace
									</div>
								</div>
							</div>
						</div>

						<DropdownMenuSeparator className='my-0' />

						{/* Workspace actions */}
						<div className='p-1'>
							<DropdownMenuItem className='gap-2 p-2 text-blue-500 focus:text-blue-500'>
								<ArrowUpCircle className='size-4' />
								Upgrade
							</DropdownMenuItem>

							<DropdownMenuItem
								className='gap-2 p-2'
								onSelect={() => {
									pendingSettingsOpen.current = true;
								}}
							>
								<SettingsIcon className='size-4' />
								Settings
							</DropdownMenuItem>

							<DropdownMenuItem className='gap-2 p-2'>
								<Mail className='size-4' />
								Invite members
							</DropdownMenuItem>

							<DropdownMenuItem className='gap-2 p-2'>
								<UserPlus className='size-4' />
								Add account
							</DropdownMenuItem>
						</div>

						<DropdownMenuSeparator className='my-0' />

						{/* Account */}
						<DropdownMenuLabel className='px-3 py-2 text-xs font-normal text-muted-foreground'>
							{user.email}
						</DropdownMenuLabel>

						{/* Workspace list */}
						<div className='p-1'>
							{workspaces.map((workspace) => {
								const isActive =
									workspace.id === activeWorkspace.id;

								return (
									<DropdownMenuItem
										key={workspace.id}
										className='flex cursor-pointer items-center gap-2 p-2'
										onSelect={() => {
											onWorkspaceSelect?.(workspace.id);
										}}
									>
										<WorkspaceIcon name={workspace.name} />

										<span className='min-w-0 flex-1 truncate'>
											{workspace.name}
										</span>

										{isActive && (
											<Check className='size-4' />
										)}
									</DropdownMenuItem>
								);
							})}

							<DropdownMenuItem
								className='gap-2 p-2 text-blue-500 focus:text-blue-500'
								onSelect={onCreateWorkspace}
							>
								<Plus className='size-4' />
								New workspace
							</DropdownMenuItem>
						</div>

						<DropdownMenuSeparator className='my-0' />

						<div className='p-1'>
							<DropdownMenuItem
								className='gap-2 p-2'
								onSelect={onLogout}
							>
								<LogOut className='size-4' />
								Log out
							</DropdownMenuItem>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>

			<SettingsDialog />
		</SidebarMenu>
	);
}

function WorkspaceIcon({
	name,
	size = "sm",
}: {
	name: string;
	size?: "sm" | "lg";
}) {
	return (
		<div
			className={
				size === "lg"
					? "flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-lg"
					: "flex size-5 shrink-0 items-center justify-center rounded text-xs"
			}
		>
			🏠
		</div>
	);
}
