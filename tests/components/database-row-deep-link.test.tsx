import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
	DatabaseViewType,
	type Database,
	type DatabaseRow,
	type DatabaseView,
	type DatabaseViewDetail,
} from "@/entities/database/model/database.types";
import { DatabaseViewRenderer } from "@/widgets/database-view/ui/database-view-renderer";

// useSearchParams đọc URL hiện tại, như Next khi đổi trang / bấm Link
vi.mock("next/navigation", () => ({
	useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock("@/widgets/database-view/ui/table-view", () => ({ TableView: () => null }));
vi.mock("@/widgets/database-view/ui/row-detail-sheet", () => ({
	RowDetailSheet: (props: { row?: DatabaseRow; scrollToComments?: boolean }) => (
		<div
			data-testid='sheet'
			data-row={props.row?.id ?? ""}
			data-comments={String(Boolean(props.scrollToComments))}
		/>
	),
}));

const database = { id: "db-1", pageId: "page-1", properties: [] } as unknown as Database;
const view = { id: "view-1", type: DatabaseViewType.TABLE } as unknown as DatabaseView;
const viewDetail = { groupBy: null } as unknown as DatabaseViewDetail;
const rows = [{ id: "row-1" }, { id: "row-2" }] as unknown as DatabaseRow[];

const renderer = () => (
	<DatabaseViewRenderer database={database} view={view} viewDetail={viewDetail} rows={rows} />
);

afterEach(() => {
	window.history.replaceState(null, "", "/");
});

describe("database row deep link from a comment notification", () => {
	it("opens the linked row with its comments and clears ?row", async () => {
		window.history.replaceState(null, "", "/page/page-1?row=row-2&x=1");

		render(renderer());

		await waitFor(() => expect(screen.getByTestId("sheet")).toHaveAttribute("data-row", "row-2"));
		expect(screen.getByTestId("sheet")).toHaveAttribute("data-comments", "true");
		expect(window.location.search).toBe("?x=1");
	});

	it("opens when the link is clicked while already on the page (no reload)", async () => {
		window.history.replaceState(null, "", "/page/page-1");
		const view = render(renderer());
		expect(screen.getByTestId("sheet")).toHaveAttribute("data-row", "");

		// Bấm thông báo: Next đổi URL và render lại, bảng không tải lại
		window.history.pushState(null, "", "/page/page-1?row=row-1");
		view.rerender(renderer());

		await waitFor(() => expect(screen.getByTestId("sheet")).toHaveAttribute("data-row", "row-1"));
	});

	it("opens a row hidden by the view filter", async () => {
		window.history.replaceState(null, "", "/page/page-1?row=row-2");

		render(
			<DatabaseViewRenderer
				database={database}
				view={view}
				viewDetail={viewDetail}
				rows={[rows[0]]}
				allRows={rows}
			/>,
		);

		await waitFor(() => expect(screen.getByTestId("sheet")).toHaveAttribute("data-row", "row-2"));
	});

	it("ignores a row that is not in the database", () => {
		window.history.replaceState(null, "", "/page/page-1?row=row-9");

		render(renderer());

		expect(screen.getByTestId("sheet")).toHaveAttribute("data-row", "");
		expect(window.location.search).toBe("?row=row-9");
	});
});
