import type { AiGeneration, AiModificationPlan } from "@/entities/ai-assistant/model/ai-assistant.types";

/** Only messages authored by the client are safe to surface as-is. */
export class AiModificationActionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AiModificationActionError";
	}
}

/** Frontend preflight only. The backend remains the authority for permissions
 * and the Page-context fingerprint check when executing the plan. */
export function assertModificationDraftTarget(
	generation: AiGeneration,
	pageId: string,
	workspaceId: string | null,
	currentPageId?: string,
	allowNeedsContext = false,
): asserts generation is AiGeneration & { output_data: AiModificationPlan } {
	if (!workspaceId || generation.workspace_id !== workspaceId) {
		throw new AiModificationActionError("This draft belongs to another workspace. Switch back to its original workspace.");
	}
	if (currentPageId && currentPageId !== pageId) {
		throw new AiModificationActionError("This modification plan belongs to another page. Open its original page to continue.");
	}
	const plan = generation.output_data;
	if (generation.capability !== "GENERATE_PAGE_MODIFICATION_PLAN" ||
		generation.status !== "COMPLETED" || !plan || typeof plan !== "object" || Array.isArray(plan) ||
		!("type" in plan) || plan.type !== "AI_MODIFICATION_PLAN" ||
		!("pageId" in plan) || plan.pageId !== pageId ||
		!("status" in plan) ||
		(plan.status !== "PLAN_READY" && !(allowNeedsContext && plan.status === "NEED_MORE_CONTEXT")) ||
		!("operations" in plan) || !Array.isArray(plan.operations) ||
		(!allowNeedsContext && plan.operations.length === 0)) {
		throw new AiModificationActionError("This AI draft is not ready for this action. Refresh your chat and create a new plan if needed.");
	}
}
