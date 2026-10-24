import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell } from "lucide-react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { Notification } from "@/entities/notification/model/notification.types";
import { NotificationItemShell } from "@/widgets/workspace-sidebar/ui/notifications/notification-item-shell";

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a
			href={href}
			{...props}
			onClick={(event) => {
				// jsdom cannot navigate; keep the handler under test.
				(props as { onClick?: (e: unknown) => void }).onClick?.(event);
				event.preventDefault();
			}}
		>
			{children}
		</a>
	),
}));

function notification(overrides: Partial<Notification> = {}): Notification {
	return {
		id: "n-1",
		receiverId: "user-1",
		senderType: "SYSTEM",
		actorId: null,
		sourceType: "teamspace",
		sourceId: null,
		workspaceId: null,
		type: "teamspace.invitation_received",
		title: "Lời mời tham gia Teamspace",
		message: 'Bạn được mời tham gia Teamspace "Backend".',
		actionUrl: "/teamspaces/invitations",
		metadata: null,
		readAt: null,
		archivedAt: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}

function renderShell(item: Notification) {
	const onRead = vi.fn();
	render(
		<NotificationItemShell
			notification={item}
			icon={Bell}
			tone='teamspace'
			onRead={onRead}
		/>,
	);
	return onRead;
}

describe("NotificationItemShell", () => {
	it("opens a known internal page and marks the notification read", async () => {
		const item = notification();
		const onRead = renderShell(item);

		const link = screen.getByRole("link", { name: /Lời mời tham gia Teamspace/ });
		expect(link).toHaveAttribute("href", "/teamspaces/invitations");
		expect(screen.getByText("Unread")).toBeInTheDocument();

		await userEvent.click(link);

		expect(onRead).toHaveBeenCalledWith(item);
	});

	it.each([
		"https://evil.example/teamspaces/invitations",
		"//evil.example/teamspaces/invitations",
		"/invite/workspace?token=secret",
	])("does not link to %s but still marks it read", async (actionUrl) => {
		const onRead = renderShell(notification({ actionUrl }));

		expect(screen.queryByRole("link")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button"));

		expect(onRead).toHaveBeenCalledTimes(1);
	});

	it("does not mark an already read notification again", async () => {
		const onRead = renderShell(
			notification({ actionUrl: null, readAt: new Date().toISOString() }),
		);

		expect(screen.queryByText("Unread")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button"));

		expect(onRead).not.toHaveBeenCalled();
	});
});
