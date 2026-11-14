import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { teamspaceApi } from "@/entities/teamspace/api/teamspace.api";
import { workspaceApi } from "@/entities/workspace/api/workspace.api";
import { BrowseTeamspacesDialog } from "@/features/teamspace/browse-teamspaces/ui/browse-teamspaces-dialog";

import { renderWithClient } from "../utils/test-utils";

vi.mock("@/entities/teamspace/api/teamspace.api", () => ({
	teamspaceApi: {
		discover: vi.fn(),
		getArchived: vi.fn(),
		getPrivateSummaries: vi.fn(),
		join: vi.fn(),
		restore: vi.fn(),
	},
}));
vi.mock("@/entities/workspace/api/workspace.api", () => ({
	workspaceApi: { getAccess: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const teamspaces = vi.mocked(teamspaceApi);
const workspaces = vi.mocked(workspaceApi);

function arrange(role: "OWNER" | "MEMBER") {
	workspaces.getAccess.mockResolvedValue({
		user_id: "me",
		workspace_id: "ws-1",
		membership_type: "MEMBER",
		roles: [role],
		permissions: [],
	});
	teamspaces.discover.mockResolvedValue({
		items: [
			{
				id: "ts-open",
				workspaceId: "ws-1",
				name: "Design",
				description: null,
				visibility: "OPEN",
				isMember: false,
			},
		],
		total: 1,
		page: 1,
		limit: 100,
	});
	teamspaces.getArchived.mockResolvedValue([]);
	teamspaces.getPrivateSummaries.mockResolvedValue([
		{
			id: "ts-private",
			name: "Finance",
			icon: null,
			visibility: "PRIVATE",
			ownerNames: ["Bob Builder"],
			memberCount: 2,
		},
	]);
}

function open() {
	renderWithClient(
		<BrowseTeamspacesDialog workspaceId='ws-1' open onOpenChange={vi.fn()} />,
	);
}

describe("BrowseTeamspacesDialog private group", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows a workspace owner the private teamspaces they have not joined, without Join", async () => {
		arrange("OWNER");
		open();

		const row = (await screen.findByText("Finance")).closest("li");
		expect(row).not.toBeNull();
		const scoped = within(row as HTMLElement);
		expect(scoped.getByText("Owner: Bob Builder · 2 members")).toBeInTheDocument();
		expect(scoped.getByText("Invite only")).toBeInTheDocument();
		expect(scoped.queryByRole("button")).toBeNull();
		expect(teamspaces.getPrivateSummaries).toHaveBeenCalledWith(
			"ws-1",
			expect.anything(),
		);
	});

	it("does not ask for private teamspaces as a workspace member", async () => {
		arrange("MEMBER");
		open();

		await screen.findByText("Design");
		expect(screen.queryByText("Private")).toBeNull();
		expect(teamspaces.getPrivateSummaries).not.toHaveBeenCalled();
	});
});
