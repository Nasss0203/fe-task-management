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

const TAB_TRIGGER_CLASS =
	"h-[30px] flex-none px-3 text-[13px] font-medium text-muted-foreground data-[state=active]:font-semibold";

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
			<DialogContent className='flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden rounded-[12px] p-0 shadow-[0_24px_56px_-12px_rgba(0,0,0,0.28)] sm:max-w-[600px]'>
				<DialogHeader className='gap-1 px-6 pb-2 pr-12 pt-5'>
					<DialogTitle className='flex items-center gap-2 text-[17px] leading-[26px]'>
						<span aria-hidden='true' className='text-base'>{teamspace.icon || "🏠"}</span>
						<span className='truncate'>{teamspace.name}</span>
					</DialogTitle>

					<DialogDescription className='text-[13px] leading-5'>
						Manage who is in this teamspace and how people can join.
					</DialogDescription>
				</DialogHeader>

				<Tabs
					value={tab}
					onValueChange={(value) =>
						setTab(value as TeamspaceSettingsTab)
					}
					className='flex min-h-0 flex-1 flex-col gap-0'
				>
					<TabsList className='mx-6 mt-2 h-auto gap-0.5 rounded-lg p-[2px] group-data-[orientation=horizontal]/tabs:h-auto'>
						<TabsTrigger value='members' className={TAB_TRIGGER_CLASS}>
							Members
						</TabsTrigger>
						<TabsTrigger value='links' className={TAB_TRIGGER_CLASS}>
							Invite links
						</TabsTrigger>
						<TabsTrigger value='access' className={TAB_TRIGGER_CLASS}>
							Access
						</TabsTrigger>
						<TabsTrigger value='general' className={TAB_TRIGGER_CLASS}>
							General
						</TabsTrigger>
					</TabsList>

					<div className='min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5'>
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
								onArchived={() => onOpenChange(false)}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
