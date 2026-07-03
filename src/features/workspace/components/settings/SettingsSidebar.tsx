import type { SettingsSection } from "./types";
import { SETTINGS_NAV } from "./types";

interface SettingsSidebarProps {
	workspaceName: string;
	activeSection: SettingsSection;
	onSectionChange: (section: SettingsSection) => void;
}

export function SettingsSidebar({
	workspaceName,
	activeSection,
	onSectionChange,
}: SettingsSidebarProps) {
	return (
		<aside className='w-64 shrink-0 border-r border-border bg-muted/50'>
			<div className='border-b border-border px-5 py-4'>
				<div className='text-base font-semibold'>
					Workspace settings
				</div>
				<div className='mt-3 flex items-center gap-3'>
					<div className='flex size-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-bold'>
						{workspaceName.charAt(0).toUpperCase()}
					</div>
					<div className='min-w-0'>
						<div className='truncate text-sm font-medium'>
							{workspaceName}
						</div>
						<div className='text-xs text-muted-foreground'>
							Task workspace
						</div>
					</div>
				</div>
			</div>

			<nav className='grid gap-1 px-3 py-4'>
				{SETTINGS_NAV.map((item) => {
					const Icon = item.icon;
					const isActive = activeSection === item.key;

					return (
						<button
							key={item.key}
							type='button'
							onClick={() => onSectionChange(item.key)}
							className={`flex h-9 items-center gap-3 rounded-md px-3 text-left text-sm transition cursor-pointer ${
								isActive
									? "bg-accent text-accent-foreground font-semibold shadow-xs"
									: "text-foreground hover:bg-accent/50 hover:text-foreground"
							}`}
						>
							<Icon className='size-4' />
							{item.label}
						</button>
					);
				})}
			</nav>
		</aside>
	);
}
