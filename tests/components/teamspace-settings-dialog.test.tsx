import { renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { teamspaceApi } from "@/entities/teamspace/api/teamspace.api";
import type {
	Teamspace,
	TeamspaceMember,
} from "@/entities/teamspace/model/teamspace.types";
import { workspaceApi } from "@/entities/workspace/api/workspace.api";
import { workspaceMemberApi } from "@/entities/workspace-member/api/workspace-member.api";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { useTeamspaceManagement } from "@/features/teamspace/manage-teamspace/model/use-teamspace-management";
import { TeamspaceSettingsDialog } from "@/features/teamspace/manage-teamspace/ui/teamspace-settings-dialog";

import { createWrapper, renderWithClient } from "../utils/test-utils";

vi.mock("@/entities/teamspace/api/teamspace.api", () => ({
	teamspaceApi: {
		getMembers: vi.fn(),
		getPendingInvitations: vi.fn(),
		inviteMember: vi.fn(),
		updateMemberRole: vi.fn(),
		removeMember: vi.fn(),
		revokeInvitation: vi.fn(),
		resendInvitation: vi.fn(),
		createInviteLink: vi.fn(),
		getInviteLinks: vi.fn(),
		revokeInviteLink: vi.fn(),
		updateJoinSettings: vi.fn(),
	},
}));
vi.mock("@/entities/workspace/api/workspace.api", () => ({
	workspaceApi: { getAccess: vi.fn() },
}));
vi.mock("@/entities/workspace-member/api/workspace-member.api", () => ({
	workspaceMemberApi: { getPeople: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const teamspaces = vi.mocked(teamspaceApi);
const workspaces = vi.mocked(workspaceApi);
const people = vi.mocked(workspaceMemberApi);

const teamspace: Teamspace = {
	id: "ts-1",
	workspaceId: "ws-1",
	name: "Backend",
	description: null,
	icon: "🚀",
	visibility: "OPEN",
	createdAt: "",
	updatedAt: "",
};

function person(id: string, userId: string, name: string): WorkspacePerson {
	return {
		id,
		workspace_id: "ws-1",
		user_id: userId,
		full_name: name,
		email: `${userId}@example.com`,
		avatar_url: null,
		membership_type: "MEMBER",
		role_name: "MEMBER",
		joinedAt: null,
		lastOpenedAt: null,
	};
}

function member(workspaceMemberId: string, roleName: "OWNER" | "MEMBER"): TeamspaceMember {
	return {
		id: `tm-${workspaceMemberId}`,
		teamspaceId: "ts-1",
		workspaceMemberId,
		roleName,
		joinedAt: "",
		createdAt: "",
		updatedAt: "",
	};
}

/** "me" is a teamspace member with the given role; workspace role is MEMBER unless stated. */
function arrange(options: { myRole?: "OWNER" | "MEMBER"; workspaceOwner?: boolean }) {
	people.getPeople.mockResolvedValue([
		person("wm-me", "me", "Me Myself"),
		person("wm-bob", "bob", "Bob Builder"),
		person("wm-cara", "cara", "Cara Candidate"),
	]);
	workspaces.getAccess.mockResolvedValue({
		user_id: "me",
		workspace_id: "ws-1",
		membership_type: "MEMBER",
		roles: [options.workspaceOwner ? "OWNER" : "MEMBER"],
		permissions: [],
	});
	teamspaces.getMembers.mockResolvedValue([
		...(options.myRole ? [member("wm-me", options.myRole)] : []),
		member("wm-bob", "MEMBER"),
	]);
	teamspaces.getPendingInvitations.mockResolvedValue({
		items: [
			{
				id: "inv-1",
				teamspaceId: "ts-1",
				workspaceMemberId: "wm-cara",
				invitedBy: "me",
				status: "PENDING",
				expiresAt: "2026-11-01T00:00:00.000Z",
				acceptedAt: null,
				createdAt: "",
				updatedAt: "",
			},
		],
		total: 1,
		page: 1,
		limit: 100,
	});
	teamspaces.getInviteLinks.mockResolvedValue([
		{
			id: "link-1",
			teamspaceId: "ts-1",
			createdBy: "me",
			createdAt: "2026-10-20T00:00:00.000Z",
			expiresAt: "2026-10-27T00:00:00.000Z",
			maxUses: 5,
			useCount: 2,
			revokedAt: null,
			status: "ACTIVE",
		},
	]);
}

function renderDialog(initialTab?: "members" | "links" | "access") {
	return renderWithClient(
		<TeamspaceSettingsDialog
			teamspace={teamspace}
			open
			onOpenChange={vi.fn()}
			initialTab={initialTab}
		/>,
	);
}

describe("useTeamspaceManagement.canManage (mirrors backend authorization)", () => {
	beforeEach(() => vi.clearAllMocks());

	it.each([
		["a teamspace owner", { myRole: "OWNER" as const }, true],
		["a teamspace member", { myRole: "MEMBER" as const }, false],
		["a workspace owner outside the teamspace", { workspaceOwner: true }, true],
		["a workspace member outside the teamspace", {}, false],
	])("is %s → %s", async (_label, options, expected) => {
		arrange(options);

		const { result } = renderHook(
			() => useTeamspaceManagement(teamspace, true),
			createWrapper(),
		);

		await waitFor(() => {
			expect(result.current.membersQuery.isSuccess).toBe(true);
			expect(result.current.peopleQuery.isSuccess).toBe(true);
			expect(result.current.currentUserId).toBe("me");
		});
		expect(result.current.canManage).toBe(expected);
	});
});

describe("TeamspaceSettingsDialog", () => {
	beforeEach(() => vi.clearAllMocks());

	it("is read-only for a regular member", async () => {
		arrange({ myRole: "MEMBER" });

		renderDialog();

		expect(await screen.findByText("Bob Builder")).toBeInTheDocument();
		expect(screen.getByText("(you)")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Invite a workspace member/ }),
		).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Role for/ })).not.toBeInTheDocument();
		expect(teamspaces.getPendingInvitations).not.toHaveBeenCalled();
	});

	it("lets an owner manage members and pending invitations", async () => {
		arrange({ myRole: "OWNER" });
		teamspaces.resendInvitation.mockResolvedValue({} as never);
		teamspaces.revokeInvitation.mockResolvedValue();

		renderDialog();

		expect(
			await screen.findByRole("button", { name: /Invite a workspace member/ }),
		).toBeEnabled();
		expect(screen.getByRole("button", { name: "Role for Bob Builder" })).toBeInTheDocument();

		// Cara is invited, so she shows as pending rather than as a candidate.
		expect(await screen.findByText("Cara Candidate")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Resend" }));
		expect(teamspaces.resendInvitation).toHaveBeenCalledWith("inv-1");

		await userEvent.click(screen.getByRole("button", { name: "Revoke" }));
		const confirm = await screen.findByRole("alertdialog");
		await userEvent.click(
			within(confirm).getByRole("button", { name: "Revoke invitation" }),
		);
		expect(teamspaces.revokeInvitation).toHaveBeenCalledWith("inv-1");
	});

	it("hides invite links from regular members", async () => {
		arrange({ myRole: "MEMBER" });

		renderDialog("links");

		expect(
			await screen.findByText("Only teamspace owners can create invite links."),
		).toBeInTheDocument();
		expect(teamspaces.getInviteLinks).not.toHaveBeenCalled();
	});

	it("creates an invite link and shows it once", async () => {
		arrange({ myRole: "OWNER" });
		teamspaces.createInviteLink.mockResolvedValue({
			id: "link-2",
			teamspaceId: "ts-1",
			createdBy: "me",
			createdAt: "2026-10-24T00:00:00.000Z",
			expiresAt: "2026-10-31T00:00:00.000Z",
			maxUses: null,
			useCount: 0,
			revokedAt: null,
			status: "ACTIVE",
			token: "t".repeat(43),
			url: `https://app.example/join/teamspace/${"t".repeat(43)}`,
			relativePath: `/join/teamspace/${"t".repeat(43)}`,
		});

		renderDialog("links");

		expect(await screen.findByText("Used 2 of 5 times")).toBeInTheDocument();

		const before = Date.now();
		await userEvent.click(screen.getByRole("button", { name: /Create link/ }));

		const [teamspaceId, input] = teamspaces.createInviteLink.mock.calls[0];
		expect(teamspaceId).toBe("ts-1");
		expect(input.max_uses).toBeUndefined();
		// Default 7 days, minus the clock-skew margin; never above the 30-day cap.
		const expiresInMs = new Date(input.expires_at!).getTime() - before;
		expect(expiresInMs).toBeGreaterThan(6.9 * 24 * 3600 * 1000);
		expect(expiresInMs).toBeLessThan(7 * 24 * 3600 * 1000);

		expect(await screen.findByLabelText("New invite link")).toHaveValue(
			`https://app.example/join/teamspace/${"t".repeat(43)}`,
		);
		expect(screen.getByText(/shown only once/)).toBeInTheDocument();
	});

	it("switches the teamspace to private", async () => {
		arrange({ myRole: "OWNER" });
		teamspaces.updateJoinSettings.mockResolvedValue({
			...teamspace,
			visibility: "PRIVATE",
		});

		renderDialog("access");

		const privateOption = await screen.findByRole("radio", { name: /Private/ });
		await waitFor(() => expect(privateOption).toBeEnabled());
		await userEvent.click(privateOption);

		expect(teamspaces.updateJoinSettings).toHaveBeenCalledWith("ts-1", "PRIVATE");
	});

	it("disables the access options for a regular member", async () => {
		arrange({ myRole: "MEMBER" });

		renderDialog("access");

		expect(
			await screen.findByText("Only teamspace owners can change who can join."),
		).toBeInTheDocument();
		expect(screen.getByRole("radio", { name: /Private/ })).toBeDisabled();
	});
});
