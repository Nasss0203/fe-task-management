"use client";

import { DatabaseValueControl } from "@/entities/database/ui/database-value-control";
import { formatDatabaseValue } from "@/entities/database/ui/database-visuals";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { useSetDatabaseRowValue } from "@/entities/database/model/database.mutations";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { canInteract, InteractionMode } from "@/shared/model/interaction-mode";

import { DateCell } from "./date-cell";
import { PersonCell } from "./person-cell";

interface DatabaseCellProps {
	databaseId: string;
	/** Page that owns the database (used to resolve workspace people). */
	pageId: string;
	rowId: string;
	property: DatabaseProperty;
	value: unknown;

	mode?: InteractionMode;
	/** Focus the text input on mount (used right after creating a row). */
	autoFocus?: boolean;

	onValueChange?: (input: {
		databaseId: string;
		rowId: string;
		propertyId: string;
		value: unknown;
	}) => void;
}

const TEXT_INPUT_TYPES: Partial<Record<PropertyType, string>> = {
	[PropertyType.URL]: "url",
	[PropertyType.EMAIL]: "email",
	[PropertyType.PHONE]: "tel",
	[PropertyType.NUMBER]: "number",
};

function toInputText(value: unknown): string {
	return typeof value === "string" || typeof value === "number"
		? String(value)
		: "";
}

export function DatabaseCell({
	databaseId,
	pageId,
	rowId,
	property,
	value,
	mode = "editable",
	autoFocus = false,
	onValueChange,
}: DatabaseCellProps) {
	const [inputValue, setInputValue] = useState(toInputText(value));

	const setValueMutation = useSetDatabaseRowValue(databaseId);

	useEffect(() => {
		setInputValue(toInputText(value));
	}, [value]);

	const interactive = canInteract(mode);
	const disabled = mode === "editable" && setValueMutation.isPending;

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

	const saveText = () => {
		const trimmed = inputValue.trim();

		if (trimmed === toInputText(value)) {
			return;
		}

		if (!trimmed) {
			updateValue(null);
			return;
		}

		if (property.type === PropertyType.NUMBER) {
			const number = Number(trimmed);

			if (Number.isNaN(number)) {
				setInputValue(toInputText(value));
				return;
			}

			updateValue(number);
			return;
		}

		updateValue(trimmed);
	};

	switch (property.type) {
		case PropertyType.TITLE:
		case PropertyType.TEXT:
		case PropertyType.URL:
		case PropertyType.EMAIL:
		case PropertyType.PHONE:
		case PropertyType.NUMBER: {
			const isTitle = property.type === PropertyType.TITLE;
			const isNumber = property.type === PropertyType.NUMBER;
			const href =
				property.type === PropertyType.URL && inputValue
					? /^https?:\/\//i.test(inputValue)
						? inputValue
						: `https://${inputValue}`
					: null;

			return (
				<div className='group/text relative flex items-center'>
					<input
						type={TEXT_INPUT_TYPES[property.type] ?? "text"}
						aria-label={property.name}
						value={inputValue}
						onChange={(event) => setInputValue(event.target.value)}
						onBlur={saveText}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.currentTarget.blur();
							}

							if (event.key === "Escape") {
								setInputValue(toInputText(value));
								// Reset first so the blur that follows has nothing to save.
								requestAnimationFrame(() =>
									(event.target as HTMLInputElement).blur(),
								);
							}
						}}
						placeholder={isTitle ? "Untitled" : ""}
						autoFocus={autoFocus}
						readOnly={!interactive}
						disabled={disabled}
						className={[
							"h-8 w-full min-w-0 truncate rounded-sm bg-transparent px-1 outline-none placeholder:text-muted-foreground/60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
							isTitle ? "font-medium" : "",
							isNumber ? "text-right tabular-nums" : "",
							href ? "pr-7 text-foreground underline decoration-muted-foreground/40 underline-offset-2" : "",
						].join(" ")}
					/>

					{href && (
						<a
							href={href}
							target='_blank'
							rel='noopener noreferrer'
							aria-label={`Open ${inputValue}`}
							className='absolute right-1 flex size-6 items-center justify-center rounded-sm border bg-background text-muted-foreground opacity-0 shadow-sm hover:text-foreground group-hover/text:opacity-100 focus-visible:opacity-100'
						>
							<ExternalLink className='size-3.5' />
						</a>
					)}
				</div>
			);
		}

		case PropertyType.SELECT:
		case PropertyType.STATUS:
		case PropertyType.MULTI_SELECT:
		case PropertyType.CHECKBOX:
			return (
				<div
					className={
						property.type === PropertyType.CHECKBOX
							? "flex h-8 items-center px-1"
							: undefined
					}
				>
					<DatabaseValueControl
						type={property.type}
						name={property.name}
						value={value}
						options={property.options}
						mode={mode}
						disabled={disabled}
						onValueChange={updateValue}
					/>
				</div>
			);

		case PropertyType.DATE:
			return (
				<DateCell
					name={property.name}
					value={value}
					interactive={interactive}
					disabled={disabled}
					onChange={updateValue}
				/>
			);

		case PropertyType.PERSON:
			return (
				<PersonCell
					databaseId={databaseId}
					pageId={pageId}
					name={property.name}
					value={value}
					interactive={interactive}
					disabled={disabled}
					onChange={updateValue}
				/>
			);

		default:
			return (
				<span className='block truncate px-1 text-muted-foreground'>
					{formatDatabaseValue(value)}
				</span>
			);
	}
}
