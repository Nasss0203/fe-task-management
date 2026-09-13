// entities/access/ui/AccessLevelMenu.tsx

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { Check, ChevronDown, Trash2 } from "lucide-react";

export type AccessLevel = "full" | "edit" | "comment" | "view";

interface AccessOption {
	value: AccessLevel;
	label: string;
	description: string;
}

const ACCESS_OPTIONS: AccessOption[] = [
	{
		value: "full",
		label: "Full access",
		description: "Edit and manage sharing",
	},
	{
		value: "edit",
		label: "Can edit",
		description: "Edit page content",
	},
	{
		value: "comment",
		label: "Can comment",
		description: "View and comment",
	},
	{
		value: "view",
		label: "Can view",
		description: "View only",
	},
];

interface AccessLevelMenuProps {
	currentLevel: AccessLevel;
	allowedLevels?: AccessLevel[];
	inheritedFrom?: string;
	onChange?: (level: AccessLevel) => void;
	onRemove?: () => void;
	overrideWarning?: string;
	triggerLabel?: string;
	disabled?: boolean;
	readOnly?: boolean;
}

export function AccessLevelMenu({
	currentLevel,
	allowedLevels,
	inheritedFrom,
	onChange,
	onRemove,
	overrideWarning,
	triggerLabel,
	disabled = false,
	readOnly = false,
}: AccessLevelMenuProps) {
	const current = ACCESS_OPTIONS.find(
		(option) => option.value === currentLevel,
	);

	const availableOptions = allowedLevels
		? ACCESS_OPTIONS.filter((option) =>
				allowedLevels.includes(option.value),
			)
		: ACCESS_OPTIONS;

	const handleChange = (level: AccessLevel) => {
		if (disabled || readOnly) {
			return;
		}

		if (level === currentLevel) {
			return;
		}

		onChange?.(level);
	};

	const handleRemove = () => {
		if (disabled) {
			return;
		}

		onRemove?.();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					disabled={disabled}
					className='flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
				>
					{triggerLabel ?? current?.label ?? "Access"}

					<ChevronDown className='size-3.5' />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align='end' className='w-64 p-3'>
				{/* Current access */}
				<DropdownMenuLabel className='px-0 py-0 text-[11px] font-normal text-muted-foreground'>
					Current access
				</DropdownMenuLabel>

				<div className='px-0 py-1.5'>
					<p className='text-xs font-medium'>
						{current?.label ?? "Unknown access"}
					</p>

					{inheritedFrom && (
						<p className='text-[11px] text-muted-foreground'>
							{inheritedFrom}
						</p>
					)}
				</div>

				{!readOnly && <>
				<DropdownMenuSeparator />

				{/* User access */}
				<DropdownMenuLabel className='px-0 py-0 text-[11px] font-normal text-muted-foreground'>
					User access
				</DropdownMenuLabel>

				{availableOptions.map((option) => {
					const isCurrent = option.value === currentLevel;

					return (
						<DropdownMenuItem
							key={option.value}
							disabled={disabled}
							onClick={() => handleChange(option.value)}
							className='flex cursor-pointer items-start justify-between px-0 py-1.5'
						>
							<div className='min-w-0'>
								<p className='text-xs font-medium'>
									{option.label}
								</p>

								{option.description && (
									<p className='text-[11px] text-muted-foreground'>
										{option.description}
									</p>
								)}
							</div>

							{isCurrent && (
								<Check className='mt-0.5 size-3.5 shrink-0' />
							)}
						</DropdownMenuItem>
					);
				})}
				</>}

				{/* Remove access */}
				{!readOnly && onRemove && (
					<>
						<DropdownMenuSeparator />

						<DropdownMenuItem
							disabled={disabled}
							onClick={handleRemove}
							className='flex cursor-pointer items-center gap-2 px-0 py-1.5 text-xs'
						>
							<Trash2 className='size-3.5' />
							Remove
						</DropdownMenuItem>
					</>
				)}

				{/* Effective access warning */}
				{overrideWarning && (
					<>
						<DropdownMenuSeparator />

						<p className='px-0 pt-1 text-[11px] leading-relaxed text-muted-foreground'>
							{overrideWarning}
						</p>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
