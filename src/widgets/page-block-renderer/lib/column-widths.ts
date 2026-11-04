import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

const MIN_RATIO = 0.1;
const MAX_RATIO = 0.9;

/** A column's share of a row of `count` columns; one without a ratio gets an equal share. */
export function columnRatio(
	column: Pick<PageBlockNode, "style_config">,
	count: number,
): number {
	const ratio = column.style_config?.width_ratio;
	return typeof ratio === "number" && ratio > 0 ? ratio : 1 / count;
}

/**
 * New ratios of two neighbour columns after dragging the divider between them
 * by `deltaPx`: their combined share stays, each keeps within 10–90%.
 */
export function resizeColumnPair(
	left: { ratio: number; width: number },
	right: { ratio: number; width: number },
	deltaPx: number,
): [number, number] {
	const total = left.ratio + right.ratio;
	const pixels = left.width + right.width;
	if (pixels <= 0) return [left.ratio, right.ratio];

	const min = Math.max(MIN_RATIO, total - MAX_RATIO);
	const max = Math.min(MAX_RATIO, total - MIN_RATIO);
	const next = Math.min(
		max,
		Math.max(min, left.ratio + (deltaPx / pixels) * total),
	);
	const round = (value: number) => Math.round(value * 1000) / 1000;

	return [round(next), round(total - next)];
}
