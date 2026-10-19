export function assignListNumbers(
	nodes: { type: string; list_number?: number }[],
) {
	let current = 0;

	for (const node of nodes) {
		current = node.type.toUpperCase() === "NUMBERED_LIST" ? current + 1 : 0;

		if (current > 0) {
			node.list_number = current;
		}
	}
}
