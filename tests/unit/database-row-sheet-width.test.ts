import { afterEach, describe, expect, it, vi } from "vitest";

import {
	clampRowSheetWidth,
	readRowSheetWidth,
	ROW_SHEET_DEFAULT_WIDTH,
	ROW_SHEET_MAX_WIDTH,
	ROW_SHEET_MIN_WIDTH,
	saveRowSheetWidth,
} from "@/widgets/database-view/lib/row-sheet-width";

afterEach(() => {
	vi.restoreAllMocks();
	window.localStorage.clear();
});

describe("clampRowSheetWidth", () => {
	it("keeps the width between the minimum and 90% of the window", () => {
		expect(clampRowSheetWidth(200, 1600)).toBe(ROW_SHEET_MIN_WIDTH);
		expect(clampRowSheetWidth(700, 1600)).toBe(700);
		expect(clampRowSheetWidth(1000, 1000)).toBe(900);
		expect(clampRowSheetWidth(5000, 3000)).toBe(ROW_SHEET_MAX_WIDTH);
	});

	it("never goes below the minimum on a narrow window", () => {
		expect(clampRowSheetWidth(900, 500)).toBe(ROW_SHEET_MIN_WIDTH);
	});
});

describe("row sheet width storage", () => {
	it("remembers a width and forgets it on reset", () => {
		saveRowSheetWidth(720);
		expect(readRowSheetWidth()).toBe(720);
		saveRowSheetWidth(null);
		expect(readRowSheetWidth()).toBe(ROW_SHEET_DEFAULT_WIDTH);
	});

	it("falls back to the default when storage is blocked", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("blocked");
		});
		expect(() => saveRowSheetWidth(720)).not.toThrow();
		expect(readRowSheetWidth()).toBe(ROW_SHEET_DEFAULT_WIDTH);
	});
});
