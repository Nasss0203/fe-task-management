"use client";

import { DatabaseValueControl } from "@/entities/database/ui/database-value-control";
import { formatDatabaseValue } from "@/entities/database/ui/database-visuals";

import { useEffect, useState } from "react";

import { useSetDatabaseRowValue } from "@/entities/database/model/database.mutations";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { canInteract, InteractionMode } from "@/shared/model/interaction-mode";

interface DatabaseCellProps {
	databaseId: string;
	rowId: string;
	property: DatabaseProperty;
	value: unknown;

	mode?: InteractionMode;

	onValueChange?: (input: {
		databaseId: string;
		rowId: string;
		propertyId: string;
		value: unknown;
	}) => void;
}

export function DatabaseCell({
	databaseId,
	rowId,
	property,
	value,
	mode = "editable",
	onValueChange,
}: DatabaseCellProps) {
	const [inputValue, setInputValue] = useState(
		typeof value === "string" ? value : "",
	);

	const setValueMutation = useSetDatabaseRowValue(databaseId);

	useEffect(() => {
		setInputValue(typeof value === "string" ? value : "");
	}, [value]);

	const save = () => {
		if (!interactive) {
			return;
		}

		const currentValue = typeof value === "string" ? value : "";

		if (inputValue === currentValue) {
			return;
		}

		updateValue(inputValue);
	};
	const interactive = canInteract(mode);

	const updateValue = (nextValue: unknown) => {
		if (!interactive) {
			return;
		}

		if (mode === "preview") {
			onValueChange?.({
				databaseId,
				rowId,
				propertyId: property.id,
				value: nextValue,
			});

			return;
		}

		if (mode === "editable") {
			setValueMutation.mutate({
				rowId,
				propertyId: property.id,
				value: nextValue,
			});
		}
	};

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
					disabled={
						!interactive ||
						(mode === "editable" && setValueMutation.isPending)
					}
					className='h-8 w-full bg-transparent px-1 outline-none'
				/>
			);
		case PropertyType.SELECT:
		case PropertyType.STATUS:
			return (
				<DatabaseValueControl
					type={property.type}
					name={property.name}
					value={value}
					options={property.options}
					mode='editable'
					disabled={setValueMutation.isPending}
					onValueChange={(next) =>
						setValueMutation.mutate({
							rowId,
							propertyId: property.id,
							value: next,
						})
					}
				/>
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

						updateValue(nextValue);
					}}
					disabled={
						!interactive ||
						(mode === "editable" && setValueMutation.isPending)
					}
					className='h-8 w-full bg-transparent px-1 outline-none'
				/>
			);
		case PropertyType.CHECKBOX:
			return (
				<DatabaseValueControl
					type={property.type}
					name={property.name}
					value={value}
					mode={mode}
					disabled={mode === "editable" && setValueMutation.isPending}
					onValueChange={updateValue}
				/>
			);

		default:
			return (
				<span className='block px-1'>{formatDatabaseValue(value)}</span>
			);
	}
}
