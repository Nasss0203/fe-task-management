import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { workspaceMemberApi } from "@/entities/workspace-member/api/workspace-member.api";
import { useRemoveWorkspaceMember } from "@/entities/workspace-member/model/workspace-member.mutations";
import { workspaceMemberKeys } from "@/entities/workspace-member/model/workspace-member.queries";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";
import { PersonRow } from "@/features/workspace-settings/ui/sections/people/PersonRow";
import { RemoveWorkspaceMemberDialog } from "@/features/workspace-settings/ui/sections/people/RemoveWorkspaceMemberDialog";

function person(
	role: "OWNER" | "MEMBER" | null,
	membershipType: "MEMBER" | "GUEST" = "MEMBER",
	userId = "other-user",
): WorkspacePerson {
	return {
		id: `membership-${userId}`,
		workspace_id: "workspace-1",
		user_id: userId,
		full_name: "Test User",
		email: "test@example.com",
		avatar_url: null,
		membership_type: membershipType,
		role_name: role,
		joinedAt: null,
		lastOpenedAt: null,
	};
}

async function openPersonMenu(
	member: WorkspacePerson,
	options: { currentUserId?: string; canRemoveMember?: boolean } = {},
) {
	const onRequestRemove = vi.fn();
	render(
		<PersonRow
			person={member}
			currentUserId={options.currentUserId ?? "current-user"}
			canUpdateRole={member.membership_type === "MEMBER"}
			canRemoveMember={options.canRemoveMember ?? true}
			isRoleUpdating={false}
			onRoleChange={vi.fn()}
			onRequestLeave={vi.fn()}
			onRequestRemove={onRequestRemove}
		/>,
	);
	await userEvent.click(screen.getByRole("button", { name: /Role for/i }));
	return onRequestRemove;
}

describe("workspace remove member action", () => {
	it("keeps Leave for self and does not show Remove", async () => {
		await openPersonMenu(person("MEMBER", "MEMBER", "current-user"), {
			currentUserId: "current-user",
		});
		expect(screen.getByRole("menuitem", { name: "Leave workspace" })).toBeInTheDocument();
		expect(screen.queryByRole("menuitem", { name: "Remove from workspace" })).not.toBeInTheDocument();
	});

	it("shows Remove for another member with permission", async () => {
		await openPersonMenu(person("MEMBER"));
		expect(screen.getByRole("menuitem", { name: "Remove from workspace" })).toBeInTheDocument();
	});

	it("does not expose a menu for another member without permissions", () => {
		render(
			<PersonRow person={person("MEMBER")} currentUserId='current-user' canUpdateRole={false} canRemoveMember={false} isRoleUpdating={false} onRoleChange={vi.fn()} onRequestLeave={vi.fn()} onRequestRemove={vi.fn()} />,
		);
		expect(screen.queryByRole("button", { name: /Role for/i })).not.toBeInTheDocument();
	});

	it("does not show Remove for another owner", async () => {
		await openPersonMenu(person("OWNER"));
		expect(screen.queryByRole("menuitem", { name: "Remove from workspace" })).not.toBeInTheDocument();
	});

	it("shows Remove for a guest with permission", async () => {
		await openPersonMenu(person(null, "GUEST"));
		expect(screen.getByRole("menuitem", { name: "Remove from workspace" })).toBeInTheDocument();
	});

	it("requests confirmation when Remove is clicked", async () => {
		const target = person("MEMBER");
		const onRequestRemove = await openPersonMenu(target);
		await userEvent.click(screen.getByRole("menuitem", { name: "Remove from workspace" }));
		expect(onRequestRemove).toHaveBeenCalledWith(target);
	});

	it("does not confirm on cancel and disables duplicate confirmation", async () => {
		const onConfirm = vi.fn();
		const onOpenChange = vi.fn();
		const { rerender } = render(
			<RemoveWorkspaceMemberDialog open person={person("MEMBER")} isSubmitting={false} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
		);
		await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(onConfirm).not.toHaveBeenCalled();

		rerender(
			<RemoveWorkspaceMemberDialog open person={person("MEMBER")} isSubmitting onOpenChange={onOpenChange} onConfirm={onConfirm} />,
		);
		expect(screen.getByRole("button", { name: "Removing..." })).toBeDisabled();
	});

	it("calls the remove API and invalidates only the people query", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const removeSpy = vi.spyOn(workspaceMemberApi, "removeMember").mockResolvedValue();
		const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
		const { result } = renderHook(() => useRemoveWorkspaceMember(), { wrapper });

		await act(async () => {
			await result.current.mutateAsync({ workspaceId: "workspace-1", userId: "other-user" });
		});

		expect(removeSpy).toHaveBeenCalledWith("workspace-1", "other-user");
		await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: workspaceMemberKeys.people("workspace-1") }));
	});
});
