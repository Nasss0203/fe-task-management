import {
	PropertyType,
	type FormDatabase,
} from "@/entities/database/model/database.types";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

export const FORM_PROPERTY_TYPES = new Set<PropertyType>([
	PropertyType.TITLE,
	PropertyType.TEXT,
	PropertyType.NUMBER,
	PropertyType.SELECT,
	PropertyType.MULTI_SELECT,
	PropertyType.STATUS,
	PropertyType.DATE,
	PropertyType.CHECKBOX,
	PropertyType.URL,
	PropertyType.EMAIL,
	PropertyType.PHONE,
]);

/** Offered first in "Add question": each one creates its own column. */
export const NEW_QUESTION_TYPES: { label: string; type: PropertyType }[] = [
	{ label: "Short answer", type: PropertyType.TEXT },
	{ label: "Email", type: PropertyType.EMAIL },
	{ label: "Number", type: PropertyType.NUMBER },
	{ label: "Date", type: PropertyType.DATE },
	{ label: "Single choice", type: PropertyType.SELECT },
	{ label: "Multiple choice", type: PropertyType.MULTI_SELECT },
	{ label: "Checkbox", type: PropertyType.CHECKBOX },
	{ label: "Phone", type: PropertyType.PHONE },
	{ label: "Link", type: PropertyType.URL },
];

/** Column names are unique, and a form can ask two questions of the same type. */
export function nextColumnName(label: string, taken: string[]): string {
	const names = new Set(taken.map((name) => name.toLowerCase()));
	let name = label;
	for (let count = 2; names.has(name.toLowerCase()); count += 1) {
		name = `${label} ${count}`;
	}
	return name;
}

export interface SectionForm {
	database_id: string;
	respondent_property_id?: string;
	submit_label?: string;
	success_message?: string;
}

export const QUIZ_PROPERTY_TYPES = new Set<PropertyType>([
	PropertyType.TITLE,
	PropertyType.TEXT,
	PropertyType.NUMBER,
	PropertyType.SELECT,
	PropertyType.MULTI_SELECT,
	PropertyType.STATUS,
	PropertyType.CHECKBOX,
]);

export const QUIZ_SHOW_RESULTS = ["none", "score", "results"] as const;

export type QuizShowResult = (typeof QUIZ_SHOW_RESULTS)[number];

export interface SectionQuiz {
	show_result: QuizShowResult;
	max_attempts: number | null;
	score_property_id: string;
}

export interface FormFieldCondition {
	property_id: string;
	option_id: string;
}

/** `options` maps an option of the question to the source option that shows it. */
export interface FormOptionConditions {
	property_id: string;
	options: Record<string, string>;
}

export interface FormField {
	property_id: string;
	required: boolean;
	show_when: FormFieldCondition | null;
	option_conditions: FormOptionConditions | null;
}

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

export function getSectionForm(dataConfig: unknown): SectionForm | null {
	const form = asRecord(asRecord(dataConfig).form);
	if (typeof form.database_id !== "string") return null;

	return {
		database_id: form.database_id,
		respondent_property_id:
			typeof form.respondent_property_id === "string"
				? form.respondent_property_id
				: undefined,
		submit_label:
			typeof form.submit_label === "string" ? form.submit_label : undefined,
		success_message:
			typeof form.success_message === "string"
				? form.success_message
				: undefined,
	};
}

export function getSectionQuiz(dataConfig: unknown): SectionQuiz | null {
	const quiz = asRecord(asRecord(dataConfig).quiz);
	if (typeof quiz.score_property_id !== "string") return null;

	return {
		show_result: QUIZ_SHOW_RESULTS.includes(quiz.show_result as QuizShowResult)
			? (quiz.show_result as QuizShowResult)
			: "score",
		max_attempts:
			typeof quiz.max_attempts === "number" ? quiz.max_attempts : null,
		score_property_id: quiz.score_property_id,
	};
}

export function getFormField(dataConfig: unknown): FormField | null {
	const config = asRecord(dataConfig);
	if (typeof config.property_id !== "string") return null;

	const showWhen = asRecord(config.show_when);
	const optionConditions = asRecord(config.option_conditions);

	return {
		property_id: config.property_id,
		required: config.required === true,
		show_when:
			typeof showWhen.property_id === "string" &&
			typeof showWhen.option_id === "string"
				? {
						property_id: showWhen.property_id,
						option_id: showWhen.option_id,
					}
				: null,
		option_conditions:
			typeof optionConditions.property_id === "string"
				? {
						property_id: optionConditions.property_id,
						options: Object.fromEntries(
							Object.entries(asRecord(optionConditions.options)).filter(
								(entry): entry is [string, string] =>
									typeof entry[1] === "string",
							),
						),
					}
				: null,
	};
}

/** Same rules as the API: only an existing option of an earlier question counts. */
export function formConditions(
	questions: { type: PageBlockType; data_config: unknown }[],
	properties: FormDatabase["properties"],
): {
	questions: Map<string, FormFieldCondition>;
	options: Map<string, FormOptionConditions>;
} {
	const earlier = new Set<string>();
	const conditions = new Map<string, FormFieldCondition>();
	const optionConditions = new Map<string, FormOptionConditions>();

	for (const question of questions) {
		const field =
			question.type === PageBlockType.FORM_FIELD
				? getFormField(question.data_config)
				: null;
		if (!field) continue;

		const condition = field.show_when;
		const applies =
			condition &&
			earlier.has(condition.property_id) &&
			properties
				.find((item) => item.id === condition.property_id)
				?.options.some((option) => option.id === condition.option_id);

		const optionRule = field.option_conditions;
		const sourceOptions = properties
			.find((item) => item.id === optionRule?.property_id)
			?.options.map((option) => option.id);

		if (optionRule && sourceOptions && earlier.has(optionRule.property_id)) {
			optionConditions.set(field.property_id, {
				property_id: optionRule.property_id,
				// A mapping to a deleted option must not hide the option for good.
				options: Object.fromEntries(
					Object.entries(optionRule.options).filter(([, source]) =>
						sourceOptions.includes(source),
					),
				),
			});
		}

		earlier.add(field.property_id);

		if (applies) conditions.set(field.property_id, condition);
	}

	return { questions: conditions, options: optionConditions };
}

export function isFormOptionVisible(
	optionId: string,
	rule: FormOptionConditions | undefined,
	sourceAnswer: unknown,
): boolean {
	return (
		!rule ||
		rule.options[optionId] === undefined ||
		rule.options[optionId] === sourceAnswer
	);
}

export function hiddenFormProperties(
	questions: { type: PageBlockType; data_config: unknown }[],
	properties: FormDatabase["properties"],
	answers: Record<string, unknown>,
): Set<string> {
	const hidden = new Set<string>();
	const rules = formConditions(questions, properties);

	for (const question of questions) {
		const propertyId =
			question.type === PageBlockType.FORM_FIELD
				? getFormField(question.data_config)?.property_id
				: undefined;
		if (!propertyId) continue;

		const condition = rules.questions.get(propertyId);
		const optionRule = rules.options.get(propertyId);

		if (
			condition &&
			(hidden.has(condition.property_id) ||
				answers[condition.property_id] !== condition.option_id)
		) {
			hidden.add(propertyId);
		}

		if (optionRule) {
			const sourceAnswer = answers[optionRule.property_id];
			const options =
				properties.find((item) => item.id === propertyId)?.options ?? [];

			if (
				hidden.has(optionRule.property_id) ||
				sourceAnswer === undefined ||
				sourceAnswer === null ||
				!options.some((option) =>
					isFormOptionVisible(option.id, optionRule, sourceAnswer),
				)
			) {
				hidden.add(propertyId);
			}
		}
	}

	return hidden;
}

export function getFieldLabel(content: unknown, fallback: string): string {
	const label = asRecord(content).label;
	return typeof label === "string" && label.trim() ? label : fallback;
}
