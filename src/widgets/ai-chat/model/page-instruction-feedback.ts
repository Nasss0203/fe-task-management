import type { GeneratePagePlanFromInstructionResponse } from "@/entities/ai-assistant/model/ai-assistant.types";

export function getPageInstructionFeedback(
	result: GeneratePagePlanFromInstructionResponse,
): string {
	switch (result.status) {
		case "UNSUPPORTED_OPERATION":
			return "Only adding blocks or database rows is currently supported.";
		case "NOT_A_PAGE_MODIFICATION":
			return "This request does not modify an existing page. Choose Create page or a Writing action instead.";
		case "NEEDS_CLARIFICATION":
			return result.reason === "MISSING_CURRENT_PAGE"
				? "Which page do you want to edit? Include its name, for example: “Thêm checklist vào page Release 2.0”."
				: result.reason === "UNRESOLVED_PAGE"
					? "I couldn't determine which page you meant. Please specify its exact name."
					: "Could you clarify what changes you want to make to an existing page?";
		case "PAGE_NOT_FOUND":
			return "I couldn't find a page with that name that you can access in this workspace. Check the name and try again.";
		case "AMBIGUOUS_PAGE":
			return "Multiple pages match that name. Choose the page you want to modify:";
		case "PLAN_GENERATED":
			return `Preview for “${result.page.title}” is ready. No changes have been applied.`;
		case "PLAN_NEEDS_MORE_CONTEXT":
			return `More information is needed before editing “${result.page.title}”.`;
	}
}
