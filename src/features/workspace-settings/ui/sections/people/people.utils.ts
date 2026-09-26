import type { WorkspacePerson } from "@/entities/workspace-member/model/workspace-member.types";

export function matchesPersonSearch(person: WorkspacePerson, search: string) {
	if (!search) return true;

	return (
		person.full_name.toLowerCase().includes(search) ||
		person.email.toLowerCase().includes(search)
	);
}

export function getRoleLabel(role: "OWNER" | "MEMBER" | null) {
	return role === "OWNER" ? "Workspace owner" : "Member";
}

export function getInitials(value: string) {
	const parts = value.trim().split(/\s+/).filter(Boolean);

	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function omitRecordKey<T>(record: Record<string, T>, key: string) {
	const nextRecord = { ...record };
	delete nextRecord[key];
	return nextRecord;
}
