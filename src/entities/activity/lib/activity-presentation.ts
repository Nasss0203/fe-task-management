import {
	ArrowRightLeft,
	Blocks,
	Columns3,
	FilePen,
	FilePlus,
	History,
	ListPlus,
	PenLine,
	RotateCcw,
	Table2,
	Trash2,
} from "lucide-react";

import type {
	ActivityActor,
	ActivityItem,
	ActivityTarget,
} from "../model/activity.types";

export interface ActivityPresentation {
	icon: typeof History;
	text: string;
	subject?: string;
}

export interface ActivityValueChange {
	propertyName: string;
	propertyType: string | null;
	cleared: boolean;
	value: unknown;
	options: ActivityTarget["options"];
	people: string[];
}

function rowSubject(activity: ActivityItem): string | undefined {
	const target = activity.target;
	if (!target) return undefined;
	if (target.rowTitle === null) return "a deleted row";
	return target.rowTitle.trim() || "Untitled";
}

function rowPresentation(
	icon: typeof History,
	verb: string,
	activity: ActivityItem,
): ActivityPresentation {
	const subject = rowSubject(activity);
	return subject
		? { icon, text: verb, subject }
		: { icon, text: `${verb} a row` };
}

export function getActivityValueChange(
	activity: ActivityItem,
): ActivityValueChange | null {
	const target = activity.target;
	if (activity.action !== "DATABASE_ROW_UPDATED" || !target?.propertyName)
		return null;

	return {
		propertyName: target.propertyName,
		propertyType: target.propertyType,
		cleared: activity.metadata?.kind === "CLEARED",
		value: activity.newValue ?? null,
		options: target.options,
		people: target.people.map((person) => person.username || "Unknown user"),
	};
}

const OPTION_TEXT: Record<string, string> = {
	OPTION_ADDED: "added an option to a property",
	OPTION_UPDATED: "edited an option of a property",
	OPTION_DELETED: "removed an option from a property",
};

export function getActivityActorName(actor?: ActivityActor | null): string {
	return actor?.username?.trim() || actor?.email?.trim() || "System";
}

export function getActivityPresentation(
	activity: ActivityItem,
): ActivityPresentation {
	const kind =
		typeof activity.metadata?.kind === "string" ? activity.metadata.kind : null;

	switch (activity.action) {
		case "PAGE_CREATED":
			return { icon: FilePlus, text: "created the page" };
		case "PAGE_UPDATED":
			if (kind === "MOVED")
				return { icon: ArrowRightLeft, text: "moved the page" };
			if (kind === "PRESET")
				return { icon: FilePen, text: "applied a page preset" };
			return { icon: FilePen, text: "edited the page" };
		case "PAGE_DELETED":
			return { icon: Trash2, text: "moved the page to trash" };
		case "PAGE_RESTORED":
			return { icon: RotateCcw, text: "restored the page" };
		case "PAGE_BLOCK_CREATED":
			return {
				icon: Blocks,
				text: kind === "RESTORED" ? "restored a block" : "added a block",
			};
		case "PAGE_BLOCK_UPDATED":
			return { icon: PenLine, text: "edited a block" };
		case "PAGE_BLOCK_DELETED":
			return { icon: Trash2, text: "deleted a block" };
		case "PAGE_BLOCK_REORDERED":
			return { icon: ArrowRightLeft, text: "reordered blocks" };
		case "DATABASE_CREATED":
			return { icon: Table2, text: "created a database" };
		case "DATABASE_RENAMED":
			return { icon: Table2, text: "renamed a database" };
		case "DATABASE_PROPERTY_ADDED":
			return activity.target?.propertyName
				? {
						icon: Columns3,
						text: "added property",
						subject: activity.target.propertyName,
					}
				: { icon: Columns3, text: "added a property" };
		case "DATABASE_PROPERTY_UPDATED":
			return {
				icon: Columns3,
				text: (kind && OPTION_TEXT[kind]) || "edited a property",
			};
		case "DATABASE_PROPERTY_DELETED":
			return { icon: Columns3, text: "deleted a property" };
		case "DATABASE_ROW_CREATED":
			return rowPresentation(ListPlus, "added", activity);
		case "DATABASE_ROW_UPDATED":
			return rowPresentation(PenLine, "edited", activity);
		case "DATABASE_ROW_DELETED":
			return { icon: Trash2, text: "deleted a row" };
		case "DATABASE_ROW_MOVED":
			return kind === "PARENT_CHANGED"
				? rowPresentation(ArrowRightLeft, "changed the parent of", activity)
				: rowPresentation(ArrowRightLeft, "moved", activity);
		default:
			return { icon: History, text: "made a change" };
	}
}

export interface ActivityDayGroup {
	label: string;
	items: ActivityItem[];
}

function dayKey(date: Date): string {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function groupActivitiesByDay(
	items: ActivityItem[],
	now: Date = new Date(),
): ActivityDayGroup[] {
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);

	const groups = new Map<string, ActivityDayGroup>();

	for (const item of items) {
		const date = new Date(item.createdAt);
		const key = dayKey(date);
		let group = groups.get(key);

		if (!group) {
			const label =
				key === dayKey(now)
					? "Today"
					: key === dayKey(yesterday)
						? "Yesterday"
						: date.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							});
			group = { label, items: [] };
			groups.set(key, group);
		}

		group.items.push(item);
	}

	return [...groups.values()];
}
