import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { LeaveWorkspaceDialog } from "@/features/workspace-settings/ui/sections/people/LeaveWorkspaceDialog";
import { PersonRow } from "@/features/workspace-settings/ui/sections/people/PersonRow";

function person(role: "OWNER" | "MEMBER", userId = "current-user"): WorkspacePerson {
	return {
		id: `membership-${userId}`,
		workspace_id: "workspace-1",
		user_id: userId,
		full_name: "Test User",
		email: "test@example.com",
		avatar_url: null,
		membership_type: "MEMBER",
		role_name: role,
		joinedAt: null,
		lastOpenedAt: null,
	};
}

async function renderAndOpenRoleMenu(member: WorkspacePerson, currentUserId: string) {
	const onRequestLeave = vi.fn();
	render(
		<PersonRow
			person={member}
			currentUserId={currentUserId}
			canUpdateRole
			canRemoveMember={false}
			isRoleUpdating={false}
			onRoleChange={vi.fn()}
			onRequestLeave={onRequestLeave}
			onRequestRemove={vi.fn()}
		/>,
	);

	await userEvent.click(screen.getByRole("button", { name: /Role for/i }));
	return onRequestLeave;
}

describe("workspace leave action", () => {
	it.each(["MEMBER", "OWNER"] as const)(
		"shows Leave workspace for the current %s",
		async (role) => {
			await renderAndOpenRoleMenu(person(role), "current-user");
			expect(
				screen.getByRole("menuitem", { name: "Leave workspace" }),
			).toBeInTheDocument();
		},
	);

	it.each(["MEMBER", "OWNER"] as const)(
		"hides Leave workspace for another %s",
		async (role) => {
			await renderAndOpenRoleMenu(person(role, "other-user"), "current-user");
			expect(
				screen.queryByRole("menuitem", { name: "Leave workspace" }),
			).not.toBeInTheDocument();
		},
	);

	it("opens through the leave request without treating leave as a role", async () => {
		const onRequestLeave = await renderAndOpenRoleMenu(
			person("MEMBER"),
			"current-user",
		);
		await userEvent.click(
			screen.getByRole("menuitem", { name: "Leave workspace" }),
		);
		expect(onRequestLeave).toHaveBeenCalledWith(person("MEMBER"));
	});

	it("uses destructive last-owner copy and disables confirmation while pending", () => {
		render(
			<LeaveWorkspaceDialog
				open
				isLastOwner
				isSubmitting
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
			/>,
		);
		expect(
			screen.getByRole("heading", { name: "Leave and delete workspace?" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Leaving..." })).toBeDisabled();
	});
});
