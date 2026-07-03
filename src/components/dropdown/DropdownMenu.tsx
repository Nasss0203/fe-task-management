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
					<DropdownMenuLabelV2>Cài đặt</DropdownMenuLabelV2>

					{onConvert && (
						<DropdownMenuItemV2 onSelect={onConvert}>
							<div className='flex items-center gap-2'>
								<RefreshCw size={16} />
								<div>Chuyển đổi</div>
							</div>
						</DropdownMenuItemV2>
					)}

					<DropdownMenuItemV2
						onSelect={onRemoveFromPage}
						className='text-red-400 focus:text-red-300'
					>
						<div className='flex items-center gap-2'>
							<Trash2 size={16} />
							<div>Xóa khỏi trang</div>
						</div>
					</DropdownMenuItemV2>
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
};

export default DropdownMenu;
