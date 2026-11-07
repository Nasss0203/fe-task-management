import { describe, expect, it } from "vitest";

import {
	getActivityActorName,
	getActivityPresentation,
	groupActivitiesByDay,
} from "@/entities/activity/lib/activity-presentation";
import type { ActivityItem } from "@/entities/activity/model/activity.types";

function activity(overrides: Partial<ActivityItem> = {}): ActivityItem {
	return {
		id: "a-1",
		workspaceId: "ws-1",
		pageId: "page-1",
		entityType: "PAGE_BLOCK",
		entityId: "b-1",
		actorId: "u-1",
		action: "PAGE_BLOCK_UPDATED",
		field: null,
		metadata: null,
		isSystem: false,
		createdAt: "2026-11-07T08:00:00.000Z",
		...overrides,
	};
}

describe("getActivityPresentation", () => {
	it("describes a block edit", () => {
		expect(getActivityPresentation(activity()).text).toBe("edited a block");
	});

	it("describes a cell edit as a row edit", () => {
		expect(
			getActivityPresentation(
				activity({
					entityType: "DATABASE_ROW",
					action: "DATABASE_ROW_UPDATED",
					field: "prop-1",
				}),
			).text,
		).toBe("edited a row");
	});

	it("uses the kind of a property update", () => {
		expect(
			getActivityPresentation(
				activity({
					entityType: "DATABASE",
					action: "DATABASE_PROPERTY_UPDATED",
					metadata: { kind: "OPTION_ADDED" },
				}),
			).text,
		).toBe("added an option to a property");
	});

	it("falls back for an unknown action", () => {
		expect(
			getActivityPresentation(activity({ action: "SOMETHING_NEW" })).text,
		).toBe("made a change");
	});
});

describe("getActivityActorName", () => {
	it("prefers the username, then the email, then System", () => {
		expect(getActivityActorName({ id: "u", username: "nam" })).toBe("nam");
		expect(
			getActivityActorName({ id: "u", username: " ", email: "a@b.c" }),
		).toBe("a@b.c");
		expect(getActivityActorName(null)).toBe("System");
	});
});

describe("groupActivitiesByDay", () => {
	it("groups by local day, newest order kept", () => {
		const now = new Date(2026, 10, 7, 15, 0);
		const groups = groupActivitiesByDay(
			[
				activity({
					id: "1",
					createdAt: new Date(2026, 10, 7, 10).toISOString(),
				}),
				activity({
					id: "2",
					createdAt: new Date(2026, 10, 7, 9).toISOString(),
				}),
				activity({
					id: "3",
					createdAt: new Date(2026, 10, 6, 20).toISOString(),
				}),
				activity({
					id: "4",
					createdAt: new Date(2026, 9, 30, 8).toISOString(),
				}),
			],
			now,
		);

		expect(groups.map((group) => group.label)).toEqual([
			"Today",
			"Yesterday",
			"Oct 30, 2026",
		]);
		expect(groups[0].items.map((item) => item.id)).toEqual(["1", "2"]);
	});
});
