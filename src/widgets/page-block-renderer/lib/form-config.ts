import { PropertyType } from "@/entities/database/model/database.types";

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

export interface SectionForm {
	database_id: string;
	submit_label?: string;
	success_message?: string;
}

export interface FormField {
	property_id: string;
	required: boolean;
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
		submit_label:
			typeof form.submit_label === "string" ? form.submit_label : undefined,
		success_message:
			typeof form.success_message === "string"
				? form.success_message
				: undefined,
	};
}

export function getFormField(dataConfig: unknown): FormField | null {
	const config = asRecord(dataConfig);
	if (typeof config.property_id !== "string") return null;
	return {
		property_id: config.property_id,
		required: config.required === true,
	};
}

export function getFieldLabel(content: unknown, fallback: string): string {
	const label = asRecord(content).label;
	return typeof label === "string" && label.trim() ? label : fallback;
}
