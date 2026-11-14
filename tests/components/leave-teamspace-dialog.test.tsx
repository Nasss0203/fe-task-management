import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { teamspaceApi } from "@/entities/teamspace/api/teamspace.api";
import type {
	Teamspace,
	TeamspaceMember,
	TeamspaceRole,
} from "@/entities/teamspace/model/teamspace.types";
import { workspaceApi } from "@/entities/workspace/api/workspace.api";
import { workspaceMemberApi } from "@/entities/workspace-member/api/workspace-member.api";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { LeaveTeamspaceDialog } from "@/features/teamspace/manage-teamspace/ui/leave-teamspace-dialog";

import { renderWithClient } from "../utils/test-utils";

vi.mock("@/entities/teamspace/api/teamspace.api", () => ({
	teamspaceApi: { getMembers: vi.fn(), leave: vi.fn() },
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
	icon: null,
	visibility: "PRIVATE",
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

function member(
	workspaceMemberId: string,
	roleName: TeamspaceRole,
	joinedAt: string,
): TeamspaceMember {
	return {
		id: `tm-${workspaceMemberId}`,
		teamspaceId: "ts-1",
		workspaceMemberId,
		roleName,
		joinedAt,
		createdAt: "",
		updatedAt: "",
	};
}

function arrange(members: TeamspaceMember[]) {
	people.getPeople.mockResolvedValue([
		person("wm-me", "me", "Me Myself"),
		person("wm-bob", "bob", "Bob Builder"),
		person("wm-cara", "cara", "Cara Candidate"),
	]);
	workspaces.getAccess.mockResolvedValue({
		user_id: "me",
		workspace_id: "ws-1",
		membership_type: "MEMBER",
		roles: ["MEMBER"],
		permissions: [],
	});
	teamspaces.getMembers.mockResolvedValue(members);
	teamspaces.leave.mockResolvedValue(undefined);
}

const onClose = vi.fn();

function open() {
	renderWithClient(<LeaveTeamspaceDialog teamspace={teamspace} onClose={onClose} />);
}

const me = (role: TeamspaceRole) => member("wm-me", role, "2026-11-01T00:00:00.000Z");
const cara = member("wm-cara", "MEMBER", "2026-11-05T00:00:00.000Z");
const bob = member("wm-bob", "MEMBER", "2026-11-03T00:00:00.000Z");

describe("LeaveTeamspaceDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("makes the last owner pick a new owner, defaulting to the earliest member", async () => {
		arrange([me("OWNER"), cara, bob]);
		open();

		const earliest = await screen.findByRole("radio", { name: /Bob Builder/ });
		expect(earliest).toHaveAttribute("aria-checked", "true");

		await userEvent.click(screen.getByRole("radio", { name: /Cara Candidate/ }));
		await userEvent.click(screen.getByRole("button", { name: "Transfer and leave" }));

		await waitFor(() =>
			expect(teamspaces.leave).toHaveBeenCalledWith("ts-1", "tm-wm-cara"),
		);
		expect(onClose).toHaveBeenCalled();
	});

	it("warns the only member that the teamspace will be archived", async () => {
		arrange([me("OWNER")]);
		open();

		await screen.findByText(/Leaving archives it/);
		expect(screen.queryByRole("radiogroup")).toBeNull();

		await userEvent.click(screen.getByRole("button", { name: "Leave and archive" }));

		await waitFor(() =>
			expect(teamspaces.leave).toHaveBeenCalledWith("ts-1", undefined),
		);
	});

	it("lets a member leave without choosing", async () => {
		arrange([me("MEMBER"), member("wm-bob", "OWNER", "2026-11-02T00:00:00.000Z")]);
		open();

		const leave = await screen.findByRole("button", { name: "Leave teamspace" });
		await waitFor(() => expect(leave).toBeEnabled());
		expect(screen.queryByRole("radiogroup")).toBeNull();

		await userEvent.click(leave);

		await waitFor(() =>
			expect(teamspaces.leave).toHaveBeenCalledWith("ts-1", undefined),
		);
	});

	it("keeps the dialog open when the server still asks for a new owner", async () => {
		arrange([me("MEMBER"), bob]);
		teamspaces.leave.mockRejectedValue(
			new AxiosError("Conflict", "ERR_BAD_REQUEST", undefined, undefined, {
				status: 409,
				data: { code: "TEAMSPACE_OWNER_TRANSFER_REQUIRED" },
			} as AxiosResponse),
		);
		open();

		const leave = await screen.findByRole("button", { name: "Leave teamspace" });
		await waitFor(() => expect(leave).toBeEnabled());
		await userEvent.click(leave);

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Choose a new owner before leaving this teamspace.",
			),
		);
		expect(onClose).not.toHaveBeenCalled();
	});
});
