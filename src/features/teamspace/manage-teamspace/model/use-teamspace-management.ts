"use client";

import { useMemo } from "react";

import { useTeamspaceMembers } from "@/entities/teamspace/model/teamspace.queries";
import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";
import { useWorkspaceAccess } from "@/entities/workspace/model/workspace.queries";
import { useWorkspacePeople } from "@/entities/workspace-member/model/workspace-member.queries";
import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";

/**
 * Members of a teamspace joined with workspace people (names, emails, avatars),
 * plus whether the current user may manage the teamspace.
 */
export function useTeamspaceManagement(teamspace: Teamspace, enabled: boolean) {
	const membersQuery = useTeamspaceMembers(teamspace.id, enabled);

	const peopleQuery = useWorkspacePeople(teamspace.workspaceId, enabled);

	const accessQuery = useWorkspaceAccess(teamspace.workspaceId);

	const peopleById = useMemo(
		() =>
			new Map<string, WorkspacePerson>(
				(peopleQuery.data ?? []).map((person) => [person.id, person]),
			),
		[peopleQuery.data],
	);

	const currentUserId = accessQuery.data?.user_id ?? null;

	const myMembership = (membersQuery.data ?? []).find(
		(member) =>
			peopleById.get(member.workspaceMemberId)?.user_id === currentUserId,
	);

	// Mirrors the backend: a workspace owner acts as a teamspace owner.
	// The backend still enforces every action; this only decides what to show.
	const canManage = Boolean(
		accessQuery.data?.roles.includes("OWNER") ||
			myMembership?.roleName === "OWNER",
	);

	return {
		membersQuery,
		peopleQuery,
		peopleById,
		currentUserId,
		canManage,
	};
}

export type TeamspaceManagement = ReturnType<typeof useTeamspaceManagement>;

export function getPersonName(person: WorkspacePerson | undefined) {
	if (!person) return "Unknown member";

	return person.full_name.trim() || person.email;
}
