import { describe, expect, it } from "vitest";

import {
	columnRatio,
	resizeColumnPair,
} from "@/widgets/page-block-renderer/lib/column-widths";

describe("columnRatio", () => {
	it("uses the stored share, else an equal one", () => {
		expect(columnRatio({ style_config: { width_ratio: 0.3 } }, 2)).toBe(0.3);
		expect(columnRatio({ style_config: null }, 4)).toBe(0.25);
		expect(columnRatio({ style_config: { width_ratio: "x" } }, 2)).toBe(0.5);
	});
});

describe("resizeColumnPair", () => {
	const half = { ratio: 0.5, width: 400 };

	it("moves the share of the dragged distance from one column to the other", () => {
		expect(resizeColumnPair(half, half, 80)).toEqual([0.6, 0.4]);
		expect(resizeColumnPair(half, half, -80)).toEqual([0.4, 0.6]);
	});

	it("keeps both columns between 10% and 90%", () => {
		expect(resizeColumnPair(half, half, 10_000)).toEqual([0.9, 0.1]);
		expect(resizeColumnPair(half, half, -10_000)).toEqual([0.1, 0.9]);
	});

	it("keeps the pair's combined share in a row of three", () => {
		const third = { ratio: 0.333, width: 300 };
		const [left, right] = resizeColumnPair(third, third, 60);
		expect(left + right).toBeCloseTo(0.666, 3);
		expect(left).toBeGreaterThan(right);
	});
});
