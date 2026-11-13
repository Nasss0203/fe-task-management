import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageTrashPopover } from "@/features/page/trash/ui/page-trash-popover";

const access = vi.hoisted(() => ({ permissions: [] as string[] }));
const archived = vi.hoisted(() => ({
	teamspaces: [] as Array<{
		id: string;
		name: string;
		icon: string | null;
		updatedAt: string;
	}>,
}));
const restoreTeamspace = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/entities/teamspace/model/teamspace.queries", () => ({
	useArchivedTeamspaces: () => ({
		data: archived.teamspaces,
		isLoading: false,
	}),
}));

vi.mock("@/entities/teamspace/model/teamspace.mutations", () => ({
	useRestoreTeamspace: () => ({ mutate: restoreTeamspace, isPending: false }),
}));

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
		archived.teamspaces = [];
		restoreTeamspace.mockReset();
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

	it("lists an archived teamspace and restores it without permanent delete", async () => {
		access.permissions = ["page.delete", "page.permanent_delete"];
		archived.teamspaces = [
			{
				id: "ts-1",
				name: "Finance",
				icon: null,
				updatedAt: "2026-11-13T08:45:13.844Z",
			},
		];

		await openTrash();

		const row = screen.getByText("Finance").closest("[class*='group/trash']");
		expect(row).not.toBeNull();
		const scoped = within(row as HTMLElement);
		expect(scoped.getByText(/Teamspace · Deleted Nov 13, 2026/)).toBeInTheDocument();
		expect(scoped.queryByTitle("Delete permanently")).toBeNull();

		await userEvent.click(scoped.getByTitle("Restore"));

		expect(restoreTeamspace).toHaveBeenCalledWith("ts-1", expect.any(Object));
	});
});
