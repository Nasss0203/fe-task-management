"use client";

import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import {
	useDeletePropertyOption,
	useUpdatePropertyOption,
} from "@/entities/database/model/database.mutations";
import type {
	DatabaseProperty,
	PropertyOption,
} from "@/entities/database/model/database.types";
import { cn } from "@/shared/lib/utils";

/** Notion-like option palette; null keeps the neutral default badge. */
export const OPTION_COLORS: { name: string; value: string | null }[] = [
	{ name: "Default", value: null },
	{ name: "Gray", value: "#6B7280" },
	{ name: "Brown", value: "#92400E" },
	{ name: "Orange", value: "#F97316" },
	{ name: "Yellow", value: "#EAB308" },
	{ name: "Green", value: "#22C55E" },
	{ name: "Blue", value: "#3B82F6" },
	{ name: "Purple", value: "#A855F7" },
	{ name: "Pink", value: "#EC4899" },
	{ name: "Red", value: "#EF4444" },
];

export function ColorDot({
	color,
	className,
}: {
	color: string | null;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"size-3.5 shrink-0 rounded-sm border border-foreground/10 bg-muted",
				className,
			)}
			style={color ? { backgroundColor: color } : undefined}
		/>
	);
}

interface OptionColorListProps {
	value: string | null;
	disabled?: boolean;
	onChange: (color: string | null) => void;
}

export function OptionColorList({
	value,
	disabled,
	onChange,
}: OptionColorListProps) {
	return (
		<div role='listbox' aria-label='Color' className='grid grid-cols-5 gap-1 p-1'>
			{OPTION_COLORS.map((color) => {
				const active =
					(color.value ?? "").toLowerCase() === (value ?? "").toLowerCase();
				return (
					<button
						key={color.name}
						type='button'
						role='option'
						aria-selected={active}
						aria-label={color.name}
						title={color.name}
						disabled={disabled}
						onClick={() => onChange(color.value)}
						className={cn(
							"relative flex aspect-square items-center justify-center rounded-md hover:bg-muted disabled:opacity-50",
							active && "bg-muted",
						)}
					>
						<ColorDot
							color={color.value}
							className='flex size-5 items-center justify-center rounded-full'
						/>
						{active && (
							<Check className='absolute size-3 text-white mix-blend-difference' />
						)}
					</button>
				);
			})}
		</div>
	);
}

interface PropertyOptionMenuProps {
	databaseId: string;
	property: DatabaseProperty;
	option: PropertyOption;
	onDone?: () => void;
}

/** Rename, recolor or delete one Select/Status option (a board column). */
export function PropertyOptionMenu({
	databaseId,
	property,
	option,
	onDone,
}: PropertyOptionMenuProps) {
	const [name, setName] = useState(option.name);
	const updateMutation = useUpdatePropertyOption(databaseId, property.id);
	const deleteMutation = useDeletePropertyOption(databaseId, property.id);

	const update = (next: { name?: string; color?: string | null }) =>
		updateMutation.mutate(
			{
				optionId: option.id,
				name: next.name ?? option.name,
				color: next.color === undefined ? option.color : next.color,
			},
			{ onError: () => toast.error("Couldn't update option") },
		);

	const saveName = () => {
		const trimmed = name.trim();
		if (!trimmed || trimmed === option.name) {
			setName(option.name);
			return;
		}
		if (
			property.options.some(
				(item) =>
					item.id !== option.id &&
					item.name.toLowerCase() === trimmed.toLowerCase(),
			)
		) {
			toast.error(`"${trimmed}" already exists`);
			setName(option.name);
			return;
		}
		update({ name: trimmed });
	};

	return (
		<div className='space-y-1'>
			<input
				value={name}
				onChange={(event) => setName(event.target.value)}
				onBlur={saveName}
				onKeyDown={(event) => {
					if (event.key === "Enter") event.currentTarget.blur();
					if (event.key === "Escape") setName(option.name);
				}}
				aria-label='Option name'
				maxLength={255}
				autoFocus
				className='h-7 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
			/>

			<OptionColorList
				value={option.color}
				disabled={updateMutation.isPending}
				onChange={(color) => update({ color })}
			/>

			<div className='border-t pt-1'>
				<button
					type='button'
					disabled={deleteMutation.isPending}
					onClick={() =>
						deleteMutation.mutate(option.id, {
							onSuccess: onDone,
							onError: (error) =>
								toast.error(
									isAxiosError(error) && error.response?.status === 409
										? "Move the rows out of this option before deleting it"
										: "Couldn't delete option",
								),
						})
					}
					className='flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50'
				>
					<Trash2 className='size-3.5' />
					Delete
				</button>
			</div>
		</div>
	);
}
