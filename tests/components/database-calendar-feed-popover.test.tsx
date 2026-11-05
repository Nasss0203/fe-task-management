import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { DatabaseCalendarFeedPopover } from "@/widgets/database-view/ui/database-calendar-feed-popover";

const upsert = vi.fn();
const revoke = vi.fn();
let feed: { token: string; datePropertyId: string } | null = null;

vi.mock("@/entities/database/model/database.queries", () => ({
	useCalendarFeed: () => ({ data: feed, isLoading: false }),
}));
vi.mock("@/entities/database/model/database.mutations", () => ({
	useUpsertCalendarFeed: () => ({ mutate: upsert, isPending: false }),
	useRevokeCalendarFeed: () => ({ mutate: revoke, isPending: false }),
}));

const property = (id: string, type: PropertyType, position: number) =>
	({ id, name: id, type, position }) as unknown as DatabaseProperty;

const open = (properties: DatabaseProperty[]) => {
	render(<DatabaseCalendarFeedPopover databaseId='db-1' properties={properties} />);
	fireEvent.click(screen.getByRole("button", { name: "Subscribe in a calendar app" }));
};

beforeEach(() => {
	feed = null;
	upsert.mockReset();
	revoke.mockReset();
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
});
