import { getSafeRedirectPath } from "@/shared/lib/safe-redirect";

/**
 * One buyer's intent to purchase one template, kept in sessionStorage so a
 * retry after an unclear result reuses the same Idempotency-Key, and so the
 * Stripe return page (which only gets `purchaseId`) can find its template.
 *
 * It holds ids only: no Stripe session or payment data.
 */
export interface PurchaseIntent {
	userId: string;
	templateId: string;
	idempotencyKey: string;
	/** Set once the backend has created the purchase. */
	purchaseId?: string;
	/** Template detail page to return to (landing or workspace gallery). */
	returnPath: string;
}

const STORAGE_KEY = "taskmanly.template-purchase-intents.v1";

function readAll(): PurchaseIntent[] {
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];
		// Storage is client-writable: never trust the stored return path.
		return (parsed as PurchaseIntent[]).map((intent) => ({
			...intent,
			returnPath: getSafeRedirectPath(intent.returnPath, "/templates"),
		}));
	} catch {
		return [];
	}
}

function writeAll(intents: PurchaseIntent[]) {
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intents));
	} catch {
		// Storage unavailable: the flow still works, only retry reuse is lost.
	}
}

const sameTemplate =
	(userId: string, templateId: string) => (intent: PurchaseIntent) =>
		intent.userId === userId && intent.templateId === templateId;

export function getPurchaseIntent(
	userId: string,
	templateId: string,
): PurchaseIntent | null {
	return readAll().find(sameTemplate(userId, templateId)) ?? null;
}

export function findPurchaseIntentByPurchaseId(
	userId: string,
	purchaseId: string,
): PurchaseIntent | null {
	return (
		readAll().find(
			(intent) => intent.userId === userId && intent.purchaseId === purchaseId,
		) ?? null
	);
}

export function savePurchaseIntent(intent: PurchaseIntent): PurchaseIntent {
	const isSame = sameTemplate(intent.userId, intent.templateId);
	writeAll([...readAll().filter((item) => !isSame(item)), intent]);
	return intent;
}

/** A new purchase intent always gets a fresh key. */
export function startPurchaseIntent(
	userId: string,
	templateId: string,
	returnPath: string,
): PurchaseIntent {
	return savePurchaseIntent({
		userId,
		templateId,
		returnPath,
		idempotencyKey: crypto.randomUUID(),
	});
}

export function clearPurchaseIntent(userId: string, templateId: string) {
	const isSame = sameTemplate(userId, templateId);
	writeAll(readAll().filter((item) => !isSame(item)));
}
