import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { teamspaceApi } from "@/entities/teamspace/api/teamspace.api";
import type { MyTeamspaceInvitation } from "@/entities/teamspace/model/teamspace.types";
import { JoinTeamspaceByLinkPage } from "@/features/teamspace/join-by-link/ui/join-teamspace-by-link-page";
import { TeamspaceInvitationsPage } from "@/widgets/teamspace-invitations";

import { renderWithClient } from "../utils/test-utils";

vi.mock("@/entities/teamspace/api/teamspace.api", () => ({
	teamspaceApi: {
		getMyInvitations: vi.fn(),
		acceptInvitation: vi.fn(),
		declineInvitation: vi.fn(),
		joinByLink: vi.fn(),
	},
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) => (
		<a href={href}>{children}</a>
	),
}));

const params = vi.hoisted(() => ({ token: "" }));
vi.mock("next/navigation", () => ({ useParams: () => params }));

const api = vi.mocked(teamspaceApi);

function invitation(
	overrides: Partial<MyTeamspaceInvitation> = {},
): MyTeamspaceInvitation {
	return {
		id: "inv-1",
		teamspaceId: "ts-1",
		status: "PENDING",
		expiresAt: "2026-11-01T00:00:00.000Z",
		acceptedAt: null,
		createdAt: "2026-10-24T00:00:00.000Z",
		teamspaceName: "Backend",
		teamspaceIcon: "🚀",
		workspaceId: "ws-1",
		workspaceName: "Acme",
		inviterName: "alice",
		...overrides,
	};
}

function apiError(message: string, status: number) {
	return new AxiosError(message, String(status), undefined, undefined, {
		data: { message },
		status,
		statusText: "",
		headers: {},
		config: { headers: new AxiosHeaders() },
	});
}

describe("TeamspaceInvitationsPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("shows pending invitations with names and past ones in history", async () => {
		api.getMyInvitations.mockResolvedValue([
			invitation(),
			invitation({ id: "inv-2", teamspaceName: "Design", status: "EXPIRED" }),
			invitation({ id: "inv-3", teamspaceName: "Ops", status: "ACCEPTED" }),
		]);

		renderWithClient(<TeamspaceInvitationsPage />);

		expect(await screen.findByText("Backend")).toBeInTheDocument();
		expect(screen.getByText("alice")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: /Pending/ })).toHaveTextContent("1");
		expect(screen.getByText("Expired")).toBeInTheDocument();
		expect(screen.getByText("Joined")).toBeInTheDocument();
	});

	it("accepts an invitation and refreshes the list", async () => {
		api.getMyInvitations
			.mockResolvedValueOnce([invitation()])
			.mockResolvedValue([invitation({ status: "ACCEPTED" })]);
		api.acceptInvitation.mockResolvedValue(invitation({ status: "ACCEPTED" }));

		renderWithClient(<TeamspaceInvitationsPage />);
		await userEvent.click(await screen.findByRole("button", { name: "Accept" }));

		expect(api.acceptInvitation).toHaveBeenCalledWith("inv-1");
		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"You joined Backend",
				expect.anything(),
			),
		);
		expect(await screen.findByText("No pending invitations")).toBeInTheDocument();
	});

	it("shows the backend reason when an invitation can no longer be accepted", async () => {
		api.getMyInvitations.mockResolvedValue([invitation()]);
		api.acceptInvitation.mockRejectedValue(
			apiError("Teamspace invitation is no longer valid", 409),
		);

		renderWithClient(<TeamspaceInvitationsPage />);
		await userEvent.click(await screen.findByRole("button", { name: "Accept" }));

		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Teamspace invitation is no longer valid",
			),
		);
	});

	it("declines an invitation", async () => {
		api.getMyInvitations.mockResolvedValue([invitation()]);
		api.declineInvitation.mockResolvedValue(invitation({ status: "DECLINED" }));

		renderWithClient(<TeamspaceInvitationsPage />);
		await userEvent.click(await screen.findByRole("button", { name: "Decline" }));

		expect(api.declineInvitation).toHaveBeenCalledWith("inv-1");
	});
});

describe("JoinTeamspaceByLinkPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects a malformed token without calling the API", () => {
		params.token = "not-a-token";

		renderWithClient(<JoinTeamspaceByLinkPage />);

		expect(screen.getByText("This invite link is not valid")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Join teamspace" })).not.toBeInTheDocument();
		expect(api.joinByLink).not.toHaveBeenCalled();
	});

	it("joins only after the user clicks", async () => {
		params.token = "a".repeat(43);
		api.joinByLink.mockResolvedValue({
			id: "m-1",
			teamspaceId: "ts-1",
			workspaceMemberId: "wm-1",
			roleName: "MEMBER",
			joinedAt: "",
			createdAt: "",
			updatedAt: "",
		});

		renderWithClient(<JoinTeamspaceByLinkPage />);
		expect(api.joinByLink).not.toHaveBeenCalled();

		await userEvent.click(screen.getByRole("button", { name: "Join teamspace" }));

		expect(api.joinByLink).toHaveBeenCalledWith("a".repeat(43));
		expect(await screen.findByText("You're in")).toBeInTheDocument();
	});

	it("explains why a link does not work", async () => {
		params.token = "b".repeat(43);
		api.joinByLink.mockRejectedValue(
			apiError("Teamspace invite link is no longer valid", 409),
		);

		renderWithClient(<JoinTeamspaceByLinkPage />);
		await userEvent.click(screen.getByRole("button", { name: "Join teamspace" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Teamspace invite link is no longer valid",
		);
	});
});
