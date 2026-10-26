import type { DatabaseViewProperty } from "@/entities/database/model/database.types";

export function moveViewProperty(
	viewProperties: DatabaseViewProperty[],
	activeId: string,
	overId: string,
): string[] | null {
	const ordered = [...viewProperties]
		.sort((a, b) => Number(a.position) - Number(b.position))
		.map((item) => item.propertyId);
	const from = ordered.indexOf(activeId);
	const to = ordered.indexOf(overId);

	if (from === -1 || to === -1 || from === to) return null;

	const next = [...ordered];
	next.splice(to, 0, ...next.splice(from, 1));
	return next;
}
