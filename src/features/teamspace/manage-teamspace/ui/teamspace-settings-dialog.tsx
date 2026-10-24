"use client";

import { useState } from "react";

import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { useTeamspaceManagement } from "../model/use-teamspace-management";
import { TeamspaceAccessTab } from "./teamspace-access-tab";
import { TeamspaceGeneralTab } from "./teamspace-general-tab";
import { TeamspaceInviteLinksTab } from "./teamspace-invite-links-tab";
import { TeamspaceMembersTab } from "./teamspace-members-tab";

export type TeamspaceSettingsTab = "members" | "links" | "access" | "general";

interface TeamspaceSettingsDialogProps {
	teamspace: Teamspace;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Read on mount; remount (key) to open on another tab. */
	initialTab?: TeamspaceSettingsTab;
}

export function TeamspaceSettingsDialog({
	teamspace,
	open,
	onOpenChange,
	initialTab = "members",
}: TeamspaceSettingsDialogProps) {
	const [tab, setTab] = useState<TeamspaceSettingsTab>(initialTab);

	const management = useTeamspaceManagement(teamspace, open);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-h-[min(85vh,720px)] flex-col gap-4 sm:max-w-xl'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<span aria-hidden='true'>{teamspace.icon || "🏠"}</span>
						<span className='truncate'>{teamspace.name}</span>
					</DialogTitle>

					<DialogDescription>
						Manage who is in this teamspace and how people can join.
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={tab}
					onValueChange={(value) =>
						setTab(value as TeamspaceSettingsTab)
					}
					className='flex min-h-0 flex-1 flex-col'
				>
					<TabsList>
						<TabsTrigger value='members'>Members</TabsTrigger>
						<TabsTrigger value='links'>Invite links</TabsTrigger>
						<TabsTrigger value='access'>Access</TabsTrigger>
						<TabsTrigger value='general'>General</TabsTrigger>
					</TabsList>

					<div className='-mx-1 mt-4 min-h-0 flex-1 overflow-y-auto px-1'>
						<TabsContent value='members'>
							<TeamspaceMembersTab
								teamspace={teamspace}
								management={management}
							/>
						</TabsContent>

						<TabsContent value='links'>
							<TeamspaceInviteLinksTab
								teamspace={teamspace}
								canManage={management.canManage}
							/>
						</TabsContent>

						<TabsContent value='access'>
							<TeamspaceAccessTab
								teamspace={teamspace}
								canManage={management.canManage}
							/>
						</TabsContent>
						<TabsContent value='general'>
							<TeamspaceGeneralTab
								teamspace={teamspace}
								canManage={management.canManage}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
