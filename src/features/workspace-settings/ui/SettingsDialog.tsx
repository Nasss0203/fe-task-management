import { X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { useSettingsDialog } from "../model/use-settings-dialog";
import SettingsSidebar from "./SettingsSidebar";
import BillingSection from "./sections/BillingSection";
import ConnectionsSection from "./sections/ConnectionsSection";
import MembersSection from "./sections/MembersSection";
import ProfileSection from "./sections/ProfileSection";
import WorkspaceSection from "./sections/WorkspaceSection";

const SLACK_PARAM = "slack";

function useSlackRedirectToast() {
	const { setOpen, setSection } = useSettingsDialog();

	useEffect(() => {
		const url = new URL(window.location.href);
		const result = url.searchParams.get(SLACK_PARAM);

		if (!result) return;

		if (result === "connected") {
			toast.success("Slack connected", { id: SLACK_PARAM });
		} else {
			toast.error("Couldn't connect Slack", { id: SLACK_PARAM });
		}

		setSection("connections");
		setOpen(true);
		url.searchParams.delete(SLACK_PARAM);
		window.history.replaceState(window.history.state, "", url.toString());
	}, [setOpen, setSection]);
}

interface SettingsDialogProps {
	workspaceId: string;
	currentUserId: string;
	canInviteMembers?: boolean;
	canUpdateMemberRole?: boolean;
	canRemoveMember?: boolean;
}

const SettingsDialog = ({
	workspaceId,
	currentUserId,
	canInviteMembers = false,
	canUpdateMemberRole = false,
	canRemoveMember = false,
}: SettingsDialogProps) => {
	const { open, setOpen, section } = useSettingsDialog();
	useSlackRedirectToast();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent showCloseButton={false} className='flex h-[min(720px,90dvh)] flex-col gap-0 overflow-hidden rounded-[12px] border-border bg-background p-0 shadow-[0_24px_56px_-12px_rgba(0,0,0,0.28)] sm:max-w-[1080px] sm:flex-row'>
				<DialogClose className='absolute right-3.5 top-3.5 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
					<X className='size-4 stroke-[1.75]' />
					<span className='sr-only'>Close settings</span>
				</DialogClose>
				<DialogHeader className='sr-only'>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Manage your account and workspace settings here.
					</DialogDescription>
				</DialogHeader>
				<SettingsSidebar />

				<div className='min-h-0 min-w-0 flex-1 overflow-y-auto'>
					{section === "profile" && (
						<div className='mx-auto w-full max-w-[860px] px-5 py-8 sm:px-8 lg:px-[70px]'>
							<ProfileSection />
						</div>
					)}
					{section === "workspace" && (
						<div className='mx-auto w-full max-w-[860px] px-5 py-8 sm:px-8 lg:px-[70px]'>
							<WorkspaceSection workspaceId={workspaceId} />
						</div>
					)}
					{section === "billing" && (
						<div className='mx-auto w-full max-w-[860px] px-5 py-8 sm:px-8 lg:px-[70px]'>
							<BillingSection workspaceId={workspaceId} />
						</div>
					)}
					{section === "connections" && (
						<div className='mx-auto w-full max-w-[860px] px-5 py-8 sm:px-8 lg:px-[70px]'>
							<ConnectionsSection />
						</div>
					)}
					{section === "members" && (
						<MembersSection
							workspaceId={workspaceId}
							currentUserId={currentUserId}
							canInviteMembers={canInviteMembers}
							canUpdateMemberRole={canUpdateMemberRole}
							canRemoveMember={canRemoveMember}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SettingsDialog;
