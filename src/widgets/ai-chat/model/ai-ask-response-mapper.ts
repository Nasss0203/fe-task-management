import type {
	AiAskResponse, AiCapability, AiGeneration, AiModificationPlan, AiModificationPlanPreview,
	AiPageResolutionCandidate, AskAiRequest, PageCompositionPreview,
} from "@/entities/ai-assistant/model/ai-assistant.types";
import { isAiCapability, isAiModificationPlan, isNonemptyString, isRecord } from "./ai-capability";

interface MappedBase {
	status: string;
	requestId: string | null;
	feedback: string;
	capability: AiCapability | null;
	wireCapability: string | null;
	capabilityValidated: boolean;
	conversationId: string | null;
	/** Chat nhiều lượt: the server opened this conversation instead of the sent one. */
	conversationSwitched: boolean;
	generationId: string | null;
	canConfirm: boolean;
	canDiscard: boolean;
	needsGenerationRead: boolean;
	/** Eligibility is not permission; all actions still require explicit user input/preflight. */
	requiresPreflight: true;
}

export type MappedAiAskResponse = MappedBase & (
	| { kind: "generation"; hasGeneration: true; generation: AiGeneration; preview: PageCompositionPreview | null }
	| { kind: "plan" | "needs-context"; hasGeneration: true; plan: AiModificationPlan;
		preview: AiModificationPlanPreview; afterHydration: { canConfirm: boolean; canDiscard: true } }
	| { kind: "page-selection"; hasGeneration: false; preview: null; candidates: AiPageResolutionCandidate[];
		requestContext: AskAiRequest | null }
	| { kind: "feedback"; hasGeneration: false; preview: null; channel: "business" | "planning"; reason: string | null }
	| { kind: "invalid"; hasGeneration: null; preview: null; reason: string }
	| { kind: "unknown-capability"; hasGeneration: true; preview: null; reason: string }
);

export function sameAiPayload(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, index) => sameAiPayload(item, b[index]));
	if (!isRecord(a) || !isRecord(b)) return false;
	const keys = Object.keys(a);
	return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && sameAiPayload(a[key], b[key]));
}

function isPage(value: unknown): value is AiPageResolutionCandidate {
	return isRecord(value) && isNonemptyString(value.pageId) && isNonemptyString(value.workspaceId) &&
		typeof value.title === "string" && (value.parentPageId === null || isNonemptyString(value.parentPageId)) &&
		(value.teamspaceId === null || isNonemptyString(value.teamspaceId));
}

// M2: a Page named by the user's own edits; the server picks the dates.
function validPageActivity(value: unknown): boolean {
	return isRecord(value) &&
		["LATEST", "TODAY", "YESTERDAY", "N_DAYS_AGO", "LAST_WEEK", "RECENT"].includes(String(value.relative)) &&
		(value.relative === "N_DAYS_AGO"
			? typeof value.days === "number" && Number.isInteger(value.days) && value.days >= 1 && value.days <= 30
			: value.days === null) &&
		(value.titleHint === null || isNonemptyString(value.titleHint));
}

function validPageIntent(value: unknown): boolean {
	return isRecord(value) && ["MODIFY_PAGE", "OTHER", "UNCLEAR"].includes(String(value.intent)) &&
		["TITLE", "CURRENT_PAGE", "UNRESOLVED", "ACTIVITY"].includes(String(value.referenceType)) &&
		(value.pageReference === null || typeof value.pageReference === "string") &&
		(value.instruction === null || typeof value.instruction === "string") && typeof value.needsClarification === "boolean" &&
		(value.referenceType === "ACTIVITY"
			? value.intent === "MODIFY_PAGE" && value.pageReference === null && value.needsClarification === false &&
				validPageActivity(value.activity)
			: value.activity === undefined);
}

/** M1b / M2: Pages the user must pick from; a draft only follows that choice. */
const PICKED_PAGE_METHODS = ["TITLE_IN_SENTENCE", "ACTIVITY"];

export function isValidAiGeneration(value: unknown): value is AiGeneration {
	return isRecord(value) && isNonemptyString(value.id) && isNonemptyString(value.conversation_id) &&
		isNonemptyString(value.workspace_id) && isAiCapability(value.capability) &&
		["PROCESSING", "COMPLETED", "APPLIED", "DISCARDED", "FAILED"].includes(String(value.status)) &&
		isNonemptyString(value.created_at) && !Number.isNaN(Date.parse(value.created_at)) &&
		isNonemptyString(value.updated_at) && !Number.isNaN(Date.parse(value.updated_at)) &&
		["provider", "model", "error_code", "error_message", "applied_at"].every((key) => value[key] === null || typeof value[key] === "string") &&
		Object.hasOwn(value, "output_data");
}

function validCompositionPreview(value: unknown): value is PageCompositionPreview {
	return isRecord(value) && value.type === "PAGE_COMPOSITION" && isRecord(value.page) &&
		typeof value.page.title === "string" && (value.page.icon === null || typeof value.page.icon === "string") &&
		(value.page.cover_url === null || typeof value.page.cover_url === "string") && isRecord(value.summary) &&
		[value.summary.blocks, value.summary.databases, value.summary.database_rows].every((count) =>
			typeof count === "number" && Number.isInteger(count) && count >= 0);
}

function validCompositionOutput(value: unknown): value is Record<string, unknown> & {
	page: Record<string, unknown>; blocks: unknown[]; databases: Array<Record<string, unknown> & { rows: unknown[] }>;
} {
	if (!isRecord(value) || value.type !== "PAGE_COMPOSITION" || value.schemaVersion !== 1 ||
		!isRecord(value.page) || typeof value.page.title !== "string" || !Array.isArray(value.blocks) ||
		!Array.isArray(value.databases)) return false;
	return value.blocks.every((block) => isRecord(block) && isNonemptyString(block.ref) &&
		(block.parentRef === undefined || block.parentRef === null || isNonemptyString(block.parentRef)) &&
		(block.type === "DATABASE_VIEW" ? isNonemptyString(block.databaseRef) && isNonemptyString(block.viewRef) :
			["TEXT", "HEADER", "QUOTE", "TODO", "TOGGLE"].includes(String(block.type)) && isRecord(block.content) &&
			typeof block.content.text === "string" && (block.type !== "TODO" || typeof block.content.checked === "boolean"))) &&
		value.databases.every((database) => isRecord(database) && isNonemptyString(database.ref) &&
			typeof database.name === "string" && Array.isArray(database.properties) && database.properties.every((property) =>
				isRecord(property) && isNonemptyString(property.ref) && typeof property.name === "string" &&
				["TITLE", "TEXT", "NUMBER", "SELECT", "CHECKBOX", "DATE"].includes(String(property.type)) &&
				(property.type !== "SELECT" || Array.isArray(property.options) && property.options.every((option) =>
					isRecord(option) && isNonemptyString(option.ref) && typeof option.name === "string"))) &&
			Array.isArray(database.views) && database.views.every((view) => isRecord(view) &&
				isNonemptyString(view.ref) && typeof view.name === "string" && view.type === "TABLE") &&
			Array.isArray(database.rows) && database.rows.every((row) => isRecord(row) && isRecord(row.values)));
}

function validPlanPreview(value: unknown, plan: AiModificationPlan): value is AiModificationPlanPreview {
	if (!isRecord(value) || value.type !== plan.type || value.pageId !== plan.pageId ||
		value.status !== plan.status || value.summary !== plan.summary || !isRecord(value.counts) ||
		!sameAiPayload(value.operations, plan.operations)) return false;
	const blocks = plan.operations.reduce((sum, operation) => sum + (operation.type === "INSERT_BLOCKS" ? operation.blocks.length : 0), 0);
	const rows = plan.operations.reduce((sum, operation) => sum + (operation.type === "CREATE_DATABASE_ROWS" ? operation.rows.length : 0), 0);
	const ticks = plan.operations.filter((operation) => operation.type === "SET_TODO_CHECKED").length;
	const edits = plan.operations.filter((operation) => operation.type === "SET_BLOCK_TEXT").length;
	const deletes = plan.operations.filter((operation) => operation.type === "DELETE_BLOCK").length;
	return value.counts.operations === plan.operations.length && value.counts.blocks === blocks &&
		value.counts.databaseRows === rows && (value.counts.todoUpdates ?? 0) === ticks &&
		(value.counts.blockEdits ?? 0) === edits && (value.counts.blockDeletes ?? 0) === deletes && (plan.status !== "NEED_MORE_CONTEXT" || sameAiPayload(value.contextRequests, plan.contextRequests));
}

export function isValidAiCompositionGeneration(generation: AiGeneration): boolean {
	const output = generation.output_data;
	return isValidAiGeneration(generation) && generation.capability === "GENERATE_PAGE_COMPOSITION" &&
		validCompositionOutput(output) && validCompositionPreview(generation.preview) &&
		generation.preview.page.title === output.page.title && generation.preview.summary.blocks === output.blocks.length &&
		generation.preview.page.icon === (output.page.icon ?? null) && generation.preview.page.cover_url === (output.page.coverUrl ?? null) &&
		generation.preview.summary.databases === output.databases.length &&
		generation.preview.summary.database_rows === output.databases.reduce((sum, database) => sum + database.rows.length, 0);
}

/** Pure response routing. Never classifies text, performs IO or invokes an action. */
export function mapAiAskResponse(response: AiAskResponse, requestContext?: AskAiRequest): MappedAiAskResponse {
	// Network data is untrusted even when the transport supplies a TypeScript annotation.
	const value: unknown = response;
	const data = isRecord(value) ? value : {};
	const base: MappedBase = {
		status: typeof data.status === "string" ? data.status : "UNKNOWN",
		requestId: isNonemptyString(data.requestId) ? data.requestId : null,
		feedback: typeof data.assistantMessage === "string" ? data.assistantMessage : "Unable to read this AI response.",
		capability: null, wireCapability: typeof data.capability === "string" ? data.capability : null,
		capabilityValidated: false,
		conversationId: isNonemptyString(data.conversationId) ? data.conversationId : null,
		conversationSwitched: data.conversationSwitched === true,
		generationId: isNonemptyString(data.generationId) ? data.generationId : null,
		canConfirm: false, canDiscard: false, needsGenerationRead: false, requiresPreflight: true,
	};
	const invalid = (reason: string): MappedAiAskResponse => ({ ...base, kind: "invalid", hasGeneration: null, preview: null, reason });
	if (!base.requestId || typeof data.assistantMessage !== "string" ||
		!["CREATE_PAGE", "MODIFY_PAGE", "WRITING", "OTHER", "UNCLEAR"].includes(String(data.intent)) ||
		(requestContext?.requestId && requestContext.requestId !== base.requestId)) return invalid("INVALID_ENVELOPE");
	// Another conversation is accepted only when the server says it opened one
	// because the sent conversation did not fit (chat nhiều lượt).
	if (data.conversationSwitched !== undefined && (!base.conversationSwitched || !base.conversationId ||
		!requestContext?.conversationId || base.conversationId === requestContext.conversationId)) return invalid("INVALID_CONVERSATION_SWITCH");
	if (!base.conversationSwitched && base.conversationId && requestContext?.conversationId &&
		base.conversationId !== requestContext.conversationId) return invalid("CONVERSATION_MISMATCH");

	if (data.status === "GENERATION_CREATED") {
		const generation = data.generation;
		if (!base.generationId || !base.conversationId || !isRecord(generation) ||
			generation.id !== base.generationId || generation.conversation_id !== base.conversationId ||
			generation.capability !== data.capability ||
			(requestContext && generation.workspace_id !== requestContext.workspaceId)) return invalid("GENERATION_IDENTITY_MISMATCH");
		if (!isAiCapability(data.capability)) return { ...base, kind: "unknown-capability", hasGeneration: true,
			preview: null, reason: "UNKNOWN_CAPABILITY" };
		if (!isValidAiGeneration(generation) || (requestContext && generation.workspace_id !== requestContext.workspaceId)) return invalid("INVALID_GENERATION");
		if (data.intent === "WRITING") {
			if (!data.capability.startsWith("writing.") || !isRecord(generation.output_data) ||
				typeof generation.output_data.text !== "string") return invalid("INVALID_WRITING_OUTPUT");
			return { ...base, kind: "generation", hasGeneration: true, capabilityValidated: true,
				capability: data.capability, generation, preview: null };
		}
		if (data.intent !== "CREATE_PAGE" || data.capability !== "GENERATE_PAGE_COMPOSITION" ||
			!isValidAiCompositionGeneration(generation) || !validCompositionPreview(generation.preview)) return invalid("INVALID_COMPOSITION_PREVIEW");
		return { ...base, kind: "generation", hasGeneration: true, capabilityValidated: true,
			capability: data.capability, generation, preview: generation.preview,
			canConfirm: generation.status === "COMPLETED", canDiscard: generation.status === "COMPLETED" };
	}

	const planning = data.planning;
	if (data.capability === null) {
		if (!["NEEDS_CLARIFICATION", "UNSUPPORTED_REQUEST", "UNSUPPORTED_OPERATION"].includes(base.status) ||
			!isNonemptyString(data.reason) || planning !== undefined || data.generation !== undefined ||
			data.generationId !== undefined || data.conversationId !== undefined || data.preview !== undefined) return invalid("INVALID_BUSINESS_FEEDBACK");
		return { ...base, kind: "feedback", hasGeneration: false, preview: null, channel: "business", reason: data.reason };
	}
	if (data.capability !== "GENERATE_PAGE_MODIFICATION_PLAN" || !isRecord(planning) ||
		planning.status !== data.status || data.intent !== "MODIFY_PAGE" || !validPageIntent(planning.intent)) return invalid("INVALID_PLANNING_ENVELOPE");
	if (data.status === "PLAN_GENERATED" || data.status === "PLAN_NEEDS_MORE_CONTEXT") {
		const plan = planning.plan;
		const page = planning.page;
		if (!base.generationId || !base.conversationId || !isAiModificationPlan(plan) || !isRecord(plan) ||
			plan.generationId !== base.generationId || plan.conversationId !== base.conversationId || !isPage(page) ||
			!isRecord(planning.intent) || planning.intent.intent !== "MODIFY_PAGE" ||
			// M1b: a Page found in the sentence is planned only for the Page the user picked
			// (checked against plan.pageId below); the AI's own reading of the name stays unresolved.
			(PICKED_PAGE_METHODS.includes(String(planning.resolutionMethod))
				? !requestContext?.selectedPageId
				: planning.intent.needsClarification !== false) ||
			!["CURRENT_CONTEXT", "EXACT_TITLE", ...PICKED_PAGE_METHODS].includes(String(planning.resolutionMethod)) ||
			// M2: only a Page named by the user's edits is planned as ACTIVITY.
			((planning.resolutionMethod === "ACTIVITY") !== (planning.intent.referenceType === "ACTIVITY")) ||
			page.pageId !== plan.pageId || (requestContext && page.workspaceId !== requestContext.workspaceId) ||
			(requestContext?.currentPageId && requestContext.currentPageId !== plan.pageId) ||
			(requestContext?.selectedPageId && requestContext.selectedPageId !== plan.pageId) ||
			(data.status === "PLAN_GENERATED" ? plan.status !== "PLAN_READY" : plan.status !== "NEED_MORE_CONTEXT") ||
			!validPlanPreview(data.preview, plan)) return invalid("INVALID_PLAN_PREVIEW");
		return { ...base, kind: plan.status === "PLAN_READY" ? "plan" : "needs-context", hasGeneration: true,
			capability: "GENERATE_PAGE_MODIFICATION_PLAN", capabilityValidated: true,
			plan, preview: data.preview, needsGenerationRead: true,
			afterHydration: { canConfirm: plan.status === "PLAN_READY", canDiscard: true } };
	}
	if (data.generationId !== undefined || data.conversationId !== undefined || data.generation !== undefined ||
		data.preview !== undefined || planning.plan !== undefined) return invalid("UNEXPECTED_GENERATION");
	if (data.status === "AMBIGUOUS_PAGE") {
		const picked = PICKED_PAGE_METHODS.includes(String(planning.resolutionMethod));
		if (!Array.isArray(planning.candidates) || planning.candidates.length === 0 ||
			(planning.resolutionMethod !== undefined && !picked) ||
			// M1b and M2 offer at most five Pages.
			(picked && planning.candidates.length > 5) ||
			((planning.resolutionMethod === "ACTIVITY") !== (isRecord(planning.intent) && planning.intent.referenceType === "ACTIVITY")) ||
			!planning.candidates.every((page) => isPage(page) && (!requestContext || page.workspaceId === requestContext.workspaceId))) return invalid("INVALID_CANDIDATES");
		return { ...base, kind: "page-selection", hasGeneration: false, preview: null,
			capability: "GENERATE_PAGE_MODIFICATION_PLAN", capabilityValidated: true,
			candidates: planning.candidates, requestContext: requestContext ? { ...requestContext } : null };
	}
	if (!["NEEDS_CLARIFICATION", "PAGE_NOT_FOUND", "UNSUPPORTED_OPERATION", "NOT_A_PAGE_MODIFICATION"].includes(base.status) ||
		(data.status === "NEEDS_CLARIFICATION" && !["UNCLEAR_INTENT", "UNRESOLVED_PAGE", "MISSING_CURRENT_PAGE", "MISSING_CHECKLIST_ITEMS"].includes(String(planning.reason))) ||
		(data.status === "UNSUPPORTED_OPERATION" && planning.reason !== "INSERT_ONLY")) return invalid("INVALID_PLANNING_FEEDBACK");
	return { ...base, kind: "feedback", hasGeneration: false, preview: null,
		capability: "GENERATE_PAGE_MODIFICATION_PLAN", capabilityValidated: true, channel: "planning",
		reason: typeof planning.reason === "string" ? planning.reason : null };
}
