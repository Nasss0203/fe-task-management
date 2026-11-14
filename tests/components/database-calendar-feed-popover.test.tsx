import { fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	PropertyType,
	type DatabaseProperty,
	type GoogleCalendarSyncStatus,
} from "@/entities/database/model/database.types";
import { DatabaseCalendarFeedPopover } from "@/widgets/database-view/ui/database-calendar-feed-popover";

const upsert = vi.fn();
const revoke = vi.fn();
const connectGoogle = vi.fn();
const disconnectGoogle = vi.fn();
const upsertGoogleSync = vi.fn();
const deleteGoogleSync = vi.fn();
const runGoogleSync = vi.fn();
let feed: { token: string; datePropertyId: string } | null = null;
let google: GoogleCalendarSyncStatus | undefined;

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/entities/database/model/database.queries", () => ({
	useCalendarFeed: () => ({ data: feed, isLoading: false }),
	useGoogleCalendarSync: () => ({ data: google, isLoading: false }),
}));
vi.mock("@/entities/database/model/database.mutations", () => ({
	useUpsertCalendarFeed: () => ({ mutate: upsert, isPending: false }),
	useRevokeCalendarFeed: () => ({ mutate: revoke, isPending: false }),
	useConnectGoogleCalendar: () => ({ mutate: connectGoogle, isPending: false }),
	useDisconnectGoogleCalendar: () => ({ mutate: disconnectGoogle, isPending: false }),
	useUpsertGoogleCalendarSync: () => ({ mutate: upsertGoogleSync, isPending: false }),
	useDeleteGoogleCalendarSync: () => ({ mutate: deleteGoogleSync, isPending: false }),
	useRunGoogleCalendarSync: () => ({ mutate: runGoogleSync, isPending: false }),
}));

const connectedStatus = (
	sync: GoogleCalendarSyncStatus["sync"] = null,
	connectionError: GoogleCalendarSyncStatus["connectionError"] = null,
): GoogleCalendarSyncStatus => ({
	connected: true,
	googleEmail: "owner@example.com",
	connectionError,
	sync,
});

const property = (id: string, type: PropertyType, position: number) =>
	({ id, name: id, type, position }) as unknown as DatabaseProperty;

const open = (properties: DatabaseProperty[]) => {
	render(<DatabaseCalendarFeedPopover databaseId='db-1' properties={properties} />);
	fireEvent.click(screen.getByRole("button", { name: "Subscribe in a calendar app" }));
};

beforeEach(() => {
	feed = null;
	google = { connected: false, googleEmail: null, connectionError: null, sync: null };
	vi.clearAllMocks();
	window.history.replaceState(null, "", "/");
});

describe("DatabaseCalendarFeedPopover", () => {
	it("asks for a Date property when the database has none", () => {
		open([property("Name", PropertyType.TITLE, 0)]);

		expect(screen.getByText(/Add a Date property/)).toBeInTheDocument();
		expect(screen.queryByText("Copy link")).not.toBeInTheDocument();
	});

	it("creates a link for the picked Date property", () => {
		open([property("Name", PropertyType.TITLE, 0), property("Due", PropertyType.DATE, 1)]);

		fireEvent.click(screen.getByRole("button", { name: "Due" }));

		expect(upsert).toHaveBeenCalledWith("Due", expect.any(Object));
	});

	it("shows the feed link once one exists", () => {
		feed = { token: "abc.def", datePropertyId: "Due" };
		open([property("Due", PropertyType.DATE, 0)]);

		expect(screen.getByLabelText("Calendar link")).toHaveValue(
			`${process.env.NEXT_PUBLIC_API_URL}/calendar-feeds/abc.def.ics`,
		);
		expect(screen.getByText("In use")).toBeInTheDocument();
	});

	it("starts Google sign-in with the current page as the return path", () => {
		window.history.replaceState(null, "", "/pages/p-1?view=v-1");
		open([property("Due", PropertyType.DATE, 0)]);

		fireEvent.click(screen.getByRole("button", { name: "Connect Google Calendar" }));

		expect(connectGoogle).toHaveBeenCalledWith("/pages/p-1?view=v-1", expect.any(Object));
		expect(
			screen.queryByRole("button", { name: "Disconnect Google" }),
		).not.toBeInTheDocument();
	});

	it("syncs the picked Date property once Google is connected", () => {
		google = connectedStatus();
		open([property("Due", PropertyType.DATE, 0)]);

		expect(screen.getByText("owner@example.com")).toBeInTheDocument();
		fireEvent.click(screen.getAllByRole("button", { name: "Due" })[1]);

		expect(upsertGoogleSync).toHaveBeenCalledWith(
			{ datePropertyId: "Due" },
			expect.any(Object),
		);
	});

	it("shows the sync state with run and turn off actions", () => {
		google = connectedStatus({
			datePropertyId: "Due",
			assignedToMeOnly: false,
			lastSyncedAt: null,
			lastError: "CALENDAR_MISSING",
		});
		open([property("Due", PropertyType.DATE, 0)]);

		expect(screen.getByText("Syncing")).toBeInTheDocument();
		expect(screen.getByRole("alert")).toHaveTextContent("Google calendar was deleted");
		fireEvent.click(screen.getByRole("button", { name: "Sync now" }));
		fireEvent.click(screen.getByRole("button", { name: "Turn off sync" }));

		expect(runGoogleSync).toHaveBeenCalled();
		expect(deleteGoogleSync).toHaveBeenCalled();
	});

	it("toggles syncing only rows assigned to the user", () => {
		google = connectedStatus({
			datePropertyId: "Due",
			assignedToMeOnly: false,
			lastSyncedAt: null,
			lastError: null,
		});
		open([property("Due", PropertyType.DATE, 0), property("Owner", PropertyType.PERSON, 1)]);

		const toggle = screen.getByRole("menuitemcheckbox", { name: /Only rows assigned to me/ });
		expect(toggle).toHaveAttribute("aria-checked", "false");
		fireEvent.click(toggle);

		expect(upsertGoogleSync).toHaveBeenCalledWith(
			{ datePropertyId: "Due", assignedToMeOnly: true },
			expect.any(Object),
		);
	});

	it("hides the assignee filter when the database has no Person property", () => {
		google = connectedStatus({
			datePropertyId: "Due",
			assignedToMeOnly: false,
			lastSyncedAt: null,
			lastError: null,
		});
		open([property("Due", PropertyType.DATE, 0)]);

		expect(screen.queryByRole("menuitemcheckbox")).not.toBeInTheDocument();
	});

	it("asks to reconnect when Google access was revoked", () => {
		google = connectedStatus(
			{ datePropertyId: "Due", assignedToMeOnly: false, lastSyncedAt: null, lastError: null },
			"ACCESS_REVOKED",
		);
		open([property("Due", PropertyType.DATE, 0)]);

		expect(
			screen.getByRole("button", { name: "Reconnect Google Calendar" }),
		).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Sync now" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Disconnect Google" }));
		expect(disconnectGoogle).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));
		expect(disconnectGoogle).toHaveBeenCalled();
	});

	it("warns that Google calendars will be deleted and cancels without disconnecting", () => {
		google = connectedStatus();
		open([property("Due", PropertyType.DATE, 0)]);

		fireEvent.click(screen.getByRole("button", { name: "Disconnect Google" }));

		expect(
			screen.getByRole("alertdialog", { name: "Disconnect Google Calendar?" }),
		).toHaveTextContent("Every Taskmanly calendar created in your Google Calendar will be deleted");
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(
			screen.queryByRole("alertdialog", { name: "Disconnect Google Calendar?" }),
		).not.toBeInTheDocument();
		expect(disconnectGoogle).not.toHaveBeenCalled();
	});

	it("reports the Google sign-in result and clears it from the address", () => {
		window.history.replaceState(null, "", "/pages/p-1?view=v-1&googleCalendar=connected");

		render(<DatabaseCalendarFeedPopover databaseId='db-1' properties={[]} />);

		expect(toast.success).toHaveBeenCalledWith(
			expect.stringContaining("Google Calendar connected"),
			{ id: "googleCalendar" },
		);
		expect(`${window.location.pathname}${window.location.search}`).toBe(
			"/pages/p-1?view=v-1",
		);
	});
});
