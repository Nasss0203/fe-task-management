// entities/access/ui/AccessLevelMenu.tsx

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ArrowUpCircle, Check, ChevronDown, Trash2 } from "lucide-react";

export type AccessLevel = "full" | "edit" | "comment" | "view";

interface AccessOption {
	value: AccessLevel;
	label: string;
	description: string;
	requiresPlus?: boolean;
}

const ACCESS_OPTIONS: AccessOption[] = [
	{
		value: "full",
		label: "Full access",
		description: "Edit, suggest, comment, and share",
	},
	{
		value: "edit",
		label: "Can edit",
		description: "Edit, suggest, and comment",
		requiresPlus: true,
	},
	{
		value: "comment",
		label: "Can comment",
		description: "Suggest and comment",
	},
	{ value: "view", label: "Can view", description: "" },
];

interface AccessLevelMenuProps {
	currentLevel: AccessLevel;
	inheritedFrom?: string; // vd: "via user access on Untitled"
	onChange: (level: AccessLevel) => void;
	onRemove?: () => void;
	overrideWarning?: string;
	triggerLabel?: string; // nếu muốn custom text hiển thị ngoài trigger
}

export function AccessLevelMenu({
	currentLevel,
	inheritedFrom,
	onChange,
	onRemove,
	overrideWarning,
	triggerLabel,
}: AccessLevelMenuProps) {
	const current = ACCESS_OPTIONS.find((o) => o.value === currentLevel);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='flex items-center gap-1 text-xs text-muted-foreground'>
				{triggerLabel ?? current?.label}
				<ChevronDown className='h-3.5 w-3.5' />
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='w-64 p-3'>
				<DropdownMenuLabel className='text-[11px] text-muted-foreground px-0 py-0 font-normal'>
					Current access
				</DropdownMenuLabel>
				<div className='px-0 py-1.5'>
					<p className='text-xs font-medium'>{current?.label}</p>
					{inheritedFrom && (
						<p className='text-[11px] text-muted-foreground'>
							{inheritedFrom}
						</p>
					)}
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuLabel className='text-[11px] text-muted-foreground px-0 py-0 font-normal'>
					User access
				</DropdownMenuLabel>

				{ACCESS_OPTIONS.map((option) => (
					<DropdownMenuItem
						key={option.value}
						onClick={() => onChange(option.value)}
						className='flex items-start justify-between px-0 py-1.5 cursor-pointer'
					>
						<div>
							<p className='text-xs font-medium'>
								{option.label}
							</p>
							{option.description && (
								<p className='text-[11px] text-muted-foreground'>
									{option.description}
								</p>
							)}
						</div>

						{option.value === currentLevel && (
							<Check className='h-3.5 w-3.5 mt-0.5' />
						)}
						{option.requiresPlus &&
							option.value !== currentLevel && (
								<span className='flex items-center gap-1 text-[11px] text-blue-500 font-medium'>
									<ArrowUpCircle className='h-3 w-3' />
									Plus
								</span>
							)}
					</DropdownMenuItem>
				))}

				{onRemove && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={onRemove}
							className='px-0 py-1.5 cursor-pointer text-xs gap-2'
						>
							<Trash2 className='h-3.5 w-3.5' />
							Remove
						</DropdownMenuItem>
					</>
				)}

				{overrideWarning && (
					<>
						<DropdownMenuSeparator />
						<p className='text-[11px] text-muted-foreground px-0 pt-1 leading-relaxed'>
							{overrideWarning}
						</p>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
