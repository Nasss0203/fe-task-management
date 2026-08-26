"use client";

import { useEffect, useState } from "react";

import { useSetDatabaseRowValue } from "@/entities/database/model/database.mutations";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Check, ChevronDown } from "lucide-react";

interface DatabaseCellProps {
	databaseId: string;
	rowId: string;
	property: DatabaseProperty;
	value: unknown;
}

export function DatabaseCell({
	databaseId,
	rowId,
	property,
	value,
}: DatabaseCellProps) {
	const [inputValue, setInputValue] = useState(
		typeof value === "string" ? value : "",
	);

	const setValueMutation = useSetDatabaseRowValue(databaseId);

	useEffect(() => {
		setInputValue(typeof value === "string" ? value : "");
	}, [value]);

	const save = () => {
		const currentValue = typeof value === "string" ? value : "";

		if (inputValue === currentValue) {
			return;
		}

		setValueMutation.mutate({
			rowId,
			propertyId: property.id,
			value: inputValue,
		});
	};

	const selectedOption =
		typeof value === "string"
			? property.options.find((option) => option.id === value)
			: undefined;

	switch (property.type) {
		case PropertyType.TITLE:
		case PropertyType.TEXT:
			return (
				<input
					value={inputValue}
					onChange={(event) => setInputValue(event.target.value)}
					onBlur={save}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.currentTarget.blur();
						}
					}}
					placeholder={
						property.type === PropertyType.TITLE ? "Untitled" : ""
					}
					disabled={setValueMutation.isPending}
					className='h-8 w-full bg-transparent px-1 outline-none'
				/>
			);
		case PropertyType.SELECT:
		case PropertyType.STATUS:
			return (
				<Popover>
					<PopoverTrigger asChild>
						<button
							type='button'
							className='flex h-8 w-full items-center gap-2 rounded px-1 text-left hover:bg-muted/50'
						>
							{selectedOption ? (
								<span
									className='inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium'
									style={{
										backgroundColor:
											selectedOption.color ?? undefined,
									}}
								>
									{selectedOption.name}
								</span>
							) : (
								<span className='text-muted-foreground'>
									Select
								</span>
							)}

							<ChevronDown className='ml-auto size-3.5 text-muted-foreground' />
						</button>
					</PopoverTrigger>

					<PopoverContent align='start' className='w-56 p-1'>
						{property.options.length === 0 ? (
							<div className='px-2 py-2 text-sm text-muted-foreground'>
								No options
							</div>
						) : (
							property.options
								.slice()
								.sort(
									(a, b) =>
										Number(a.position) - Number(b.position),
								)
								.map((option) => {
									const active =
										selectedOption?.id === option.id;

									return (
										<button
											key={option.id}
											type='button'
											disabled={
												setValueMutation.isPending
											}
											onClick={() => {
												setValueMutation.mutate({
													rowId,
													propertyId: property.id,

													// Lưu ID của option
													value: option.id,
												});
											}}
											className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted disabled:opacity-50'
										>
											<span
												className='inline-flex items-center rounded-md px-2 py-0.5 text-xs'
												style={{
													backgroundColor:
														option.color ??
														undefined,
												}}
											>
												{option.name}
											</span>

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
		case PropertyType.NUMBER:
			return (
				<input
					type='number'
					value={
						typeof value === "number"
							? value
							: typeof value === "string"
								? value
								: ""
					}
					onChange={(event) => {
						const nextValue =
							event.target.value === ""
								? ""
								: Number(event.target.value);

						setValueMutation.mutate({
							rowId,
							propertyId: property.id,
							value: nextValue,
						});
					}}
					className='h-8 w-full bg-transparent px-1 outline-none'
				/>
			);
		case PropertyType.CHECKBOX:
			return (
				<input
					type='checkbox'
					checked={value === true}
					onChange={(event) => {
						setValueMutation.mutate({
							rowId,
							propertyId: property.id,
							value: event.target.checked,
						});
					}}
					className='size-4'
				/>
			);

		default:
			return <span className='block px-1'>{renderValue(value)}</span>;
	}
}

function renderValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}

	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}

	if (typeof value === "boolean") {
		return value ? "✓" : "";
	}

	return JSON.stringify(value);
}
