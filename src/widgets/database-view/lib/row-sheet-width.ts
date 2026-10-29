export const ROW_SHEET_MIN_WIDTH = 480;
export const ROW_SHEET_DEFAULT_WIDTH = 576;
export const ROW_SHEET_MAX_WIDTH = 1100;

const STORAGE_KEY = "taskmanly:row-sheet-width";

/** Keeps the side peek between its minimum and the smaller of 90% of the window and the max. */
export function clampRowSheetWidth(width: number, viewportWidth: number): number {
	const max = Math.max(
		ROW_SHEET_MIN_WIDTH,
		Math.min(ROW_SHEET_MAX_WIDTH, Math.floor(viewportWidth * 0.9)),
	);
	return Math.round(Math.min(max, Math.max(ROW_SHEET_MIN_WIDTH, width)));
}

/** The width this browser last used; the default when storage is empty or blocked. */
export function readRowSheetWidth(): number {
	try {
		const stored = Number(window.localStorage.getItem(STORAGE_KEY));
		return stored > 0 ? stored : ROW_SHEET_DEFAULT_WIDTH;
	} catch {
		return ROW_SHEET_DEFAULT_WIDTH;
	}
}

/** Remembers the width per browser; null forgets it (back to the default). */
export function saveRowSheetWidth(width: number | null): void {
	try {
		if (width === null) window.localStorage.removeItem(STORAGE_KEY);
		else window.localStorage.setItem(STORAGE_KEY, String(width));
	} catch {
		// Private window or blocked storage: the width just isn't remembered.
	}
}
