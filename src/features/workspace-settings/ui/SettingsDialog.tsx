import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { useSettingsDialog } from "../model/use-settings-dialog";
import SettingsSidebar from "./SettingsSidebar";
import MembersSection from "./sections/MembersSection";
import ProfileSection from "./sections/ProfileSection";
import WorkspaceSection from "./sections/WorkspaceSection";

interface SettingsDialogProps {
	workspaceId: string;
}

const SettingsDialog = ({ workspaceId }: SettingsDialogProps) => {
	const { open, setOpen, section } = useSettingsDialog();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='flex min-h-[80dvh] min-w-[70%] gap-0 overflow-hidden p-0'>
				<DialogHeader className='sr-only'>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Manage your account and workspace settings here.
					</DialogDescription>
				</DialogHeader>
				<SettingsSidebar />

				<div className='min-w-0 flex-1 overflow-y-auto'>
					{section === "profile" && (
						<div className='px-20 py-10'>
							<ProfileSection />
						</div>
					)}
					{section === "workspace" && (
						<div className='px-20 py-10'>
							<WorkspaceSection />
						</div>
					)}
					{section === "members" && (
						<MembersSection workspaceId={workspaceId} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SettingsDialog;
