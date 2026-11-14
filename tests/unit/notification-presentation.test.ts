import { Crown } from "lucide-react";
import { describe, expect, it } from "vitest";

import { getNotificationPresentation } from "@/entities/notification/lib/notification-presentation";
import type { Notification } from "@/entities/notification/model/notification.types";

const ownershipTransferred: Notification = {
	id: "n-1",
	receiverId: "user-b",
	senderType: "USER",
	actorId: "user-a",
	sourceType: "teamspace",
	sourceId: "ts-1",
	workspaceId: "ws-1",
	type: "teamspace.ownership_transferred",
	title: "Bạn là owner mới của Teamspace",
	message: 'Bạn được chuyển quyền owner của Teamspace "Backend".',
	actionUrl: null,
	metadata: { teamspaceId: "ts-1" },
	readAt: null,
	archivedAt: null,
	createdAt: "2026-11-13T00:00:00.000Z",
	updatedAt: "2026-11-13T00:00:00.000Z",
};

describe("getNotificationPresentation", () => {
	it("shows a teamspace ownership transfer as a teamspace notification", () => {
		expect(getNotificationPresentation(ownershipTransferred)).toEqual({
			icon: Crown,
			title: "Bạn là owner mới của Teamspace",
			description: 'Bạn được chuyển quyền owner của Teamspace "Backend".',
			category: "teamspace",
			tone: "teamspace",
		});
	});
});
