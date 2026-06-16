import { PageBlockType } from "@/services/page_block/type";
import { Code2, Heading1, ListTodo, Minus, Quote, Type } from "lucide-react";
import React from "react";
import {
	DropdownMenuContentV2,
	DropdownMenuGroupV2,
	DropdownMenuItemV2,
	DropdownMenuLabelV2,
	DropdownMenuTriggerV2,
	DropdownMenuV2,
} from "./dropdown-custom";

type CreateBlockMenuProps = {
	children: React.ReactNode;
	onCreate: (type: PageBlockType) => void;
};

const BLOCK_OPTIONS = [
	{
		type: PageBlockType.TEXT,
		label: "Text",
		icon: Type,
	},
	{
		type: PageBlockType.HEADER,
		label: "Heading",
		icon: Heading1,
	},
	{
		type: PageBlockType.TODO,
		label: "Todo",
		icon: ListTodo,
	},
	{
		type: PageBlockType.QUOTE,
		label: "Quote",
		icon: Quote,
	},
	{
		type: PageBlockType.DIVIDER,
		label: "Divider",
		icon: Minus,
	},
	{
		type: PageBlockType.CODE,
		label: "Code",
		icon: Code2,
	},
];

const CreateBlockMenu = ({ children, onCreate }: CreateBlockMenuProps) => {
	return (
		<DropdownMenuV2>
			<DropdownMenuTriggerV2 asChild>{children}</DropdownMenuTriggerV2>

			<DropdownMenuContentV2 className='w-56' align='start' side='right'>
				<DropdownMenuGroupV2>
					<DropdownMenuLabelV2 className="text-foreground">Create block</DropdownMenuLabelV2>

					{BLOCK_OPTIONS.map((item) => {
						const Icon = item.icon;

						return (
							<DropdownMenuItemV2
								key={item.type}
								onSelect={() => onCreate(item.type)}
								className="text-foreground [&_svg]:text-foreground"
							>
								<Icon size={16} />
								<div className="font-medium">{item.label}</div>
							</DropdownMenuItemV2>
						);
					})}
				</DropdownMenuGroupV2>
			</DropdownMenuContentV2>
		</DropdownMenuV2>
	);
};

export default CreateBlockMenu;
