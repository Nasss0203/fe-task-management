"use client";

import { Check, Trash2 } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
	useAddPropertyOption,
	useDeleteDatabaseProperty,
	useRenameDatabaseProperty,
} from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type FormDatabase,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import type { FormAnswerKey } from "@/entities/page-block/model/page-block.types";
import {
	useDeletePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { cn } from "@/shared/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import { useBlockAutoFocus } from "@/widgets/page-block-editor/ui/page-block-editor-context";

import {
	getFieldLabel,
	getFormField,
	QUIZ_PROPERTY_TYPES,
	type FormFieldCondition,
	type FormOptionConditions,
} from "../lib/form-config";
import { AnswerKeyEditor } from "./form-answer-key-editor";

const FormDatabaseContext = createContext<FormDatabase | null>(null);

export const FormDatabaseProvider = FormDatabaseContext.Provider;

export interface FormQuizState {
	sectionBlockId: string;
	keys: Map<string, FormAnswerKey>;
	unavailable: boolean;
}

const FormQuizContext = createContext<FormQuizState | null>(null);

export const FormQuizProvider = FormQuizContext.Provider;

const FormQuestionsContext = createContext<PageBlockNode[]>([]);

export const FormQuestionsProvider = FormQuestionsContext.Provider;

const ALWAYS_SHOW = "always";

interface FormFieldBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

function QuestionOptions({
	databaseId,
	property,
	correctValue,
}: {
	databaseId: string;
	property: FormDatabase["properties"][number];
	correctValue?: FormAnswerKey["correct_value"] | null;
}) {
	const [name, setName] = useState("");
	const addOption = useAddPropertyOption(databaseId, property.id);

	const submit = () => {
		const trimmed = name.trim();
		if (!trimmed) return;

		addOption.mutate(
			{ name: trimmed },
			{
				onSuccess: () => setName(""),
				onError: () =>
					toast.error("You need edit access to the form database."),
			},
		);
	};

	return (
		<div className='mt-2.5 ml-8 flex flex-wrap items-center gap-1.5'>
			{property.options.map((option) => {
				const isCorrect = Array.isArray(correctValue)
					? correctValue.includes(option.id)
					: correctValue !== null &&
						correctValue !== undefined &&
						correctValue === option.id;

				return (
					<span
						key={option.id}
						className={cn(
							"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs transition-colors",
							isCorrect
								? "border-emerald-500/40 bg-emerald-500/12 font-medium text-emerald-700 dark:text-emerald-300"
								: "border-border/70 bg-muted/60 text-foreground/90",
						)}
					>
						{isCorrect && (
							<Check
								aria-hidden='true'
								className='size-3 text-emerald-600 dark:text-emerald-400'
							/>
						)}
						{option.name}
					</span>
				);
			})}
			<input
				value={name}
				placeholder='+ Add an option'
				aria-label={`Add an option to ${property.name}`}
				onChange={(event) => setName(event.target.value)}
				onKeyDown={(event) => {
					if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
					event.preventDefault();
					submit();
				}}
				onBlur={submit}
				className='min-w-24 flex-1 border-0 bg-transparent p-0 pl-1 text-xs outline-none placeholder:text-muted-foreground/60'
			/>
		</div>
	);
}

function earlierChoiceQuestions(
	questions: PageBlockNode[],
	blockId: string,
	database: FormDatabase,
) {
	return questions
		.slice(
			0,
			questions.findIndex((item) => item.id === blockId),
		)
		.flatMap((question) => {
			const field = getFormField(question.data_config);
			const property = database.properties.find(
				(item) => item.id === field?.property_id,
			);

			return property &&
				(property.type === PropertyType.SELECT ||
					property.type === PropertyType.STATUS)
				? [
						{
							property,
							label: getFieldLabel(question.content, property.name),
						},
					]
				: [];
		});
}

const SMALL_SELECT = "h-7 w-auto max-w-64 text-xs";

function OptionConditionsEditor({
	block,
	database,
	property,
	value,
	onChange,
}: {
	block: PageBlockNode;
	database: FormDatabase;
	property: FormDatabase["properties"][number];
	value: FormOptionConditions | null;
	onChange: (value: FormOptionConditions | null) => void;
}) {
	const questions = useContext(FormQuestionsContext);
	const sources = earlierChoiceQuestions(questions, block.id, database);
	const source = sources.find((item) => item.property.id === value?.property_id);

	if (sources.length === 0) return null;

	return (
		<div className='mt-2.5 ml-8 space-y-1.5 text-xs text-muted-foreground'>
			<div className='flex items-center gap-2'>
				Options depend on
				<Select
					value={source?.property.id ?? ALWAYS_SHOW}
					onValueChange={(next) =>
						onChange(
							next === ALWAYS_SHOW ? null : { property_id: next, options: {} },
						)
					}
				>
					<SelectTrigger
						aria-label='Options depend on'
						size='sm'
						className={SMALL_SELECT}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALWAYS_SHOW}>Nothing</SelectItem>
						{sources.map((item) => (
							<SelectItem key={item.property.id} value={item.property.id}>
								{item.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{source &&
				property.options.map((option) => (
					<div key={option.id} className='flex items-center gap-2'>
						<span className='w-32 truncate text-foreground'>{option.name}</span>
						<Select
							value={value?.options[option.id] ?? ALWAYS_SHOW}
							onValueChange={(next) => {
								const options = { ...value?.options };

								if (next === ALWAYS_SHOW) delete options[option.id];
								else options[option.id] = next;

								onChange({ property_id: source.property.id, options });
							}}
						>
							<SelectTrigger
								aria-label={`Show ${option.name} when`}
								size='sm'
								className={SMALL_SELECT}
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALWAYS_SHOW}>Any {source.label}</SelectItem>
								{source.property.options.map((sourceOption) => (
									<SelectItem key={sourceOption.id} value={sourceOption.id}>
										{sourceOption.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				))}
		</div>
	);
}

function ShowWhenSelect({
	block,
	database,
	condition,
	onChange,
}: {
	block: PageBlockNode;
	database: FormDatabase;
	condition: FormFieldCondition | null;
	onChange: (condition: FormFieldCondition | null) => void;
}) {
	const questions = useContext(FormQuestionsContext);
	const choices = earlierChoiceQuestions(questions, block.id, database).flatMap(
		({ property, label }) =>
			property.options.map((option) => ({
				value: `${property.id}:${option.id}`,
				label: `${label} is ${option.name}`,
				condition: { property_id: property.id, option_id: option.id },
			})),
	);

	if (choices.length === 0) return null;

	const current = `${condition?.property_id}:${condition?.option_id}`;

	return (
		<div className='mt-2.5 ml-8 flex items-center gap-2 text-xs text-muted-foreground'>
			Show
			<Select
				value={
					choices.some((choice) => choice.value === current)
						? current
						: ALWAYS_SHOW
				}
				onValueChange={(value) =>
					onChange(
						choices.find((choice) => choice.value === value)?.condition ?? null,
					)
				}
			>
				<SelectTrigger
					aria-label='Show this question'
					size='sm'
					className={SMALL_SELECT}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALWAYS_SHOW}>Always</SelectItem>
					{choices.map((choice) => (
						<SelectItem key={choice.value} value={choice.value}>
							When {choice.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export function FormFieldBlockEditor({
	block,
	shareToken,
}: FormFieldBlockEditorProps) {
	const database = useContext(FormDatabaseContext);
	const quizState = useContext(FormQuizContext);
	const field = getFormField(block.data_config);
	const property = database?.properties.find(
		(item) => item.id === field?.property_id,
	);
	const savedLabel = getFieldLabel(block.content, property?.name ?? "Question");
	const [label, setLabel] = useState(savedLabel);
	const inputRef = useRef<HTMLInputElement>(null);
	const updateBlock = useUpdatePageBlock(shareToken);
	const deleteBlock = useDeletePageBlock(shareToken);
	const renameColumn = useRenameDatabaseProperty(database?.id ?? "");
	const deleteColumn = useDeleteDatabaseProperty(database?.id ?? "");
	const [confirmDelete, setConfirmDelete] = useState(false);

	const removeQuestion = () =>
		deleteBlock.mutate({ blockId: block.id, pageId: block.page_id });

	useEffect(() => setLabel(savedLabel), [savedLabel]);
	useBlockAutoFocus(block.id, inputRef);

	if (!field || !property) {
		return (
			<p className='text-sm text-muted-foreground'>
				This question&apos;s field is missing from the form database.
			</p>
		);
	}

	const answerKey = quizState?.keys.get(block.id);
	const hasCorrectAnswer = Boolean(
		answerKey && answerKey.correct_value !== null,
	);

	return (
		<div className='group/question w-full rounded-xl border border-border/80 bg-card/95 px-4 py-3 shadow-2xs transition-colors focus-within:border-[#5e6ad2]/60'>
			<div className='flex items-center gap-2.5'>
				<span
					title={`Saved to ${property.name}`}
					className='flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground'
				>
					<PropertyIcon type={property.type} className='size-3.5' />
				</span>
				<input
					ref={inputRef}
					value={label}
					aria-label='Question'
					onChange={(event) => setLabel(event.target.value)}
					onBlur={() => {
						if (label === savedLabel) return;
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							content: { ...block.content, label },
						});
						// Keeps the answers table readable; the question stays usable if this fails.
						if (property.name === savedLabel && label.trim()) {
							renameColumn.mutate({ propertyId: property.id, name: label.trim() });
						}
					}}
					placeholder='Question'
					className='min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium outline-none placeholder:text-muted-foreground/50'
				/>
				{hasCorrectAnswer && answerKey && (
					<span className='shrink-0 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400'>
						+{answerKey.points} {answerKey.points === 1 ? "pt" : "pts"}
					</span>
				)}
				<button
					type='button'
					role='switch'
					aria-checked={field.required}
					onClick={() =>
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							dataConfig: { ...block.data_config, required: !field.required },
						})
					}
					className='flex shrink-0 items-center gap-2 rounded-md px-1 py-0.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground'
				>
					Required
					<span
						aria-hidden='true'
						className={cn(
							"flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
							field.required
								? "justify-end bg-[#5e6ad2]"
								: "bg-muted-foreground/30",
						)}
					>
						<span className='size-3 rounded-full bg-background' />
					</span>
				</button>
				<button
					type='button'
					aria-label='Delete question'
					onClick={() => setConfirmDelete(true)}
					className='flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-destructive focus-visible:opacity-100 group-hover/question:opacity-100 [@media(hover:none)]:opacity-100'
				>
					<Trash2 className='size-3.5' />
				</button>
				<AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this question?</AlertDialogTitle>
							<AlertDialogDescription>
								The answers stay in the &quot;{property.name}&quot; column of the
								table. Deleting the column too removes them for good.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction variant='outline' onClick={removeQuestion}>
								Keep column
							</AlertDialogAction>
							{property.type !== PropertyType.TITLE && (
								<AlertDialogAction
									variant='destructive'
									onClick={() => {
										removeQuestion();
										deleteColumn.mutate(property.id, {
											onError: () =>
												toast.error(
													"The question is gone, but this column can't be deleted.",
												),
										});
									}}
								>
									Delete column too
								</AlertDialogAction>
							)}
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
			{database &&
				(property.type === PropertyType.SELECT ||
					property.type === PropertyType.MULTI_SELECT) && (
					<QuestionOptions
						databaseId={database.id}
						property={property}
						correctValue={answerKey?.correct_value}
					/>
				)}
			{database && property.type === PropertyType.MULTI_SELECT && (
				<OptionConditionsEditor
					block={block}
					database={database}
					property={property}
					value={field.option_conditions}
					onChange={(optionConditions) =>
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							dataConfig: {
								...block.data_config,
								show_when: null,
								option_conditions: optionConditions,
							},
						})
					}
				/>
			)}
			{database && !field.option_conditions && (
				<ShowWhenSelect
					block={block}
					database={database}
					condition={field.show_when}
					onChange={(showWhen) =>
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							dataConfig: { ...block.data_config, show_when: showWhen },
						})
					}
				/>
			)}
			{quizState?.unavailable && (
				<p className='mt-2.5 ml-8 text-xs text-muted-foreground'>
					You need edit access to the answers page to set the correct answer.
				</p>
			)}
			{quizState &&
				!quizState.unavailable &&
				!field.option_conditions &&
				QUIZ_PROPERTY_TYPES.has(property.type) && (
					<AnswerKeyEditor
						sectionBlockId={quizState.sectionBlockId}
						fieldBlockId={block.id}
						property={property}
						answerKey={answerKey}
					/>
				)}
		</div>
	);
}
