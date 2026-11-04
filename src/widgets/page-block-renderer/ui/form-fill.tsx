"use client";

import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { Fragment, useState, type ComponentProps, type ReactNode } from "react";

import {
	PropertyType,
	type FormDatabase,
} from "@/entities/database/model/database.types";
import { useFormDatabaseQuery } from "@/entities/database/model/database.queries";
import { useSubmitPageForm } from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
	formConditions,
	getFieldLabel,
	getFormField,
	getSectionQuiz,
	hiddenFormProperties,
	isFormOptionVisible,
	type SectionForm,
} from "../lib/form-config";

export interface FormFillBlock {
	id: string;
	type: PageBlockType;
	content: unknown;
	data_config: unknown;
	children: FormFillBlock[];
}

export function useFormDatabase(
	section: FormFillBlock,
	form: SectionForm | null,
	shareToken?: string,
) {
	const questions = section.children
		.flatMap((child) => getFormField(child.data_config)?.property_id ?? [])
		.join();

	return useFormDatabaseQuery(
		form?.database_id,
		section.id,
		questions,
		shareToken,
	);
}

interface FormFillProps {
	section: FormFillBlock;
	form: SectionForm;
	database: FormDatabase;
	shareToken?: string;
	renderBlock: (block: FormFillBlock) => ReactNode;
}

// Same surface as the shared Input, so every kind of question looks alike.
const FIELD_SURFACE =
	"rounded-lg border border-input bg-surface shadow-xs transition-[color,box-shadow,border-color] hover:border-foreground/20 dark:bg-input/30";

// One block with dividers, so a question's options read as a single list.
const OPTION_GROUP =
	"divide-y divide-input/80 overflow-hidden rounded-xl border border-input bg-surface shadow-2xs dark:bg-input/30";

const OPTION_ROW =
	"flex min-h-11 cursor-pointer items-center gap-3 px-3.5 py-2.5 text-sm transition-colors hover:bg-foreground/[0.04] has-[:checked]:bg-[#5e6ad2]/10 has-[:checked]:font-medium has-[:focus-visible]:bg-foreground/[0.06]";

const SUB_OPTION_ROW =
	"flex min-h-8 cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-sm transition-colors hover:bg-foreground/[0.05]";

const isBlank = (value: unknown) =>
	value === undefined ||
	value === null ||
	value === false ||
	(typeof value === "string" && value.trim() === "") ||
	(Array.isArray(value) && value.length === 0);

const GROUP_TYPES = new Set<PropertyType>([
	PropertyType.SELECT,
	PropertyType.STATUS,
	PropertyType.MULTI_SELECT,
]);

const INPUT_TYPES: Partial<Record<PropertyType, string>> = {
	[PropertyType.NUMBER]: "number",
	[PropertyType.EMAIL]: "email",
	[PropertyType.URL]: "url",
	[PropertyType.PHONE]: "tel",
	[PropertyType.DATE]: "date",
};

type FormProperty = FormDatabase["properties"][number];

function sortedOptions(property: FormProperty) {
	return [...property.options].sort(
		(a, b) => Number(a.position) - Number(b.position),
	);
}

function FormCheckbox(props: Omit<ComponentProps<"input">, "type">) {
	return (
		<span className='relative flex size-4 shrink-0'>
			<input
				{...props}
				type='checkbox'
				className='peer size-4 cursor-pointer appearance-none rounded border border-muted-foreground/60 transition-colors checked:border-[#5e6ad2] checked:bg-[#5e6ad2]'
			/>
			<Check
				aria-hidden='true'
				strokeWidth={3}
				className='pointer-events-none absolute inset-0.5 size-3 text-primary-foreground opacity-0 peer-checked:opacity-100'
			/>
		</span>
	);
}

function FieldInput({
	id,
	property,
	value,
	invalid,
	errorId,
	checkboxLabel,
	optionFollowUps,
	compact,
	isOptionVisible,
	onChange,
}: {
	id: string;
	property: FormProperty;
	value: unknown;
	invalid: boolean;
	errorId: string;
	checkboxLabel: ReactNode;
	optionFollowUps: (optionId: string) => ReactNode;
	compact: boolean;
	isOptionVisible: (optionId: string) => boolean;
	onChange: (value: unknown) => void;
}) {
	const validity = {
		"aria-invalid": invalid || undefined,
		"aria-describedby": invalid ? errorId : undefined,
	};
	const optionRow = compact ? SUB_OPTION_ROW : OPTION_ROW;
	const optionGroup = compact
		? undefined
		: cn(OPTION_GROUP, invalid && "border-destructive");

	switch (property.type) {
		case PropertyType.CHECKBOX:
			return (
				<div className={optionGroup}>
					<label className={optionRow}>
						<FormCheckbox
							id={id}
							{...validity}
							checked={value === true}
							onChange={(event) => onChange(event.target.checked)}
						/>
						{checkboxLabel}
					</label>
				</div>
			);

		case PropertyType.SELECT:
		case PropertyType.STATUS:
			return (
				<div
					role='radiogroup'
					aria-labelledby={id}
					{...validity}
					className={optionGroup}
				>
					{sortedOptions(property).map((option) => (
						<Fragment key={option.id}>
							<label className={optionRow}>
								<input
									type='radio'
									name={id}
									checked={value === option.id}
									// A second click clears the choice, so an optional question can stay empty.
									onClick={() => value === option.id && onChange(null)}
									onChange={() => onChange(option.id)}
									className='size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-muted-foreground/60 transition-[border] checked:border-[5px] checked:border-[#5e6ad2]'
								/>
								{option.name}
							</label>
							{optionFollowUps(option.id)}
						</Fragment>
					))}
				</div>
			);

		case PropertyType.MULTI_SELECT: {
			const selected = Array.isArray(value) ? (value as string[]) : [];
			return (
				<div
					role='group'
					aria-labelledby={id}
					{...validity}
					className={optionGroup}
				>
					{sortedOptions(property)
						.filter((option) => isOptionVisible(option.id))
						.map((option) => (
							<label key={option.id} className={optionRow}>
								<FormCheckbox
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
					{...validity}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					className={cn(
						FIELD_SURFACE,
						"block w-full px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15 aria-invalid:border-destructive",
					)}
				/>
			);

		case PropertyType.DATE: {
			const start = (value as { start?: string } | null)?.start ?? "";
			return (
				<Input
					id={id}
					type='date'
					{...validity}
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
					{...validity}
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
	const [missing, setMissing] = useState<ReadonlySet<string>>(new Set());
	const [sent, setSent] = useState<string | null>(null);
	const submit = useSubmitPageForm(shareToken);
	const quiz = getSectionQuiz(section.data_config);
	const properties = new Map(
		database.properties.map((item) => [item.id, item]),
	);
	const inputIdOf = (childId: string) => `form-${section.id}-${childId}`;
	const hidden = hiddenFormProperties(
		section.children,
		database.properties,
		answers,
	);
	const rules = formConditions(section.children, database.properties);
	const optionVisible = (propertyId: string, optionId: string) => {
		const rule = rules.options.get(propertyId);

		return isFormOptionVisible(
			optionId,
			rule,
			rule && answers[rule.property_id],
		);
	};
	const shownAnswers = Object.fromEntries(
		Object.entries(answers)
			.filter(([id]) => !hidden.has(id))
			.map(([id, value]) => [
				id,
				Array.isArray(value)
					? value.filter((optionId) => optionVisible(id, optionId as string))
					: value,
			]),
	);

	if (sent !== null) {
		return (
			<div className='mx-auto w-full max-w-xl space-y-3'>
				<div
					role='status'
					className='flex items-start gap-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-2xs'
				>
					<CheckCircle2 className='mt-0.5 size-5 shrink-0 text-emerald-500' />
					<div className='min-w-0 flex-1 space-y-0.5'>
						<p className='text-sm font-semibold'>
							{sent || "Thanks, your answer was sent."}
						</p>
						{quiz && (
							<p className='text-xs text-muted-foreground'>
								Your quiz response has been recorded.
							</p>
						)}
					</div>
				</div>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					className='text-muted-foreground'
					onClick={() => setSent(null)}
				>
					Send another answer
				</Button>
			</div>
		);
	}

	// Checkbox-like answers that depend on a choice read as a sub-list of that choice.
	const isFollowUp = (propertyId: string) => {
		const type = properties.get(propertyId)?.type;

		return (
			(rules.questions.has(propertyId) || rules.options.has(propertyId)) &&
			type !== undefined &&
			(GROUP_TYPES.has(type) || type === PropertyType.CHECKBOX)
		);
	};

	const followUpsOf = (propertyId: string, optionId: string): ReactNode => {
		const followUps = section.children.filter((child) => {
			const field =
				child.type === PageBlockType.FORM_FIELD
					? getFormField(child.data_config)
					: null;
			if (
				!field ||
				!isFollowUp(field.property_id) ||
				hidden.has(field.property_id)
			) {
				return false;
			}

			const condition = rules.questions.get(field.property_id);
			const optionRule = rules.options.get(field.property_id);

			return (
				(condition?.property_id === propertyId &&
					condition.option_id === optionId) ||
				(optionRule?.property_id === propertyId &&
					answers[propertyId] === optionId)
			);
		});

		return followUps.length > 0 ? (
			<div className='bg-foreground/[0.02] py-1.5 pr-2 pl-9'>
				{followUps.map(renderQuestion)}
			</div>
		) : null;
	};

	let questionCounter = 0;

	const renderQuestion = (child: FormFillBlock): ReactNode => {
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

			if (hidden.has(property.id)) return null;

			const inputId = inputIdOf(child.id);
			const errorId = `${inputId}-error`;
			const invalid = missing.has(property.id);
			const followUp = isFollowUp(property.id);
			const questionNumber = followUp ? null : ++questionCounter;
			const labelText = (
				<>
					{getFieldLabel(child.content, property.name)}
					{field.required && (
						<span aria-hidden='true' className='ml-0.5 text-destructive'>
							*
						</span>
					)}
				</>
			);
			return (
				<div
					key={child.id}
					className={cn(!followUp && "space-y-2")}
				>
					{followUp && property.type === PropertyType.CHECKBOX ? null : followUp ? (
						<p
							id={inputId}
							tabIndex={-1}
							className='sr-only text-sm font-medium outline-none'
						>
							{labelText}
						</p>
					) : (
						<div className='flex items-baseline gap-2'>
							{questionNumber !== null && (
								<span
									aria-hidden='true'
									className='inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground'
								>
									{questionNumber}
								</span>
							)}
							{GROUP_TYPES.has(property.type) ? (
								<p
									id={inputId}
									tabIndex={-1}
									className='text-sm font-medium outline-none'
								>
									{labelText}
								</p>
							) : (
								<label htmlFor={inputId} className='block text-sm font-medium'>
									{labelText}
								</label>
							)}
						</div>
					)}
					<FieldInput
						id={inputId}
						property={property}
						value={answers[property.id]}
						invalid={invalid}
						errorId={errorId}
						checkboxLabel={followUp ? labelText : "Yes"}
						compact={followUp}
						isOptionVisible={(optionId) => optionVisible(property.id, optionId)}
							optionFollowUps={(optionId) => followUpsOf(property.id, optionId)}
						onChange={(value) => {
							setAnswers((current) => ({ ...current, [property.id]: value }));
							setMissing((current) => {
								const next = new Set(current);
								next.delete(property.id);
								return next;
							});
						}}
					/>
					{invalid && (
						<p
							id={errorId}
							role='alert'
							className={cn("text-xs text-destructive", followUp && "px-2 pb-1")}
						>
							This question is required.
						</p>
					)}
				</div>
			);
	};

	return (
		<form
			noValidate
			className='mx-auto w-full max-w-xl space-y-6'
			onSubmit={(event) => {
				event.preventDefault();
				setError(null);

				const unanswered = section.children.filter((child) => {
					const field =
						child.type === PageBlockType.FORM_FIELD
							? getFormField(child.data_config)
							: null;
					return (
						field?.required &&
						properties.has(field.property_id) &&
						!hidden.has(field.property_id) &&
						isBlank(shownAnswers[field.property_id])
					);
				});

				setMissing(
					new Set(
						unanswered.flatMap(
							(child) => getFormField(child.data_config)?.property_id ?? [],
						),
					),
				);

				if (unanswered.length > 0) {
					document.getElementById(inputIdOf(unanswered[0].id))?.focus();
					return;
				}

				submit.mutate(
					{
						sectionBlockId: section.id,
						databaseId: database.id,
						answers: shownAnswers,
					},
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
			{quiz && quiz.max_attempts !== null && (
				<div className='flex items-center gap-2 rounded-lg border border-[#5e6ad2]/25 bg-[#5e6ad2]/8 px-3 py-2 text-xs font-medium text-[#5e6ad2] dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300'>
					<span>
						Quiz · Up to {quiz.max_attempts}{" "}
						{quiz.max_attempts === 1 ? "attempt" : "attempts"} per person
					</span>
				</div>
			)}

			{section.children.map((child) => {
				const field =
					child.type === PageBlockType.FORM_FIELD
						? getFormField(child.data_config)
						: null;

				return field && isFollowUp(field.property_id)
					? null
					: renderQuestion(child);
			})}

			{error && (
				<p
					role='alert'
					className='rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive'
				>
					{error}
				</p>
			)}

			<Button
				type='submit'
				disabled={submit.isPending}
				className='w-full sm:w-auto sm:min-w-32'
			>
				{submit.isPending && <Loader2 className='size-4 animate-spin' />}
				{form.submit_label || "Submit"}
			</Button>
		</form>
	);
}
