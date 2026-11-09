import { Box, CreditCard, HardDrive, Plug, User, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
	SettingsSection,
	useSettingsDialog,
} from "../model/use-settings-dialog";

const NAV_ITEMS: { value: SettingsSection; label: string; icon: LucideIcon }[] = [
	{ value: "profile", label: "Profile", icon: User },
	{ value: "workspace", label: "Workspace", icon: Box },
	{ value: "members", label: "Members", icon: Users },
	{ value: "billing", label: "Billing", icon: CreditCard },
	{ value: "storage", label: "Storage", icon: HardDrive },
	{ value: "connections", label: "Connections", icon: Plug },
];

const SettingsSidebar = () => {
	const { section, setSection } = useSettingsDialog();
	return (
		<nav aria-label='Settings sections' className='shrink-0 border-b bg-sidebar px-2.5 py-4 sm:w-[220px] sm:border-b-0 sm:border-r sm:py-[18px]'>
			<div className='px-2 pb-3 pr-6'>
				<p className='text-[15px] font-semibold leading-[23px] text-foreground'>Settings</p>
				<p className='mt-0.5 hidden text-[11.5px] leading-[17px] text-muted-foreground sm:block'>Manage your account and workspace settings here.</p>
			</div>
			<div className='flex gap-0.5 overflow-x-auto sm:flex-col'>
				{NAV_ITEMS.map((item) => {
					const Icon = item.icon;
					const isActive = section === item.value;
					return (
						<button
							key={item.value}
							type='button'
							aria-current={isActive ? "page" : undefined}
							onClick={() => setSection(item.value)}
							className={cn(
								"flex h-8 shrink-0 items-center gap-[9px] rounded-md px-2.5 text-left text-[13.5px] leading-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:w-full",
								isActive
									? "bg-sidebar-accent font-medium text-foreground"
									: "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
							)}
						>
							<Icon className={cn("size-[15px] shrink-0 stroke-[1.75]", isActive ? "text-foreground" : "text-muted-foreground")} />
							{item.label}
						</button>
					);
				})}
			</div>
		</nav>
	);
};

export default SettingsSidebar;
