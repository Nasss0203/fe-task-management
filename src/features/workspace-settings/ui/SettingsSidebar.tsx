import { cn } from "@/shared/lib/utils";
import {
	SettingsSection,
	useSettingsDialog,
} from "../model/use-settings-dialog";

const NAV_ITEMS: { value: SettingsSection; label: string }[] = [
	{ value: "profile", label: "Profile" },
	{ value: "workspace", label: "Workspace" },
	{ value: "members", label: "Members" },
	{ value: "billing", label: "Billing" },
];
const SettingsSidebar = () => {
	const { section, setSection } = useSettingsDialog();
	return (
		<div className='w-60 shrink-0 border-r p-5 space-y-0.5'>
			{NAV_ITEMS.map((item) => (
				<button
					key={item.value}
					onClick={() => setSection(item.value)}
					className={cn(
						"w-full text-left px-2 py-1.5 rounded-md text-sm",
						section === item.value
							? "bg-accent font-medium"
							: "text-muted-foreground hover:bg-accent/50",
					)}
				>
					{item.label}
				</button>
			))}
		</div>
	);
};

export default SettingsSidebar;
