"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
	PropertyType,
	type Database,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import {
	useDatabase,
	useSharedDatabase,
} from "@/entities/database/model/database.queries";
import { useSubmitPageForm } from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { NativeCheckbox } from "@/shared/ui/native-checkbox";

import {
	getFieldLabel,
	getFormField,
	type SectionForm,
} from "../lib/form-config";

export function useFormDatabase(form: SectionForm | null, shareToken?: string) {
	const own = useDatabase(form?.database_id, Boolean(form) && !shareToken);
	const shared = useSharedDatabase(
		form?.database_id,
		shareToken,
		Boolean(form) && Boolean(shareToken),
	);
	return (shareToken ? shared : own).data;
}

export interface FormFillBlock {
	id: string;
	type: PageBlockType;
	content: unknown;
	data_config: unknown;
	children: FormFillBlock[];
}

interface FormFillProps {
	section: FormFillBlock;
	form: SectionForm;
	database: Database;
	shareToken?: string;
	renderBlock: (block: FormFillBlock) => ReactNode;
}

const INPUT_TYPES: Partial<Record<PropertyType, string>> = {
	[PropertyType.NUMBER]: "number",
	[PropertyType.EMAIL]: "email",
	[PropertyType.URL]: "url",
	[PropertyType.PHONE]: "tel",
	[PropertyType.DATE]: "date",
};

function sortedOptions(property: DatabaseProperty) {
	return [...property.options].sort(
		(a, b) => Number(a.position) - Number(b.position),
	);
}

function FieldInput({
	id,
	property,
	value,
	onChange,
}: {
	id: string;
	property: DatabaseProperty;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	switch (property.type) {
		case PropertyType.CHECKBOX:
			return (
				<NativeCheckbox
					id={id}
					checked={value === true}
					onChange={(event) => onChange(event.target.checked)}
				/>
			);

		case PropertyType.SELECT:
		case PropertyType.STATUS:
			return (
				<select
					id={id}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value || null)}
					className='h-9 w-full rounded-md border bg-background px-2 text-sm'
				>
					<option value=''>Choose…</option>
					{sortedOptions(property).map((option) => (
						<option key={option.id} value={option.id}>
							{option.name}
						</option>
					))}
				</select>
			);

		case PropertyType.MULTI_SELECT: {
			const selected = Array.isArray(value) ? (value as string[]) : [];
			return (
				<div id={id} className='flex flex-wrap gap-x-4 gap-y-1'>
					{sortedOptions(property).map((option) => (
						<label
							key={option.id}
							className='flex items-center gap-1.5 text-sm'
						>
							<NativeCheckbox
								checked={selected.includes(option.id)}
								onChange={(event) =>
									onChange(
										event.target.checked
											? [...selected, option.id]
											: selected.filter((item) => item !== option.id),
									)
								}
							/>
							{option.name}
						</label>
					))}
				</div>
			);
		}

		case PropertyType.TEXT:
			return (
				<textarea
					id={id}
					rows={3}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					className='w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
				/>
			);

		case PropertyType.DATE: {
			const start = (value as { start?: string } | null)?.start ?? "";
			return (
				<Input
					id={id}
					type='date'
					value={start}
					onChange={(event) =>
						onChange(event.target.value ? { start: event.target.value } : null)
					}
				/>
			);
		}

		default:
			return (
				<Input
					id={id}
					type={INPUT_TYPES[property.type] ?? "text"}
					value={
						typeof value === "number" || typeof value === "string" ? value : ""
					}
					onChange={(event) =>
						onChange(
							property.type === PropertyType.NUMBER
								? event.target.value === ""
									? null
									: Number(event.target.value)
								: event.target.value,
						)
					}
				/>
			);
	}
}

export function FormFill({
	section,
	form,
	database,
	shareToken,
	renderBlock,
}: FormFillProps) {
	const [answers, setAnswers] = useState<Record<string, unknown>>({});
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState<string | null>(null);
	const submit = useSubmitPageForm(shareToken);
	const properties = new Map(
		database.properties.map((item) => [item.id, item]),
	);

	if (sent !== null) {
		return (
			<div className='flex flex-col items-start gap-3 py-2' role='status'>
				<p className='flex items-center gap-2 text-sm'>
					<CheckCircle2 className='size-4 text-emerald-500' />
					{sent || "Thanks, your answer was sent."}
				</p>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => setSent(null)}
				>
					Send another answer
				</Button>
			</div>
		);
	}

	return (
		<form
			className='space-y-4'
			onSubmit={(event) => {
				event.preventDefault();
				setError(null);
				submit.mutate(
					{ sectionBlockId: section.id, databaseId: database.id, answers },
					{
						onSuccess: (result) => {
							setAnswers({});
							setSent(result.success_message ?? form.success_message ?? "");
						},
						onError: (failure) =>
							setError(
								getApiErrorMessage(failure, "Couldn't send your answer."),
							),
					},
				);
			}}
		>
			{section.children.map((child) => {
				const field =
					child.type === PageBlockType.FORM_FIELD
						? getFormField(child.data_config)
						: null;
				const property = field ? properties.get(field.property_id) : undefined;

				if (!field || !property) {
					return child.type === PageBlockType.FORM_FIELD ? null : (
						<div key={child.id}>{renderBlock(child)}</div>
					);
				}

				const inputId = `form-${section.id}-${child.id}`;
				return (
					<div key={child.id} className='space-y-1.5'>
						<label htmlFor={inputId} className='block text-sm font-medium'>
							{getFieldLabel(child.content, property.name)}
							{field.required && (
								<span aria-hidden='true' className='ml-0.5 text-destructive'>
									*
								</span>
							)}
						</label>
						<FieldInput
							id={inputId}
							property={property}
							value={answers[property.id]}
							onChange={(value) =>
								setAnswers((current) => ({ ...current, [property.id]: value }))
							}
						/>
					</div>
				);
			})}

			{error && (
				<p role='alert' className='text-sm text-destructive'>
					{error}
				</p>
			)}

			<Button type='submit' disabled={submit.isPending}>
				{submit.isPending && <Loader2 className='size-4 animate-spin' />}
				{form.submit_label || "Submit"}
			</Button>
		</form>
	);
}
