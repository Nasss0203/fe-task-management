import { RefreshCw, Trash2 } from "lucide-react";
import React from "react";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "./dropdown-custom";

const DropdownMenu = ({
	children,
	onConvert,
	onRemoveFromPage,
}: {
	children: React.ReactNode;
	onConvert?: () => void;
	onRemoveFromPage?: () => void;
}) => {
	return (
		<DropdownMenuV2>
			<DropdownMenuTriggerV2 asChild>{children}</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-52' align='center' side='left'>
				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2>Settings</DropdownMenuLabelV2>

					<DropdownMenuItemV2 onSelect={onConvert}>
						<div className='flex items-center gap-2'>
							<RefreshCw size={16} />
							<div>Chuyen doi</div>
						</div>
					</DropdownMenuItemV2>

					<DropdownMenuItemV2
						onSelect={onRemoveFromPage}
						className='text-red-400 focus:text-red-300'
					>
						<div className='flex items-center gap-2'>
							<Trash2 size={16} />
							<div>Remove from page</div>
						</div>
					</DropdownMenuItemV2>
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
};

export default DropdownMenu;
