import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	PropertyType,
	type Database,
	type DatabaseRow,
} from "@/entities/database/model/database.types";
import { RowPageView } from "@/widgets/database-view/ui/row-page-view";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const state = vi.hoisted(() => ({
	page: { id: "page-1", title: "Sprint", canEdit: true } as unknown,
	database: undefined as unknown,
	rows: [] as unknown[],
}));
vi.mock("@/entities/page/model/page.queries", () => ({
	usePage: () => ({ data: state.page, isLoading: false, error: null }),
}));
vi.mock("@/entities/database/model/database.queries", () => ({
	useDatabaseRow: (rowId: string) => ({
		data: { id: rowId, databaseId: "db-1" },
		isLoading: false,
		error: null,
	}),
	useDatabase: () => ({ data: state.database, isLoading: false }),
	useDatabaseRows: () => ({ data: state.rows, isLoading: false }),
}));
vi.mock("@/widgets/database-view/ui/row-detail-body", () => ({
	RowDetailBody: (props: { row: DatabaseRow; readOnly: boolean }) => (
		<div data-testid='body' data-row={props.row.id} data-readonly={String(props.readOnly)} />
	),
}));

const row = (id: string, title: string, parentRowId: string | null = null) =>
	({
		id,
		databaseId: "db-1",
		parentRowId,
		values: [{ id: `${id}-t`, propertyId: "title", value: title }],
	}) as DatabaseRow;

beforeEach(() => {
	state.page = { id: "page-1", title: "Sprint", canEdit: true };
	state.database = {
		id: "db-1",
		pageId: "page-1",
		name: "Tasks",
		properties: [{ id: "title", type: PropertyType.TITLE, options: [] }],
	} as unknown as Database;
	state.rows = [row("parent", "Release"), row("child", "Smoke test", "parent")];
});

describe("RowPageView", () => {
	it("shows the task with a breadcrumb back to its database and parent task", () => {
		render(<RowPageView pageId='page-1' rowId='child' />);

		expect(screen.getByTestId("body")).toHaveAttribute("data-row", "child");
		expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute("href", "/page/page-1");
		expect(screen.getByRole("link", { name: "Release" })).toHaveAttribute(
			"href",
			"/page/page-1/row/parent",
		);
		expect(screen.getByRole("link", { name: "Open in side peek" })).toHaveAttribute(
			"href",
			"/page/page-1?row=child",
		);
	});

	it("is read only for someone who can only view the page", () => {
		state.page = { id: "page-1", title: "Sprint", canEdit: false };
		render(<RowPageView pageId='page-1' rowId='child' />);

		expect(screen.getByTestId("body")).toHaveAttribute("data-readonly", "true");
	});

	it("refuses a link that pairs the task with another page", () => {
		render(<RowPageView pageId='page-2' rowId='child' />);

		expect(screen.queryByTestId("body")).not.toBeInTheDocument();
		expect(screen.getByText("Page not found")).toBeInTheDocument();
	});
});
