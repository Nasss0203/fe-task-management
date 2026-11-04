"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";

import {
	PropertyType,
	type FormDatabase,
} from "@/entities/database/model/database.types";
import { useSetFormAnswerKey } from "@/entities/page-block/model/page-block.mutations";
import type {
	FormAnswerKey,
	FormAnswerValue,
} from "@/entities/page-block/model/page-block.types";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

const NO_ANSWER = "no-answer";
const SMALL_SELECT = "h-7 w-auto max-w-64 text-xs";

type FormProperty = FormDatabase["properties"][number];

function ChoiceAnswer({
	property,
	value,
	onSave,
}: {
	property: FormProperty;
	value: FormAnswerValue | null;
	onSave: (value: FormAnswerValue | null) => void;
}) {
	const isCheckbox = property.type === PropertyType.CHECKBOX;
	const choices = isCheckbox
		? [
				{ id: "true", name: "Ticked" },
				{ id: "false", name: "Not ticked" },
			]
		: property.options.map((option) => ({ id: option.id, name: option.name }));
	const current = value === null ? NO_ANSWER : String(value);

	return (
		<Select
			value={choices.some((choice) => choice.id === current) ? current : NO_ANSWER}
			onValueChange={(next) => {
				if (next === NO_ANSWER) return onSave(null);
				onSave(isCheckbox ? next === "true" : next);
			}}
		>
			<SelectTrigger
				aria-label='Correct answer'
				size='sm'
				className={cn(
					SMALL_SELECT,
					value !== null &&
						"border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-300",
				)}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={NO_ANSWER}>No answer</SelectItem>
				{choices.map((choice) => (
					<SelectItem key={choice.id} value={choice.id}>
						{choice.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function MultiChoiceAnswer({
	property,
	value,
	onSave,
}: {
	property: FormProperty;
	value: FormAnswerValue | null;
	onSave: (value: FormAnswerValue | null) => void;
}) {
	const selected = new Set(Array.isArray(value) ? value : []);

	return (
		<div role='group' aria-label='Correct answers' className='flex flex-wrap gap-1'>
			{property.options.map((option) => {
				const isSelected = selected.has(option.id);

				return (
					<button
						key={option.id}
						type='button'
						aria-pressed={isSelected}
						onClick={() => {
							const next = property.options
								.map((item) => item.id)
								.filter((id) =>
									id === option.id ? !isSelected : selected.has(id),
								);
							onSave(next.length > 0 ? next : null);
						}}
						className={cn(
							"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 transition-colors",
							isSelected
								? "border-emerald-500/50 bg-emerald-500/12 font-medium text-emerald-700 dark:text-emerald-300"
								: "border-border hover:bg-muted",
						)}
					>
						{isSelected && (
							<Check
								aria-hidden='true'
								className='size-3 text-emerald-600 dark:text-emerald-400'
							/>
						)}
						{option.name}
					</button>
				);
			})}
		</div>
	);
}

function TypedAnswer({
	property,
	value,
	onSave,
}: {
	property: FormProperty;
	value: FormAnswerValue | null;
	onSave: (value: FormAnswerValue | null) => void;
}) {
	const isNumber = property.type === PropertyType.NUMBER;
	const saved = value === null ? "" : String(value);

	return (
		<Input
			key={saved}
			type={isNumber ? "number" : "text"}
			defaultValue={saved}
			placeholder='No answer'
			aria-label='Correct answer'
			title={isNumber ? undefined : "Not case sensitive"}
			className={cn(
				"h-7 w-40 text-xs",
				value !== null &&
					"border-emerald-500/40 bg-emerald-500/5 font-medium text-foreground",
			)}
			onBlur={(event) => {
				const raw = event.target.value.trim();
				if (raw === saved.trim()) return;
				if (raw === "") return onSave(null);
				if (!isNumber) return onSave(raw);

				const number = Number(raw);
				if (!Number.isFinite(number)) {
					event.target.value = saved;
					return;
				}
				onSave(number);
			}}
		/>
	);
}

export function AnswerKeyEditor({
	sectionBlockId,
	fieldBlockId,
	property,
	answerKey,
}: {
	sectionBlockId: string;
	fieldBlockId: string;
	property: FormProperty;
	answerKey: FormAnswerKey | undefined;
}) {
	const setKey = useSetFormAnswerKey();
	const value = answerKey?.correct_value ?? null;
	const points = answerKey?.points ?? 1;

	const save = (correctValue: FormAnswerValue | null, nextPoints = points) =>
		setKey.mutate(
			{ sectionBlockId, fieldBlockId, correctValue, points: nextPoints },
			{
				onError: (failure) =>
					toast.error(getApiErrorMessage(failure, "Couldn't save the answer.")),
			},
		);

	const AnswerInput =
		property.type === PropertyType.MULTI_SELECT
			? MultiChoiceAnswer
			: [PropertyType.SELECT, PropertyType.STATUS, PropertyType.CHECKBOX].includes(
						property.type,
					)
				? ChoiceAnswer
				: TypedAnswer;

	return (
		<div className='mt-2.5 ml-8 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-border/60 pt-2.5 text-xs text-muted-foreground'>
			<span className='font-medium'>Answer</span>
			<AnswerInput property={property} value={value} onSave={(next) => save(next)} />
			<span className='ml-auto font-medium'>Points</span>
			<Input
				key={points}
				type='number'
				min={1}
				step={1}
				defaultValue={points}
				aria-label='Points'
				title={answerKey ? undefined : "Set the answer first"}
				disabled={!answerKey}
				className='h-7 w-16 text-xs'
				onBlur={(event) => {
					const next = Number(event.target.value);
					if (!answerKey || next === points) return;
					if (!Number.isInteger(next) || next < 1) {
						event.target.value = String(points);
						return;
					}
					save(answerKey.correct_value, next);
				}}
			/>
		</div>
	);
}
