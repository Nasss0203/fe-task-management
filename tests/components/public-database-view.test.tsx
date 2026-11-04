import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";

const block = (database: unknown) =>
	({
		id: "block-1",
		page_id: "page-1",
		parent_block_id: null,
		type: PageBlockType.DATABASE_VIEW,
		content: null,
		style_config: null,
		data_config: null,
		is_open: false,
		order_index: 0,
		children: [],
		database,
	}) as never;

describe("database view on a public site", () => {
	it("renders the read-only table the API sends for the block", () => {
		render(
			<ReadOnlyPageBlockRenderer
				disableDatabaseView
				block={block({
					id: "db",
					name: "Tasks",
					view: {
						id: "view-1",
						name: "All tasks",
						type: "TABLE",
						properties: [
							{ propertyId: "name", position: "0", visible: true },
							{ propertyId: "status", position: "1", visible: true },
						],
					},
					properties: [
						{ id: "name", name: "Name", type: "TITLE", isHideable: false, position: "0", options: [] },
						{
							id: "status",
							name: "Status",
							type: "SELECT",
							isHideable: true,
							position: "1",
							options: [{ id: "done", name: "Done", color: "green" }],
						},
					],
					rows: [
						{
							id: "row-1",
							values: [
								{ propertyId: "name", value: "Ship it" },
								{ propertyId: "status", value: "done" },
							],
						},
					],
				})}
			/>,
		);

		expect(screen.getByText("All tasks")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: /Status/ })).toBeInTheDocument();
		expect(screen.getByText("Ship it")).toBeInTheDocument();
		expect(screen.getByText("Done")).toBeInTheDocument();
	});

	it("says the database is not available when the API sends none", () => {
		render(<ReadOnlyPageBlockRenderer disableDatabaseView block={block(null)} />);

		expect(screen.getByText("This database is not available.")).toBeInTheDocument();
	});
});
