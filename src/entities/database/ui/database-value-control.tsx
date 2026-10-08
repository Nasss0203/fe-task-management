"use client";

import { Check, ChevronDown } from "lucide-react";
import {
	canInteract,
	type InteractionMode,
} from "@/shared/model/interaction-mode";
import { NativeCheckbox } from "@/shared/ui/native-checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { PropertyOptionBadge } from "./database-visuals";

interface DatabaseValueControlProps {
	type: string;
	name: string;
	value: unknown;
	options?: readonly {
		id: string;
		name: string;
		color: string | null;
		position: string;
	}[];
	mode: InteractionMode;
	disabled?: boolean;
	onValueChange?: (value: unknown) => void;
}

/** Interaction only. The caller owns local state or backend persistence. */
export function DatabaseValueControl({
	type,
	name,
	value,
	options = [],
	mode,
	disabled = false,
	onValueChange,
}: DatabaseValueControlProps) {
	const interactive = canInteract(mode) && Boolean(onValueChange);
	const emit = (next: unknown) => {
		if (interactive && !disabled) onValueChange?.(next);
	};
	if (type === "CHECKBOX")
		return (
			<NativeCheckbox
				aria-label={name}
				checked={value === true || value === "true"}
				readOnly={!interactive}
				disabled={disabled}
				onChange={(e) => emit(e.target.checked)}
			/>
		);
	const multiple = type === "MULTI_SELECT";
	const selectedIds = multiple
		? Array.isArray(value)
			? value.filter((id): id is string => typeof id === "string")
			: []
		: typeof value === "string"
			? [value]
			: [];
	const selected = options.filter((option) =>
		selectedIds.includes(option.id),
	);
	const badges = (
		<div className='flex flex-wrap items-center gap-1'>
			{selected.map((option) => (
				<PropertyOptionBadge
					key={option.id}
					name={option.name}
					color={option.color}
				/>
			))}
		</div>
	);
	if (!interactive) return badges;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type='button'
					disabled={disabled}
					aria-label={name}
					className='flex min-h-8 w-full items-center gap-2 rounded px-1 text-left hover:bg-muted/50'
				>
					{selected.length ? (
						badges
					) : (
						<span className='text-muted-foreground'>Select</span>
					)}
					<ChevronDown className='ml-auto size-3.5 text-muted-foreground' />
				</button>
			</PopoverTrigger>
			<PopoverContent align='start' className='w-56 p-1'>
				{options.length === 0 ? (
					<div className='px-2 py-2 text-sm text-muted-foreground'>
						No options
					</div>
				) : (
					[...options]
						.sort((a, b) => Number(a.position) - Number(b.position))
						.map((option) => {
							const active = selectedIds.includes(option.id);
							return (
								<button
									key={option.id}
									type='button'
									disabled={disabled}
									aria-pressed={active}
									onClick={() =>
										emit(
											multiple
												? active
													? selectedIds.filter(
															(id) =>
																id !==
																option.id,
														)
													: [
															...selectedIds,
															option.id,
														]
												: option.id,
										)
									}
									className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50'
								>
									<PropertyOptionBadge
										name={option.name}
										color={option.color}
										className='font-normal'
									/>
									{active && (
										<Check className='ml-auto size-4' />
									)}
								</button>
							);
						})
				)}
			</PopoverContent>
		</Popover>
	);
}
