import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageTrashPopover } from "@/features/page/trash/ui/page-trash-popover";

const access = vi.hoisted(() => ({ permissions: [] as string[] }));

vi.mock("@/entities/workspace/model/workspace.queries", () => ({
	useWorkspaceAccess: () => ({ data: access }),
}));

vi.mock("@/entities/page/model/page.queries", () => ({
	useTrashPages: () => ({
		data: [
			{
				id: "page-1",
				title: "Old notes",
				icon: null,
				parent_page_id: null,
				teamspace_id: null,
				deletedAt: "2026-11-10T00:00:00.000Z",
			},
		],
		isLoading: false,
	}),
	useDeletedWorkspaceDatabases: () => ({ data: [], isLoading: false }),
	usePagesByWorkspace: () => ({ data: [] }),
}));

vi.mock("@/entities/page/model/page.mutations", () => {
	const mutation = () => ({ mutate: vi.fn(), isPending: false });
	return {
		useRestorePage: mutation,
		useRestoreDatabase: mutation,
		useDeletePagePermanently: mutation,
		useDeleteDatabasePermanently: mutation,
	};
});

async function openTrash() {
	render(
		<PageTrashPopover workspaceId='workspace'>
			<button type='button'>Trash</button>
		</PageTrashPopover>,
	);
	await userEvent.click(screen.getByRole("button", { name: "Trash" }));
	await screen.findByText("Old notes");
}

describe("PageTrashPopover", () => {
	beforeEach(() => {
		access.permissions = [];
	});

	it("lets a member restore but not delete permanently", async () => {
		access.permissions = ["page.delete"];

		await openTrash();

		expect(screen.getByTitle("Restore")).toBeInTheDocument();
		expect(screen.queryByTitle("Delete permanently")).toBeNull();
		expect(
			screen.getByText(/Only workspace owners can delete them permanently/),
		).toBeInTheDocument();
	});

	it("shows permanent delete to the owner", async () => {
		access.permissions = ["page.delete", "page.permanent_delete"];

		await openTrash();

		expect(screen.getByTitle("Delete permanently")).toBeInTheDocument();
	});
});
