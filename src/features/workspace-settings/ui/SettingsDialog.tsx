import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { useSettingsDialog } from "../model/use-settings-dialog";
import SettingsSidebar from "./SettingsSidebar";
import ProfileSection from "./sections/ProfileSection";
import WorkspaceSection from "./sections/WorkspaceSection";

const SettingsDialog = () => {
	const { open, setOpen, section } = useSettingsDialog();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Manage your account and workspace settings here.
					</DialogDescription>
				</DialogHeader>
				<DialogContent className='min-w-[70%] min-h-[80%] p-0 overflow-hidden flex'>
					<SettingsSidebar />

					<div className='flex-1 overflow-y-auto py-10 px-20'>
						{section === "profile" && <ProfileSection />}
						{section === "workspace" && <WorkspaceSection />}
					</div>
				</DialogContent>
			</DialogContent>
		</Dialog>
	);
};

export default SettingsDialog;
